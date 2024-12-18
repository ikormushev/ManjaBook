from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from ManjaBook.accounts.models import Profile
from ManjaBook.inventory.models import Recipe, RecipesCollection

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
    owned_collections = serializers.SerializerMethodField()

    class Meta(BaseProfileSerializer.Meta):
        fields = BaseProfileSerializer.Meta.fields + ['recipes', 'owned_collections']

    def get_recipes(self, obj):
        from ManjaBook.inventory.serializers import RecipeDetailSerializer

        recipes = Recipe.objects.filter(created_by=obj)
        return RecipeDetailSerializer(recipes, many=True, context={'exclude_created_by': True}).data

    def get_owned_collections(self, obj):
        from ManjaBook.inventory.serializers import BaseRecipesCollectionSerializer

        request = self.context.get('request')
        owned_collections = RecipesCollection.objects.filter(created_by=obj)

        if request and request.user.is_authenticated:
            is_owner = request.user.profile == obj
            if is_owner or request.user.is_superuser or request.user.groups.filter(name="Admins").exists():
                return BaseRecipesCollectionSerializer(
                    owned_collections, many=True, context={'exclude_created_by': True}
                ).data

        return BaseRecipesCollectionSerializer(
            owned_collections.filter(is_private=False), many=True, context={'exclude_created_by': True}
        ).data
