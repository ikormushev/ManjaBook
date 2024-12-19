from rest_framework.response import Response

from ManjaBook.accounts.permissions import IsOwnerOrAdmin
from ManjaBook.inventory.models import Product, Shop, Unit, CustomUnit, Recipe, RecipeProduct, RecipesCollection, \
    SavedRecipesCollection
from rest_framework import generics as api_views, permissions, status
from ManjaBook.inventory.serializers import ProductCreateSerializer, ShopSerializer, \
    UnitBaseSerializer, CustomUnitCreateSerializer, RecipeProductSerializer, SimpleRecipeSerializer, \
    ProductBaseSerializer, RecipeDetailSerializer, RecipeCreateSerializer, CustomUnitListSerializer, \
    RecipesCollectionCreateSerializer, RecipesCollectionDetailSerializer, \
    SavedRecipesCollectionBaseSerializer, SavedRecipesCollectionCreateSerializer, \
    SavedRecipesCollectionDetailSerializer, RecipesCollectionModifySerializer, \
    SimpleRecipesCollectionSerializer, RecipeProductCreateSerializer, RecipeUpdateSerializer, RecipeImageUpdateSerializer


class ShopListView(api_views.ListCreateAPIView):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()


class ProductListView(api_views.ListCreateAPIView):
    queryset = Product.objects.all()

    list_serializer_class = ProductBaseSerializer
    create_serializer_class = ProductCreateSerializer

    serializer_class = list_serializer_class
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return self.create_serializer_class
        return self.serializer_class

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()

    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)

        if search_term:
            queryset = queryset.filter(name__icontains=search_term)

        return queryset


class ProductDetailView(api_views.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductBaseSerializer
    permission_classes = (permissions.AllowAny,)

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()


class UnitListView(api_views.ListCreateAPIView):
    queryset = Unit.objects.all()
    serializer_class = UnitBaseSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()


class UnitDetailView(api_views.RetrieveAPIView):
    queryset = Unit.objects.all()
    serializer_class = UnitBaseSerializer
    permission_classes = (permissions.AllowAny,)


class CustomUnitCreateView(api_views.ListCreateAPIView):
    list_serializer_class = CustomUnitListSerializer
    create_serializer_class = CustomUnitCreateSerializer

    serializer_class = list_serializer_class
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return self.create_serializer_class
        return self.serializer_class

    def get_queryset(self):
        return CustomUnit.objects.select_related('unit')


class CustomUnitDetailView(api_views.RetrieveAPIView):
    queryset = CustomUnit.objects.all()
    serializer_class = CustomUnitCreateSerializer
    permission_classes = [permissions.AllowAny]


class RecipeProductListView(api_views.ListCreateAPIView):
    list_serializer_class = RecipeProductSerializer
    create_serializer_class = RecipeProductCreateSerializer

    queryset = RecipeProduct.objects.all()
    serializer_class = list_serializer_class
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return self.serializer_class
        return self.create_serializer_class


class RecipeProductDetailView(api_views.RetrieveUpdateDestroyAPIView):
    list_serializer_class = RecipeProductSerializer
    create_serializer_class = RecipeProductCreateSerializer

    queryset = RecipeProduct.objects.all()
    serializer_class = list_serializer_class
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return self.serializer_class
        return self.create_serializer_class


class RecipeListView(api_views.ListCreateAPIView):
    list_serializer_class = SimpleRecipeSerializer
    create_serializer_class = RecipeCreateSerializer

    serializer_class = list_serializer_class
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return self.create_serializer_class
        return self.serializer_class

    def get_queryset(self):
        queryset = (Recipe.objects.select_related('created_by')
                    .prefetch_related('recipe_products'))

        search_term = self.request.query_params.get('search', None)
        if search_term:
            queryset = queryset.filter(name__icontains=search_term)

        limit = self.request.query_params.get('limit', None)
        if limit:
            try:
                limit = int(limit)
                queryset = queryset.order_by('-created_at')[:limit]
            except ValueError:
                pass

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.profile)


class RecipeDetailView(api_views.RetrieveUpdateDestroyAPIView):
    detail_serializer_class = RecipeDetailSerializer
    update_serializer_class = RecipeUpdateSerializer
    serializer_class = detail_serializer_class

    def get_queryset(self):
        return (Recipe.objects
                .prefetch_related('recipe_products')
                .prefetch_related('recipe_products__unit', 'recipe_products__custom_unit'))

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return self.serializer_class
        return self.update_serializer_class

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticatedOrReadOnly()]
        return [IsOwnerOrAdmin()]


class RecipeMultipartUpdateView(api_views.UpdateAPIView):
    serializer_class = RecipeUpdateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]

    def get_queryset(self):
        return (Recipe.objects
                .prefetch_related('recipe_products')
                .prefetch_related('recipe_products__unit',
                                  'recipe_products__custom_unit'))

    def update(self, request, *args, **kwargs):
        if not request.content_type.startswith('multipart/form-data'):
            return Response({'error': 'Expected multipart data.'},
                            status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

        if 'image' in request.data and len(request.data.keys()) == 1:
            self.serializer_class = RecipeImageUpdateSerializer

        return super().update(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.request.method == 'PATCH' and 'image' in self.request.data:
            return RecipeImageUpdateSerializer
        return self.serializer_class


class RecipesCollectionListView(api_views.ListCreateAPIView):
    list_serializer_class = SimpleRecipesCollectionSerializer
    create_serializer_class = RecipesCollectionCreateSerializer

    serializer_class = list_serializer_class
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = RecipesCollection.objects.select_related('created_by').prefetch_related('recipes')
        user_id = self.request.query_params.get('userId', None)
        if user_id:
            queryset = queryset.filter(created_by=user_id)

        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return self.create_serializer_class
        return self.serializer_class

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.profile)


class RecipesCollectionDetailView(api_views.RetrieveUpdateDestroyAPIView):
    detail_serializer_class = RecipesCollectionDetailSerializer
    modify_serializer_class = RecipesCollectionModifySerializer
    serializer_class = RecipesCollectionDetailSerializer

    def get_queryset(self):
        return (RecipesCollection.objects
                .select_related('created_by')
                .prefetch_related('recipes'))

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsOwnerOrAdmin()]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return self.detail_serializer_class
        return self.modify_serializer_class


class SavedRecipesCollectionListView(api_views.ListCreateAPIView):
    list_serializer_class = SavedRecipesCollectionBaseSerializer
    create_serializer_class = SavedRecipesCollectionCreateSerializer

    serializer_class = list_serializer_class
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return (SavedRecipesCollection.objects
                .select_related('user', 'recipes_collection')
                .prefetch_related('recipes_collection__recipes'))

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return self.create_serializer_class
        return self.serializer_class


class SavedRecipesCollectionDetailView(api_views.RetrieveUpdateDestroyAPIView):
    serializer_class = SavedRecipesCollectionDetailSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (SavedRecipesCollection.objects
                .select_related('user', 'recipes_collection')
                .prefetch_related('recipes_collection__recipes'))

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsOwnerOrAdmin()]

    def get_object(self):
        obj = super().get_object()
        obj.created_by = obj.user
        return obj
