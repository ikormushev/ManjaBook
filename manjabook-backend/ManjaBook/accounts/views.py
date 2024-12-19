from django.contrib.auth import get_user_model
from django.conf import settings
from django.db import transaction
from rest_framework import generics as api_views, views as base_api_views, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from ManjaBook.accounts.models import Profile
from ManjaBook.accounts.serializers import UserCreateSerializer, ProfileSerializer, CustomTokenObtainPairSerializer, \
    BaseProfileSerializer, ProfileUpdateSerializer

UserModel = get_user_model()


class CreateUserApiView(api_views.CreateAPIView):
    serializer_class = UserCreateSerializer
    queryset = UserModel.objects.all()
    permission_classes = [permissions.AllowAny]
    authentication_classes = []


class LoginApiView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        access = serializer.validated_data.get('access', None)
        refresh = serializer.validated_data.get('refresh', None)
        user_id = serializer.validated_data.get('user_id', None)
        username = serializer.validated_data.get('username', None)

        if access is not None and refresh is not None and user_id is not None:
            response = Response({'user_id': user_id, 'username': username},
                                status=status.HTTP_200_OK)
            response.set_cookie('token', access, httponly=True, samesite='Lax',
                                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
            response.set_cookie('refresh', refresh, httponly=True, samesite='Lax',
                                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
            response.set_cookie('user_id', user_id, httponly=True, samesite='Lax',
                                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
            return response

        return Response({"Error": "Something went wrong."}, status=status.HTTP_400_BAD_REQUEST)


class ProfileListView(api_views.ListAPIView):
    serializer_class = BaseProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()

    def get_queryset(self):
        queryset = Profile.objects.filter(user__is_active=True)

        search_term = self.request.query_params.get('search', None)
        if search_term:
            queryset = queryset.filter(user__username__icontains=search_term)

        return queryset


class UserProfileView(api_views.RetrieveUpdateDestroyAPIView):
    modify_serializer_class = ProfileUpdateSerializer
    detail_serializer_class = ProfileSerializer

    serializer_class = detail_serializer_class
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return (Profile.objects.filter(user__is_active=True)
                .select_related('user')
                .prefetch_related('owned_collections').prefetch_related('recipe_set'))

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return self.serializer_class
        return self.modify_serializer_class

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        with transaction.atomic():
            instance.user.is_active = False
            instance.user.save()

        response = Response(status=status.HTTP_204_NO_CONTENT)

        if request.user == instance.user:
            refresh_token = request.COOKIES.get('refresh', None)

            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            response = Response(status=status.HTTP_204_NO_CONTENT)
            response.delete_cookie('token')
            response.delete_cookie('refresh')
            response.delete_cookie('user_id')

        return response


class CheckAuthenticationView(base_api_views.APIView):
    queryset = Profile.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        return Profile.objects.get(user_id=self.request.user.id)

    def get(self, request, *args, **kwargs):
        return Response({"Authenticated": self.request.user.is_authenticated,
                         "username": self.request.user.username,
                         "user_id": self.request.user.id})


class LogoutView(base_api_views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh', None)
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception as e:
            return Response({"error": "Failed to logout."}, status=status.HTTP_400_BAD_REQUEST)

        response = Response(data={'details': "Logout successful!"}, status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie('token')
        response.delete_cookie('refresh')
        response.delete_cookie('user_id')
        return response
