from rest_framework import serializers
from .models import Skill, Condition, Position, PositionSkill, PositionCondition, PositionCategory
from drf_spectacular.utils import extend_schema_field


class PositionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PositionCategory
        fields = ["id", "name", "description"]


class SkillSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "type", "description"]


class ConditionSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition
        fields = ["id", "name", "description", "formula"]


class PositionSkillSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source="skill.id")
    name = serializers.ReadOnlyField(source="skill.name")
    type = serializers.ReadOnlyField(source="skill.type")

    class Meta:
        model = PositionSkill
        fields = ["id", "name", "type", "weight"]


class PositionConditionSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source="condition.id")
    name = serializers.ReadOnlyField(source="condition.name")

    class Meta:
        model = PositionCondition
        fields = ["id", "name"]


class PositionSerializer(serializers.ModelSerializer):
    category = PositionCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=PositionCategory.objects.all(), source="category", write_only=True, required=False
    )

    hard_skills = serializers.SerializerMethodField()
    soft_skills = serializers.SerializerMethodField()
    conditions = serializers.SerializerMethodField()

    hard_skill_ids = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    soft_skill_ids = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    condition_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)

    class Meta:
        model = Position
        fields = [
            "id", "company", "user", "category", "category_id", "name", "description",
            "expected_hiring_date", "number_to_hire", "number_to_shortlist", "status",
            "is_library", "hard_skills", "soft_skills", "conditions",
            "hard_skill_ids", "soft_skill_ids", "condition_ids",
            "created_at", "updated_at"
        ]
        read_only_fields = ["company", "user", "created_at", "updated_at"]
    
    @extend_schema_field(PositionSkillSerializer(many=True))
    def get_hard_skills(self, obj):
        qs = obj.positionskill_set.filter(skill__type="hard")
        return PositionSkillSerializer(qs, many=True).data

    @extend_schema_field(PositionSkillSerializer(many=True))
    def get_soft_skills(self, obj):
        qs = obj.positionskill_set.filter(skill__type="soft")
        return PositionSkillSerializer(qs, many=True).data

    @extend_schema_field(PositionConditionSerializer(many=True))
    def get_conditions(self, obj):
        qs = obj.positioncondition_set.all()
        return PositionConditionSerializer(qs, many=True).data

    def create(self, validated_data):
        hard_skill_data = validated_data.pop("hard_skill_ids", [])
        soft_skill_data = validated_data.pop("soft_skill_ids", [])
        condition_ids = validated_data.pop("condition_ids", [])
        position = Position.objects.create(**validated_data)
        for entry in hard_skill_data + soft_skill_data:
            PositionSkill.objects.create(position=position, skill_id=entry["id"], weight=entry.get("weight", 3))
        for cond_id in condition_ids:
            PositionCondition.objects.create(position=position, condition_id=cond_id)
        return position

    def update(self, instance, validated_data):
        hard_skill_data = validated_data.pop("hard_skill_ids", None)
        soft_skill_data = validated_data.pop("soft_skill_ids", None)
        condition_ids = validated_data.pop("condition_ids", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if hard_skill_data is not None or soft_skill_data is not None:
            PositionSkill.objects.filter(position=instance).delete()
            for entry in (hard_skill_data or []) + (soft_skill_data or []):
                PositionSkill.objects.create(position=instance, skill_id=entry["id"], weight=entry.get("weight", 3))
        if condition_ids is not None:
            PositionCondition.objects.filter(position=instance).delete()
            for cond_id in condition_ids:
                PositionCondition.objects.create(position=instance, condition_id=cond_id)
        return instance


class PositionLibraryShortSerializer(serializers.ModelSerializer):
    category = PositionCategorySerializer(read_only=True)

    class Meta:
        model = Position
        fields = ["id", "name", "description", "category", "company_id", "is_library"]
