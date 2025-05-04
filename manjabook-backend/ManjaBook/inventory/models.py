from decimal import Decimal, ROUND_HALF_UP

from django.contrib.auth import get_user_model
from django.core.validators import MinLengthValidator, MinValueValidator, MaxValueValidator
from django.db import models
from django.utils.text import slugify
from unidecode import unidecode

from ManjaBook.accounts.models import Profile
from ManjaBook.inventory.abstract_classes import ProductNutrientsInfo, RecipeNutrientsInfo, BasicRecipeInfo
from ManjaBook.inventory.choices import NutritionPerChoices

UserModel = get_user_model()


class Shop(models.Model):
    name = models.CharField(max_length=20,
                            validators=[MinLengthValidator(1,
                                                           'Shop name must have at least 1 letter!')])

    def __str__(self):
        return self.name


class Product(ProductNutrientsInfo):
    name = models.CharField(max_length=30,
                            validators=[MinLengthValidator(3, "Product name must have at least 3 letters!")])
    brand = models.CharField(max_length=30,
                             validators=[MinLengthValidator(1, "Product name must have at least 1 letter!")],
                             default="Basic")

    shopped_from = models.ManyToManyField(Shop, related_name='products', blank=True)

    def __str__(self):
        return f'{self.name} ({self.brand})'


class Unit(models.Model):
    name = models.CharField(max_length=30, validators=[MinLengthValidator(1)])
    abbreviation = models.CharField(max_length=10, validators=[MinLengthValidator(1)])
    base_unit = models.CharField(choices=NutritionPerChoices.choices,
                                 default=NutritionPerChoices.GRAMS,
                                 max_length=2)
    convert_to_base_rate = models.DecimalField(max_digits=7, decimal_places=3, validators=[MinValueValidator(Decimal("0.001"))])
    is_customizable = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Recipe(BasicRecipeInfo):
    products = models.ManyToManyField(Product, through='RecipeProduct', related_name='recipes', blank=True)

    slug = models.SlugField(max_length=100, editable=False)
    image = models.ImageField(upload_to='recipes-images/', null=True, blank=True,
                              default='common/default-recipe-image.png')

    created_at = models.DateTimeField(auto_now_add=True)
    last_edit_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True)

    def calculate_total_nutrients(self):
        total_nutrients = {
            'calories': 0,
            'protein': 0,
            'carbohydrates': 0,
            'sugars': 0,
            'fats': 0,
            'saturated_fats': 0,
            'salt': 0,
            'fibre': 0,
        }

        for recipe_product in self.recipe_products.all():
            total_nutrients['calories'] += recipe_product.calories
            total_nutrients['protein'] += recipe_product.protein
            total_nutrients['carbohydrates'] += recipe_product.carbohydrates
            total_nutrients['sugars'] += recipe_product.sugars
            total_nutrients['fats'] += recipe_product.fats
            total_nutrients['saturated_fats'] += recipe_product.saturated_fats
            total_nutrients['salt'] += recipe_product.salt
            total_nutrients['fibre'] += recipe_product.fibre

        return total_nutrients

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(unidecode(self.name))

        super().save(*args, **kwargs)


class CustomUnit(models.Model):
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    custom_convert_to_base_rate = models.DecimalField(max_digits=6,
                                                      decimal_places=2,
                                                      validators=[MinValueValidator(0.01,
                                                                                    "Base rate must be at least 0.01.")])

    def __str__(self):
        return f"{self.unit.name} ({self.custom_convert_to_base_rate})"


class RecipeProduct(RecipeNutrientsInfo):
    recipe = models.ForeignKey(Recipe, related_name='recipe_products', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='product_recipes', on_delete=models.CASCADE)

    quantity = models.DecimalField(max_digits=6, decimal_places=2,
                                   validators=[MinValueValidator(0.01,
                                                                 "Quantity must be at least 0.01."),
                                               MaxValueValidator(1000.01, "Quantity must be lower than 1000!")])
    unit = models.ForeignKey(Unit, related_name='recipe_products', on_delete=models.CASCADE)
    custom_unit = models.ForeignKey(CustomUnit, related_name='recipe_products_custom',
                                    blank=True, null=True,
                                    on_delete=models.SET_NULL)

    def get_unit_convert_to_base_rate(self):
        rate_to_return = self.custom_unit.custom_convert_to_base_rate \
            if self.custom_unit else self.unit.convert_to_base_rate
        return rate_to_return

    def save(self, *args, **kwargs):
        def quantize_value(value):
            return Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        quantity_converted_to_base = quantize_value((self.get_unit_convert_to_base_rate() * self.quantity) / 100)

        self.calories = quantize_value(quantity_converted_to_base * self.product.calories)
        self.protein = quantize_value(quantity_converted_to_base * self.product.protein)
        self.carbohydrates = quantize_value(quantity_converted_to_base * self.product.carbohydrates)
        self.sugars = quantize_value(quantity_converted_to_base * self.product.sugars)
        self.fats = quantize_value(quantity_converted_to_base * self.product.fats)
        self.saturated_fats = quantize_value(quantity_converted_to_base * self.product.saturated_fats)
        self.salt = quantize_value(quantity_converted_to_base * self.product.salt)
        self.fibre = quantize_value(quantity_converted_to_base * self.product.fibre)

        super().save(*args, **kwargs)


class RecipesCollection(models.Model):
    name = models.CharField(max_length=40, validators=[
        MinLengthValidator(3, "Recipe collection name must be at least 3 characters.")])
    recipes = models.ManyToManyField(Recipe, related_name='collections', blank=True)

    image = models.ImageField(upload_to='recipes-collections-images/',
                              default="common/default-collections-photo.png",
                              null=True, blank=True)
    is_private = models.BooleanField(default=False)

    created_by = models.ForeignKey(Profile, related_name='owned_collections',
                                   on_delete=models.CASCADE)  # models.SET_NULL - a possibility
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SavedRecipesCollection(models.Model):
    user = models.ForeignKey(
        Profile,
        related_name='saved_collections',
        on_delete=models.CASCADE
    )
    recipes_collection = models.ForeignKey(
        RecipesCollection,
        related_name='saved_by',
        on_delete=models.CASCADE
    )
    saved_at = models.DateTimeField(auto_now_add=True)
