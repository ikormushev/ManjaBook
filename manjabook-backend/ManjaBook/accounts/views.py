from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import generics as api_views, views as base_api_views, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from ManjaBook.accounts.models import Profile
from ManjaBook.accounts.serializers import UserCreateSerializer, ProfileSerializer, CustomTokenObtainPairSerializer, \
    BaseProfileSerializer

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
    queryset = Profile.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()


class UserProfileView(api_views.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (Profile.objects.all()
                .select_related('user')
                .prefetch_related('collections').prefetch_related('recipe_set'))

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()


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
