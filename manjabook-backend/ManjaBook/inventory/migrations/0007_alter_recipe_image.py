# Generated by Django 5.1.1 on 2024-12-11 23:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_squashed_0006_alter_recipe_created_by'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recipe',
            name='image',
            field=models.ImageField(blank=True, default='common/default-recipe-image.jpg', null=True, upload_to='recipes-images/'),
        ),
    ]