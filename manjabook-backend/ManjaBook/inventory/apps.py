from django.apps import AppConfig


class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ManjaBook.inventory'

    def ready(self):
        import ManjaBook.inventory.signals
