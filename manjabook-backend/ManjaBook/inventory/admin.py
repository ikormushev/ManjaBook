from django.contrib import admin

from ManjaBook.inventory.models import Shop, Product, Recipe, RecipeProduct, Unit, CustomUnit, RecipesCollection


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('name',)
    list_filter = ('name',)
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'nutrition_per', 'calories',
                    'protein', 'carbohydrates', 'sugars', 'fats', 'saturated_fats', 'salt', 'fibre')
    list_filter = ('name', 'brand')
    search_fields = ('name', 'brand')
    ordering = ('name',)


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('name',)
    list_filter = ('name', 'abbreviation')


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('name', 'quick_description',
                    'portions', 'time_to_cook', 'time_to_prepare',
                    'created_at')
    list_filter = ('name', 'time_to_cook', 'time_to_prepare')
    search_fields = ('name', 'time_to_cook', 'time_to_prepare')
    ordering = ('name',)


@admin.register(RecipeProduct)
class RecipeProductAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'product', 'quantity', 'unit')
    list_filter = ('recipe', 'product')
    search_fields = ('recipe',)
    ordering = ('recipe__name',)


@admin.register(CustomUnit)
class CustomUnitAdmin(admin.ModelAdmin):
    list_display = ('unit__name', 'custom_convert_to_base_rate')


@admin.register(RecipesCollection)
class RecipesCollectionAdmin(admin.ModelAdmin):
    list_display = ('name',)
