# Generated by Django 5.1.1 on 2024-12-14 13:41

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0007_alter_recipe_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='brand',
            field=models.CharField(default='Basic', max_length=30, validators=[django.core.validators.MinLengthValidator(1, 'Product name must have at least 1 letter!')]),
        ),
    ]
