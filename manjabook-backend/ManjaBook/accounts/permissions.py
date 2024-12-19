from rest_framework import permissions


def is_allowed(request_user, user):
    return (user == request_user or
            request_user.is_staff or
            request_user.is_superuser)


def is_allowed_in_inventory(request_user, user):
    return is_allowed(request_user, user) or request_user.groups.filter(name="InventoryAdmins").exists()


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of a recipe or admins to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        return is_allowed_in_inventory(request.user, obj.created_by.user)
