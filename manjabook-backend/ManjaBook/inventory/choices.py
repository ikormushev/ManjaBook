from django.db import models


class NutritionPerChoices(models.TextChoices):
    GRAMS = ('g', 'Grams')
    MILLITERS = ('ml', 'Milliliters')
