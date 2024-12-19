from django.contrib.auth.password_validation import validate_password
from django.db import transaction, DataError, IntegrityError
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from ManjaBook.accounts.models import Profile
from ManjaBook.accounts.permissions import is_allowed
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
    user_id = serializers.SerializerMethodField(read_only=True)
    is_active = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Profile
        fields = ['user_id', 'username', 'profile_picture', 'is_active']

    def get_username(self, obj):
        return obj.user.username

    def get_user_id(self, obj):
        return obj.user.id

    def get_is_active(self, obj):
        return obj.user.is_active

class ProfileUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ['username', 'profile_picture']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)

        with transaction.atomic():
            try:
                if user_data and 'username' in user_data:
                    instance.user.username = user_data['username']
                    instance.user.save()
            except DataError as e:
                raise serializers.ValidationError({'username': "Username must be below 20 characters!"})
            except IntegrityError as e:
                raise serializers.ValidationError({'username': "Username already exists!"})
            if validated_data.get('profile_picture') is None:
                validated_data.pop('profile_picture', None)

            return super().update(instance, validated_data)


class ProfileSerializer(BaseProfileSerializer):
    recipes = serializers.SerializerMethodField()
    owned_collections = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta(BaseProfileSerializer.Meta):
        fields = BaseProfileSerializer.Meta.fields + ['recipes', 'owned_collections', 'is_owner']

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

    def get_is_owner(self, obj):
        request = self.context.get('request', None)

        if request and request.user.is_authenticated:
            return is_allowed(request.user, obj.user)
        return False
