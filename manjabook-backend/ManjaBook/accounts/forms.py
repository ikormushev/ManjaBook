from django import forms
from .models import Profile, AccountUser


class ProfileAdminForm(forms.ModelForm):
    user = forms.ModelChoiceField(
        queryset=AccountUser.objects.filter(profile__isnull=True),
        label="User",
    )

    class Meta:
        model = Profile
        fields = ['user', 'profile_picture']
