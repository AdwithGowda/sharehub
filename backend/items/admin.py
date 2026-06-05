from django.contrib import admin
from .models import Category, Item, ItemImage

class ItemImageInline(admin.TabularInline):
    model = ItemImage
    extra = 1

class ItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'category', 'price_per_day', 'deposit_amount', 'location', 'availability_status')
    list_filter = ('category', 'availability_status')
    search_fields = ('title', 'owner__email', 'location')
    inlines = [ItemImageInline]

admin.site.register(Category)
admin.site.register(Item, ItemAdmin)
admin.site.register(ItemImage)
