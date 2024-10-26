from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ManjaBook.accounts'

    def ready(self):
        import ManjaBook.accounts.signals
