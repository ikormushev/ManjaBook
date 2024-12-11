from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from ManjaBook.accounts.models import Profile
from ManjaBook.inventory.models import Recipe

UserModel = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        return data


class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['id', 'email', 'password', 'username']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = UserModel.objects.create_user(**validated_data)
        return user


class BaseProfileSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['user_id', 'username', 'profile_picture']

    def get_username(self, obj):
        return obj.user.username


class ProfileSerializer(BaseProfileSerializer):
    recipes = serializers.SerializerMethodField()

    class Meta(BaseProfileSerializer.Meta):
        fields = BaseProfileSerializer.Meta.fields + ['collections', 'recipes']

    def get_recipes(self, obj):
        from ManjaBook.inventory.serializers import RecipeDetailSerializer

        recipes = Recipe.objects.filter(created_by=obj)
        return RecipeDetailSerializer(recipes, many=True, context={'exclude_created_by': True}).data
