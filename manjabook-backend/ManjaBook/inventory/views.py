from ManjaBook.accounts.permissions import IsOwnerOrAdmin
from ManjaBook.inventory.models import Product, Shop, Unit, CustomUnit, Recipe, RecipeProduct, RecipesCollection
from rest_framework import generics as api_views, permissions
from ManjaBook.inventory.serializers import ProductCreateSerializer, ShopSerializer, \
    UnitBaseSerializer, CustomUnitCreateSerializer, RecipeProductSerializer, BaseRecipeSerializer, \
    ProductBaseSerializer, RecipeDetailSerializer, RecipeCreateSerializer, CustomUnitListSerializer, \
    RecipesCollectionSerializer


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
        return CustomUnit.objects.all().select_related('unit')


class CustomUnitDetailView(api_views.RetrieveAPIView):
    queryset = CustomUnit.objects.all()
    serializer_class = CustomUnitCreateSerializer
    permission_classes = [permissions.AllowAny]


class RecipeProductListView(api_views.ListAPIView):
    queryset = RecipeProduct.objects.all()
    serializer_class = RecipeProductSerializer
    permission_classes = [permissions.AllowAny]


class RecipeListView(api_views.ListCreateAPIView):
    list_serializer_class = BaseRecipeSerializer
    create_serializer_class = RecipeCreateSerializer

    serializer_class = list_serializer_class
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return self.create_serializer_class
        return self.serializer_class

    def get_queryset(self):
        queryset = Recipe.objects.all().select_related('created_by').prefetch_related('recipe_products')

        search_term = self.request.query_params.get('search', None)

        if search_term:
            queryset = queryset.filter(name__icontains=search_term)

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.profile)

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()


class RecipeDetailView(api_views.RetrieveUpdateDestroyAPIView):
    serializer_class = RecipeDetailSerializer

    def get_queryset(self):
        return (Recipe.objects.all()
                .prefetch_related('recipe_products')
                .prefetch_related('recipe_products__unit', 'recipe_products__custom_unit'))

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsOwnerOrAdmin()]


class RecipeCollectionsListView(api_views.ListAPIView):
    queryset = RecipesCollection.objects.all()
    serializer_class = RecipesCollectionSerializer
    permission_classes = [permissions.AllowAny]
