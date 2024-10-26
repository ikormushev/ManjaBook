from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

from ManjaBook.accounts import views

urlpatterns = [
    path('auth/', include([
        path('register/', views.CreateUserApiView.as_view(), name='api_create_user'),
        path('token/', views.LoginApiView.as_view(), name='api_token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),
        path('verify/', views.CheckAuthenticationView.as_view(), name='api_user_verify'),
        path('logout/', views.LogoutView.as_view(), name='api_logout'),
    ])),

    path('profiles/', include([
        path('', views.ProfileListView.as_view(), name='api_profile_list_view'),
        path('<int:pk>/', views.UserProfileView.as_view(), name='api_profile_detail_view'),
    ])),
]
