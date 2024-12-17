from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of a recipe or admins to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.groups.filter(name="Admins").exists():
            return True
        return obj.created_by.user == request.user
