from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import (
    QuizTemplate, QuizCategory, Question, QuestionChoice, QuizInstance
)
from .serializers import (
    QuizTemplateSerializer, QuizCategorySerializer, QuestionSerializer,
    QuestionChoiceSerializer, QuizInstanceSerializer
)

class QuizTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = QuizTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = QuizTemplate.objects.filter(company=self.request.user.company)
        skill_id = self.request.query_params.get('skill')
        if skill_id:
            qs = qs.filter(skill_id=skill_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

class QuizCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = QuizCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = QuizCategory.objects.filter(template__company=self.request.user.company)
        template_id = self.request.query_params.get('template')
        if template_id:
            qs = qs.filter(template_id=template_id)
        return qs

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Question.objects.filter(template__company=self.request.user.company)

class QuestionChoiceViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionChoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuestionChoice.objects.filter(question__template__company=self.request.user.company)

class QuizInstanceViewSet(viewsets.ModelViewSet):
    serializer_class = QuizInstanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuizInstance.objects.filter(template__company=self.request.user.company)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        instance = self.get_object()
        instance.is_completed = True
        # normally scoring logic would go here
        instance.save()
        return Response({'status': 'completed'})

class PublicQuizViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def generate_quiz(self, request):
        template_id = request.data.get('template_id')
        candidate_id = request.data.get('candidate_id', 0)
        # Dummy generation
        return Response({"quiz_id": 42, "message": "Quiz generated successfully"})

    @action(detail=True, methods=['get'])
    def quiz(self, request, pk=None):
        return Response({"quiz_id": pk, "questions": []})

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        return Response({"status": "submitted", "score": 85.0})
