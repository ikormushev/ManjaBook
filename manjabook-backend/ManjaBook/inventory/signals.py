from django.db.models.signals import post_save
from django.dispatch import receiver
from ManjaBook.inventory.models import RecipesCollection, SavedRecipesCollection


@receiver(post_save, sender=RecipesCollection)
def auto_save_collection(sender, instance, created, **kwargs):
    if created:
        SavedRecipesCollection.objects.create(
            user=instance.created_by,
            recipes_collection=instance
        )
