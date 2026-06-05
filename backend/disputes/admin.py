from django.contrib import admin
from .models import DamageClaim, DamageEvidence

class DamageEvidenceInline(admin.TabularInline):
    model = DamageEvidence
    extra = 1

class DamageClaimAdmin(admin.ModelAdmin):
    list_display = ('booking', 'owner', 'repair_cost', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('booking__id', 'owner__email')
    inlines = [DamageEvidenceInline]

admin.site.register(DamageClaim, DamageClaimAdmin)
admin.site.register(DamageEvidence)
