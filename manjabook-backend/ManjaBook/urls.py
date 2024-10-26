from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('', include('ManjaBook.accounts.urls')),
        path('', include('ManjaBook.inventory.urls')),
    ]))
]
