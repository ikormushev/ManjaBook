from django.db import DataError, transaction
from rest_framework import serializers
from django.utils.text import slugify
from rest_framework.exceptions import ValidationError

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
    product = ProductBaseSerializer()
    unit = UnitBaseSerializer()
    custom_unit = CustomUnitBaseSerializer()

    class Meta:
        model = RecipeProduct
        fields = ['id', 'product', 'quantity', 'unit', 'custom_unit',
                  'calories', 'protein', 'carbohydrates', 'sugars', 'fats',
                  'saturated_fats', 'salt', 'fibre']


class RecipeProductCreateSerializer(serializers.ModelSerializer):
    recipe_id = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all(), source='recipe')
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product')
    unit_id = serializers.PrimaryKeyRelatedField(queryset=Unit.objects.all(), source='unit')
    custom_unit_id = serializers.PrimaryKeyRelatedField(queryset=CustomUnit.objects.all(), source='custom_unit',
                                                        allow_null=True, required=False)

    class Meta:
        model = RecipeProduct
        fields = ['recipe_id', 'product_id', 'quantity', 'unit_id', 'custom_unit_id']


class BaseRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'name', 'slug', 'created_by']
        read_only_fields = ['id', 'slug', 'created_by']


class SimpleRecipeSerializer(BaseRecipeSerializer):
    total_nutrients = serializers.SerializerMethodField(read_only=True)
    created_by = BaseProfileSerializer(read_only=True)

    class Meta(BaseRecipeSerializer.Meta):
        fields = (BaseRecipeSerializer.Meta.fields +
                  ['quick_description', 'time_to_cook', 'time_to_prepare', 'image', 'total_nutrients'])
        read_only_fields = BaseRecipeSerializer.Meta.read_only_fields + ['total_nutrients']

    def get_total_nutrients(self, obj):
        return obj.calculate_total_nutrients()


class RecipeDetailSerializer(SimpleRecipeSerializer):
    products = RecipeProductSerializer(source='recipe_products', many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta(SimpleRecipeSerializer.Meta):
        fields = SimpleRecipeSerializer.Meta.fields + ['portions', 'products', 'preparation', 'created_at', 'is_owner']

    def get_is_owner(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            return obj.created_by.user == request.user or request.user.groups.filter(name="Admins").exists()
        return False


class RecipeUpdateSerializer(serializers.ModelSerializer):
    products = RecipeProductCreateSerializer(many=True, source='recipe_products', required=False)
    is_owner = serializers.SerializerMethodField(read_only=True)

    def get_is_owner(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            return obj.created_by.user == request.user or request.user.groups.filter(name="Admins").exists()
        return False

    class Meta:
        model = Recipe
        fields = ['id', 'name', 'quick_description',
                  'time_to_cook', 'time_to_prepare',
                  'products', 'portions', 'preparation', 'is_owner']
        read_only_fields = ['id']

    def update(self, instance, validated_data):
        if 'name' in validated_data:
            instance.slug = slugify(unidecode(validated_data['name']))

        products_data = validated_data.pop('recipe_products', [])
        if not products_data:
            raise serializers.ValidationError({'products': "No products provided."})

        existing_product_ids = set(instance.recipe_products.values_list('id', flat=True))

        incoming_product_ids = set()

        for product_data in products_data:
            try:
                recipe_product, created = (RecipeProduct.objects.
                                           update_or_create(recipe=instance,
                                                            quantity=product_data['quantity'],
                                                            unit=product_data['unit'],
                                                            custom_unit=product_data['custom_unit'],
                                                            product=product_data['product'],
                                                            ))
                incoming_product_ids.add(recipe_product.id)
            except DataError:
                error_unit = product_data['unit']
                error_quantity = product_data['quantity']
                error_product = product_data['product']
                raise ValidationError({'products': f"Product {error_product.name} - "
                                                   f"Quantity {error_quantity} too large "
                                                   f"for the specified unit - {error_unit.name}!"})
        products_to_delete = existing_product_ids - incoming_product_ids
        RecipeProduct.objects.filter(id__in=products_to_delete).delete()
        return super().update(instance, validated_data)


class RecipeImageUpdateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=True)

    class Meta:
        model = Recipe
        fields = ['image']


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

        with transaction.atomic():
            recipe = Recipe.objects.create(**validated_data)

            for product_data in products_data:
                error_dict = {}
                try:
                    recipe_product = RecipeProduct(recipe=recipe, **product_data)
                    error_dict = {
                        "unit": recipe_product.unit,
                        "quantity": recipe_product.quantity,
                        "product": recipe_product.product,
                    }

                    recipe_product.save()
                except DataError:
                    error_unit = error_dict["unit"]
                    error_quantity = error_dict["quantity"]
                    error_product = error_dict["product"]
                    raise ValidationError({'products': f"Product {error_product.name} - "
                                                       f"Quantity {error_quantity} too large "
                                                       f"for the specified unit - {error_unit.name}!"})

        return recipe

    def to_representation(self, instance):
        response = RecipeDetailSerializer(instance=instance).data
        return response


class BaseRecipesCollectionSerializer(serializers.ModelSerializer):
    recipes = BaseRecipeSerializer(many=True, read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = RecipesCollection
        fields = ['id', 'name', 'created_by', 'recipes', 'image', 'is_private', 'created_at']
        read_only_fields = ['id', 'created_at', 'created_by']


class SimpleRecipesCollectionSerializer(BaseRecipesCollectionSerializer):
    recipes = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all(), many=True)


class RecipesCollectionCreateSerializer(SimpleRecipesCollectionSerializer):
    recipes = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all(), many=True, required=False)


class RecipesCollectionDetailSerializer(SimpleRecipesCollectionSerializer):
    recipes = SimpleRecipeSerializer(many=True)


class RecipesCollectionModifySerializer(SimpleRecipesCollectionSerializer):
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
