from django.contrib import admin

from ManjaBook.inventory.models import Shop, Product, Recipe, RecipeProduct, Unit, CustomUnit, RecipesCollection, \
    SavedRecipesCollection


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    list_filter = ('name',)
    search_fields = ('name',)
    ordering = ('name',)
    readonly_fields = ('id',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'brand', 'nutrition_per', 'calories',
                    'protein', 'carbohydrates', 'sugars', 'fats', 'saturated_fats', 'salt', 'fibre')
    list_filter = ('brand', 'nutrition_per', 'calories')
    search_fields = ('name', 'brand')
    ordering = ('name',)
    readonly_fields = ('id',)


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'abbreviation')
    list_filter = ('name', 'abbreviation')
    search_fields = ('name', 'abbreviation')
    ordering = ('name',)
    readonly_fields = ('id',)


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'quick_description',
                    'portions', 'time_to_cook', 'time_to_prepare',
                    'created_at', 'created_by')
    list_filter = ('time_to_cook', 'time_to_prepare', 'created_at')
    search_fields = ('name', 'quick_description')
    ordering = ('name',)
    readonly_fields = ('id', 'created_at')


@admin.register(RecipeProduct)
class RecipeProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipe', 'product', 'quantity', 'unit')
    list_filter = ('recipe', 'product', 'unit')
    search_fields = ('recipe__name', 'product__name')
    ordering = ('recipe__name', 'product__name')
    readonly_fields = ('id',)


@admin.register(CustomUnit)
class CustomUnitAdmin(admin.ModelAdmin):
    list_display = ('id', 'unit', 'custom_convert_to_base_rate')
    list_filter = ('unit',)
    search_fields = ('unit__name',)
    ordering = ('unit__name',)
    readonly_fields = ('id',)


@admin.register(RecipesCollection)
class RecipesCollectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_by', 'is_private', 'created_at', 'updated_at', 'recipes_count')
    list_filter = ('is_private', 'created_at', 'updated_at')
    search_fields = ('name', 'created_by__user__username', 'created_by__user__email')
    ordering = ('name',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'recipes_count')

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'created_by', 'is_private', 'image'),
        }),
        ('Recipes', {
            'fields': ('recipes',),
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'recipes_count'),
        }),
    )

    filter_horizontal = ('recipes',)

    def recipes_count(self, obj):
        return obj.recipes.count()

    recipes_count.short_description = "Number of Recipes"


@admin.register(SavedRecipesCollection)
class SavedRecipesCollectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'recipes_collection', 'saved_at')
    list_filter = ('saved_at',)
    search_fields = ('user__user__username', 'user__user__email', 'recipes_collection__name')
    ordering = ('-saved_at',)
    readonly_fields = ('saved_at',)

    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'recipes_collection', 'saved_at'),
        }),
    )