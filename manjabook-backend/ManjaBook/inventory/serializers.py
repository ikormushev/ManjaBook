from rest_framework import serializers
from django.utils.text import slugify

from unidecode import unidecode

from ManjaBook.accounts.serializers import BaseProfileSerializer
from ManjaBook.inventory.choices import NutritionPerChoices
from ManjaBook.inventory.models import Shop, Product, Unit, CustomUnit, RecipeProduct, Recipe, RecipesCollection, \
    SavedRecipesCollection


class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ['id', 'name']


class ProductBaseSerializer(serializers.ModelSerializer):
    nutrition_per = serializers.ChoiceField(choices=NutritionPerChoices.choices)
    shopped_from = ShopSerializer(many=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'brand', 'shopped_from',
                  'nutrition_per', 'calories', 'protein',
                  'carbohydrates', 'sugars', 'fats',
                  'saturated_fats', 'salt', 'fibre']


class ProductCreateSerializer(ProductBaseSerializer):
    shopped_from = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(), many=True
    )

    def create(self, validated_data):
        shops = validated_data.pop('shopped_from')
        product = Product.objects.create(**validated_data)
        product.shopped_from.set(shops)

        return product


class UnitBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ['id', 'name', 'abbreviation',
                  'base_unit', 'convert_to_base_rate', 'is_customizable']


class CustomUnitBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUnit
        fields = ['id', 'unit', 'custom_convert_to_base_rate']


class CustomUnitListSerializer(CustomUnitBaseSerializer):
    unit = UnitBaseSerializer(read_only=True)


class CustomUnitCreateSerializer(CustomUnitBaseSerializer):
    unit = serializers.PrimaryKeyRelatedField(queryset=Unit.objects.filter(is_customizable=True))

    def validate(self, data):
        unit = data["unit"]
        if not unit.is_customizable:
            raise serializers.ValidationError({'unit': f"The unit {unit.name} is not customizable."})
        return data

    def create(self, validated_data):
        unit = validated_data['unit']
        rate = validated_data['custom_convert_to_base_rate']
        instance, created = CustomUnit.objects.get_or_create(unit=unit, custom_convert_to_base_rate=rate)

        return instance


class RecipeProductSerializer(serializers.ModelSerializer):
    product = ProductBaseSerializer(read_only=True)
    unit = UnitBaseSerializer(read_only=True)
    custom_unit = CustomUnitBaseSerializer(read_only=True)

    class Meta:
        model = RecipeProduct
        fields = ['id', 'product', 'quantity', 'unit', 'custom_unit',
                  'calories', 'protein', 'carbohydrates', 'sugars', 'fats',
                  'saturated_fats', 'salt', 'fibre']


class BaseRecipeSerializer(serializers.ModelSerializer):
    total_nutrients = serializers.SerializerMethodField()
    created_by = BaseProfileSerializer(read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'name', 'quick_description',
                  'time_to_cook', 'time_to_prepare',
                  'slug', 'image', 'created_by', 'total_nutrients']
        read_only_fields = ['id', 'slug', 'created_by', 'total_nutrients']

    def get_total_nutrients(self, obj):
        return obj.calculate_total_nutrients()


class RecipeDetailSerializer(BaseRecipeSerializer):
    products = RecipeProductSerializer(source='recipe_products', many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta(BaseRecipeSerializer.Meta):
        fields = BaseRecipeSerializer.Meta.fields + ['portions', 'products', 'preparation', 'created_at', 'is_owner']

    def get_is_owner(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            return obj.created_by.user == request.user
        return False

    def update(self, instance, validated_data):
        if 'name' in validated_data:
            instance.slug = slugify(unidecode(validated_data['name']))

        return super().update(instance, validated_data)


class RecipeProductCreateSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product')
    unit_id = serializers.PrimaryKeyRelatedField(queryset=Unit.objects.all(), source='unit')
    custom_unit_id = serializers.PrimaryKeyRelatedField(queryset=CustomUnit.objects.all(), source='custom_unit',
                                                        required=False)

    class Meta:
        model = RecipeProduct
        fields = ['product_id', 'quantity', 'unit_id', 'custom_unit_id']


class RecipeCreateSerializer(serializers.ModelSerializer):
    products = serializers.JSONField()
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Recipe
        fields = ['name', 'quick_description', 'portions', 'time_to_cook',
                  'time_to_prepare', 'preparation', 'products', 'image']

    def create(self, validated_data):
        products_data = validated_data.pop('products', [])
        if not products_data:
            raise serializers.ValidationError({'products': "No products provided."})

        recipe = Recipe.objects.create(**validated_data)

        for product_data in products_data:
            recipe_product = RecipeProduct(recipe=recipe, **product_data)
            recipe_product.save()

        return recipe

    def to_representation(self, instance):
        response = RecipeDetailSerializer(instance=instance).data
        return response


class BaseRecipesCollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipesCollection
        fields = ['id', 'created_by', 'recipes', 'image', 'is_private', 'created_at']
        read_only_fields = ['id', 'created_at', 'created_by']


class RecipesCollectionSerializer(BaseRecipesCollectionSerializer):
    recipes = BaseRecipeSerializer(many=True, read_only=True)


class RecipesCollectionCreateSerializer(BaseRecipesCollectionSerializer):
    recipes = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all(), many=True)


class RecipesCollectionDetailSerializer(BaseRecipesCollectionSerializer):
    ...


class SavedRecipesCollectionBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedRecipesCollection
        fields = ['id', 'user', 'recipes_collection', 'saved_at']
        read_only_fields = ['id', 'saved_at']


class SavedRecipesCollectionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedRecipesCollection
        fields = ['user', 'recipes_collection']

    def validate(self, data):
        user = data['user']
        recipes_collection = data['recipes_collection']
        if SavedRecipesCollection.objects.filter(user=user, recipes_collection=recipes_collection).exists():
            raise serializers.ValidationError("This collection is already saved by the user.")
        return data


class SavedRecipesCollectionDetailSerializer(SavedRecipesCollectionBaseSerializer):
    ...
