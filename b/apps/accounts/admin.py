from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group
from django.utils.translation import gettext_lazy as _
from .models import JekUser, Company, AccountGroup, Profile


# ---------------------------------------------------------------------
# Company
# ---------------------------------------------------------------------
@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)
    ordering = ("name",)


# ---------------------------------------------------------------------
# Custom User
# ---------------------------------------------------------------------
@admin.register(JekUser)
class JekUserAdmin(BaseUserAdmin):
    model = JekUser
    list_display = (
        "email",
        "first_name",
        "last_name",
        "role",
        "company",
        "is_active",
        "is_staff",
        "is_superuser",
        "date_joined",
    )
    list_filter = ("role", "company", "is_active", "is_staff", "is_superuser")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    readonly_fields = ("date_joined",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "role", "company")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "role",
                    "company",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )


# ---------------------------------------------------------------------
# Move Groups under "Accounts" section
# ---------------------------------------------------------------------

# Unregister the default Group admin (under “Authentication and Authorization”)
admin.site.unregister(Group)


# Re-register it with a new app label section
@admin.register(AccountGroup)
class AccountGroupAdmin(BaseGroupAdmin):
    """Show Groups under the Accounts section via proxy model."""
    pass


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "email_code","reset_code")