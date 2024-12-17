from django.contrib.auth import models as auth_models
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.core.validators import MinLengthValidator
from django.db import models

from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from ManjaBook.accounts.managers import AccountUserManager


def user_directory_path(instance, filename):
    return f'users/{instance.user.username}/{filename}'


class AccountUser(auth_models.AbstractBaseUser, auth_models.PermissionsMixin):
    email = models.EmailField(
        unique=True,
        error_messages={'unique': _('A user with that email already exists.')},
    )
    username = models.CharField(
        unique=True,
        error_messages={'unique': _('A user with that username already exists.')},
        max_length=20,
        validators=[ASCIIUsernameValidator, MinLengthValidator(3, _('Username must have at least 3 characters.'))],
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )

    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can log into this admin site."),
    )

    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)

    USERNAME_FIELD = 'email'

    objects = AccountUserManager()

    def __str__(self):
        return self.username


class Profile(models.Model):
    user = models.OneToOneField(
        AccountUser,
        on_delete=models.CASCADE,
        related_name='profile',
        primary_key=True,
    )

    profile_picture = models.ImageField(upload_to=user_directory_path,
                                        default='common/default-user-photo.jpg')

    def __str__(self):
        return self.user.username
