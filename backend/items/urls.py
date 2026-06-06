from django.urls import path
from .views import CategoryListView, ItemListCreateView, ItemDetailView, AdminItemListView, AdminItemRemoveView, AdminCategoryRemoveView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('', ItemListCreateView.as_view(), name='item_list_create'),
    path('<int:pk>/', ItemDetailView.as_view(), name='item_detail'),
    path('admin/items/', AdminItemListView.as_view(), name='admin_item_list'),
    path('admin/items/<int:pk>/', AdminItemRemoveView.as_view(), name='admin_item_remove'),
    path('admin/categories/<int:pk>/', AdminCategoryRemoveView.as_view(), name='admin_category_remove'),
]
