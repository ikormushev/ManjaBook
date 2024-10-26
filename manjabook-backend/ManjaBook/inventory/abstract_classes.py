from django.core.validators import MinValueValidator, MaxValueValidator, MinLengthValidator
from django.db import models
from ManjaBook.inventory.choices import NutritionPerChoices


class ProductNutrientsInfo(models.Model):
    class Meta:
        abstract = True

    nutrition_per = models.CharField(choices=NutritionPerChoices.choices,
                                     default=NutritionPerChoices.GRAMS,
                                     max_length=2)

    calories = models.SmallIntegerField(default=0,
                                        validators=[MinValueValidator(0, 'Calories have to be more or equal to 0.'),
                                                    MaxValueValidator(1000, 'Calories have to be less than or equal '
                                                                            'to 1000.')])
    protein = models.DecimalField(default=0,
                                  max_digits=5,
                                  decimal_places=2,
                                  validators=[MinValueValidator(0),
                                              MaxValueValidator(250)])

    carbohydrates = models.DecimalField(default=0,
                                        max_digits=5,
                                        decimal_places=2,
                                        validators=[MinValueValidator(0),
                                                    MaxValueValidator(250)])

    sugars = models.DecimalField(default=0,
                                 max_digits=5,
                                 decimal_places=2,
                                 validators=[MinValueValidator(0),
                                             MaxValueValidator(250)])

    fats = models.DecimalField(default=0,
                               max_digits=5,
                               decimal_places=2,
                               validators=[MinValueValidator(0),
                                           MaxValueValidator(111.11)])

    saturated_fats = models.DecimalField(default=0,
                                         max_digits=5,
                                         decimal_places=2,
                                         validators=[MinValueValidator(0),
                                                     MaxValueValidator(111.11)])

    salt = models.DecimalField(default=0,
                               max_digits=5,
                               decimal_places=3,
                               validators=[MinValueValidator(0),
                                           MaxValueValidator(100)])

    fibre = models.DecimalField(default=0,
                                max_digits=4,
                                decimal_places=2,
                                validators=[MinValueValidator(0),
                                            MaxValueValidator(50)])

    @property
    def kilojoules(self):
        return self.calories * 4.184


class RecipeNutrientsInfo(models.Model):
    calories = models.DecimalField(max_digits=6, decimal_places=2,
                                   null=True, blank=True, editable=False)

    protein = models.DecimalField(max_digits=6, decimal_places=2,
                                  null=True, blank=True, editable=False)

    carbohydrates = models.DecimalField(max_digits=6, decimal_places=2,
                                        null=True, blank=True, editable=False)

    sugars = models.DecimalField(max_digits=6, decimal_places=2,
                                 null=True, blank=True, editable=False)

    fats = models.DecimalField(max_digits=6, decimal_places=2,
                               null=True, blank=True, editable=False)

    saturated_fats = models.DecimalField(max_digits=6, decimal_places=2,
                                         null=True, blank=True, editable=False)

    salt = models.DecimalField(max_digits=6, decimal_places=3,
                               null=True, blank=True, editable=False)

    fibre = models.DecimalField(max_digits=6, decimal_places=2,
                                null=True, blank=True, editable=False)

    class Meta:
        abstract = True


class BasicRecipeInfo(models.Model):
    class Meta:
        abstract = True

    name = models.CharField(max_length=100, validators=[MinLengthValidator(3, 'Recipe name must have at least 3 '
                                                                              'letters!')])
    quick_description = models.CharField(max_length=100, null=True, blank=True)
    portions = models.SmallIntegerField(default=1, validators=[MinValueValidator(1),
                                                               MaxValueValidator(100)])
    time_to_cook = models.SmallIntegerField(default=1, null=True, blank=True)
    time_to_prepare = models.SmallIntegerField(default=1, null=True, blank=True)
    preparation = models.TextField()