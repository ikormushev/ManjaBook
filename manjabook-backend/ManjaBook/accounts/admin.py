from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from ManjaBook.accounts.forms import ProfileAdminForm
from ManjaBook.accounts.models import AccountUser, Profile
from django.utils.translation import gettext_lazy as _


@admin.register(AccountUser)
class AccountUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'is_active', 'is_staff', 'is_superuser', 'date_joined', 'get_groups')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('email', 'username')
    ordering = ('date_joined',)
    readonly_fields = ('last_login', 'date_joined')
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'is_staff', 'is_superuser', 'groups'),
        }),
    )

    def get_groups(self, obj):
        return ", ".join(group.name for group in obj.groups.all())

    get_groups.short_description = "Groups"


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    form = ProfileAdminForm
    list_display = ('user', 'profile_picture')
    search_fields = ('user__email', 'user__username')

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ['user']
        return []
