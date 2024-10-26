from rest_framework import serializers
from rest_framework.fields import ImageField

from ManjaBook.accounts.serializers import BaseProfileSerializer
from ManjaBook.inventory.choices import NutritionPerChoices
from ManjaBook.inventory.models import Shop, Product, Unit, CustomUnit, RecipeProduct, Recipe, RecipesCollection


class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ['id', 'name']


class ProductBaseSerializer(serializers.ModelSerializer):
    nutrition_per = serializers.ChoiceField(choices=NutritionPerChoices.choices)
    shopped_from = ShopSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'brand', 'shopped_from',
                  'nutrition_per', 'calories', 'protein',
                  'carbohydrates', 'sugars', 'fats',
                  'saturated_fats', 'salt', 'fibre']


class ProductCreateSerializer(ProductBaseSerializer):
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

    def get_total_nutrients(self, obj):
        return obj.calculate_total_nutrients()


class RecipeDetailSerializer(BaseRecipeSerializer):
    products = RecipeProductSerializer(source='recipe_products', many=True, read_only=True)

    class Meta(BaseRecipeSerializer.Meta):
        fields = BaseRecipeSerializer.Meta.fields + ['portions', 'products', 'preparation', 'created_at']


class RecipeProductCreateSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product')
    unit_id = serializers.PrimaryKeyRelatedField(queryset=Unit.objects.all(), source='unit')
    custom_unit_id = serializers.PrimaryKeyRelatedField(queryset=CustomUnit.objects.all(), source='custom_unit',
                                                        required=False)

    class Meta:
        model = RecipeProduct
        fields = ['product_id', 'quantity', 'unit_id', 'custom_unit_id']


class RecipeCreateSerializer(serializers.ModelSerializer):
    # products = RecipeProductCreateSerializer(source='recipe_product', many=True)
    products = serializers.JSONField()

    class Meta:
        model = Recipe
        fields = ['name', 'quick_description', 'portions', 'time_to_cook',
                  'time_to_prepare', 'preparation', 'products', 'image']

    def create(self, validated_data):
        products_data = validated_data.pop('products', [])
        recipe = Recipe.objects.create(**validated_data)

        for product_data in products_data:
            recipe_product = RecipeProduct(recipe=recipe, **product_data)
            recipe_product.save()

        return recipe

    def to_representation(self, instance):
        response = RecipeDetailSerializer(instance=instance).data
        return response


class RecipesCollectionSerializer(serializers.ModelSerializer):
    recipes = BaseRecipeSerializer(many=True, read_only=True)

    class Meta:
        model = RecipesCollection
        fields = ['id', 'profile', 'recipes', 'image', 'is_private', 'created_at']