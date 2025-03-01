# Generated by Django 5.1.1 on 2024-12-14 15:15

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0008_alter_product_brand'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recipe',
            name='portions',
            field=models.SmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1, 'Portions must be at least 1!'), django.core.validators.MaxValueValidator(100, 'Portions can be at maximum 100!')]),
        ),
        migrations.AlterField(
            model_name='recipe',
            name='time_to_cook',
            field=models.SmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1, 'Time to cook must be set at least 1 minute!'), django.core.validators.MaxValueValidator(1440, 'Time to cook can be set at maximum 1440 minutes!')]),
        ),
        migrations.AlterField(
            model_name='recipe',
            name='time_to_prepare',
            field=models.SmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1, 'Time to prepare must be set at least 1 minute!'), django.core.validators.MaxValueValidator(1440, 'Time to prepare can be set at maximum 1440 minutes!')]),
        ),
    ]
