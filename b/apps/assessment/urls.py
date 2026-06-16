from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuizTemplateViewSet, QuizCategoryViewSet, QuestionViewSet,
    QuestionChoiceViewSet, QuizInstanceViewSet, PublicQuizViewSet
)

router = DefaultRouter()
router.register(r'templates', QuizTemplateViewSet, basename='template')
router.register(r'categories', QuizCategoryViewSet, basename='category')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'choices', QuestionChoiceViewSet, basename='choice')
router.register(r'quizzes', QuizInstanceViewSet, basename='quiz')

urlpatterns = [
    path('', include(router.urls)),
    path('public/generate_quiz/', PublicQuizViewSet.as_view({'post': 'generate_quiz'}), name='public-generate-quiz'),
    path('public/quiz/<int:pk>/', PublicQuizViewSet.as_view({'get': 'quiz'}), name='public-quiz'),
    path('public/quiz/<int:pk>/submit/', PublicQuizViewSet.as_view({'post': 'submit'}), name='public-submit'),
]
