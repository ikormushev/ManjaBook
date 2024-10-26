from django.urls import path, include

from ManjaBook.inventory import views

urlpatterns = [
    path('products/', include([
        path('', views.ProductListView.as_view(), name='api_products_list'),
        path('<int:pk>/', views.ProductDetailView.as_view(), name='api_products_detail'),
    ])),
    path('shops/', views.ShopListView.as_view(), name='api_shops_list'),
    path('units/', include([
        path('', views.UnitListView.as_view(), name='api_units_list'),
        path('<int:pk>/', views.UnitDetailView.as_view(), name='api_units_detail'),
    ])),
    path('custom-units/', include([
        path('', views.CustomUnitCreateView.as_view(), name='api_custom_units_list'),
        path('<int:pk>/', views.CustomUnitDetailView.as_view(), name='api_custom_units_detail'),
    ])),
    path('recipes-products/', include([
        path('', views.RecipeProductListView.as_view(), name='api_recipes_products_list'),
    ])),
    path('recipes/', include([
        path('', views.RecipeListView.as_view(), name='api_recipes_list'),
        path('<int:pk>/', views.RecipeDetailView.as_view(), name='api_recipes_recipes_list'),
    ])),
    path('recipes-collections/', include([
        path('', views.RecipeCollectionsListView.as_view(), name='api_recipes_collections_list'),
    ]))
]
