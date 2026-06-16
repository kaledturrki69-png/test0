from rest_framework import serializers
from .models import (
    QuizTemplate, QuizCategory, QuizCategoryTranslation,
    Question, QuestionTranslation, QuestionChoice, QuizInstance
)

class QuizCategoryTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizCategoryTranslation
        fields = ['id', 'language_code', 'name', 'description']

class QuizCategorySerializer(serializers.ModelSerializer):
    translations = QuizCategoryTranslationSerializer(many=True, read_only=True)

    class Meta:
        model = QuizCategory
        fields = ['id', 'name', 'description', 'weight', 'template', 'translations', 'created_at', 'updated_at']

class QuestionTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionTranslation
        fields = ['id', 'language_code', 'text']

class QuestionChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionChoice
        fields = ['id', 'text', 'is_correct', 'weight', 'question']

class QuestionSerializer(serializers.ModelSerializer):
    choices = QuestionChoiceSerializer(many=True, read_only=True)
    translations = QuestionTranslationSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'template', 'category', 'category_name', 'text', 'type', 
            'difficulty', 'expected_duration', 'max_score', 'is_active', 
            'order', 'expected_value', 'choices', 'translations', 
            'created_at', 'updated_at'
        ]

class QuizTemplateSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    categories = QuizCategorySerializer(many=True, read_only=True)

    class Meta:
        model = QuizTemplate
        fields = [
            'id', 'name', 'version', 'description', 'skill', 'skill_name',
            'language_mode', 'language_code', 'category_mix_mode', 
            'difficulty_mix_mode', 'default_question_count', 'is_library', 
            'is_published', 'categories', 'created_at', 'updated_at'
        ]

class QuizInstanceSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    skill = serializers.IntegerField(source='template.skill_id', read_only=True)
    skill_name = serializers.CharField(source='template.skill.name', read_only=True)

    class Meta:
        model = QuizInstance
        fields = [
            'id', 'template', 'template_name', 'skill', 'skill_name', 
            'candidate', 'recruiter', 'language_mode', 'language_code', 
            'question_count', 'duration_seconds', 'is_completed', 'score', 
            'created_at', 'updated_at'
        ]
