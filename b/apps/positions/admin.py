from django.contrib import admin
from .models import (
    PositionCategory,
    Skill,
    Condition,
    Position,
    PositionSkill,
    PositionCondition,
)


@admin.register(PositionCategory)
class PositionCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "company", "user", "created_at")
    list_filter = ("type", "company")
    search_fields = ("name", "description")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("name",)


@admin.register(Condition)
class ConditionAdmin(admin.ModelAdmin):
    list_display = ("name", "company", "formula", "user", "created_at")
    search_fields = ("name", "formula")
    list_filter = ("company",)
    readonly_fields = ("created_at", "updated_at")
    ordering = ("name",)


class PositionSkillInline(admin.TabularInline):
    model = PositionSkill
    extra = 1
    autocomplete_fields = ("skill",)
    min_num = 0
    max_num = 20


class PositionConditionInline(admin.TabularInline):
    model = PositionCondition
    extra = 1
    autocomplete_fields = ("condition",)
    min_num = 0
    max_num = 20


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "company",
        "category",
        "status",
        "is_library",
        "expected_hiring_date",
        "number_to_hire",
        "created_at",
    )
    list_filter = ("status", "is_library", "company", "category")
    search_fields = ("name", "description")
    readonly_fields = ("created_at", "updated_at")
    inlines = [PositionSkillInline, PositionConditionInline]
    ordering = ("-created_at",)

    fieldsets = (
        (None, {"fields": ("company", "user", "category", "name", "description")}),
        ("Recruitment Info", {
            "fields": (
                "expected_hiring_date",
                "number_to_hire",
                "number_to_shortlist",
                "status",
                "is_library",
            )
        }),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )
