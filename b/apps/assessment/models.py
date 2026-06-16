from django.db import models
from django.conf import settings

class QuizTemplate(models.Model):
    LANG_MODE = [('flexible','flexible'),('fixed','fixed')]
    CAT_MIX = [('uniform','uniform'),('weighted','weighted'),('custom','custom')]
    DIFF_MIX = [('uniform','uniform'),('progressive','progressive'),('custom','custom')]
    PURPOSE = [('skill','skill'),('interview','interview'),('satisfaction','satisfaction'),('other','other')]

    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    skill = models.ForeignKey('positions.Skill', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    version = models.CharField(max_length=20, default='1.0')
    description = models.TextField(blank=True)
    purpose = models.CharField(max_length=20, choices=PURPOSE, default='skill')
    language_mode = models.CharField(max_length=20, choices=LANG_MODE, default='fixed')
    language_code = models.CharField(max_length=10, default='en')
    category_mix_mode = models.CharField(max_length=20, choices=CAT_MIX, default='uniform')
    difficulty_mix_mode = models.CharField(max_length=20, choices=DIFF_MIX, default='uniform')
    default_question_count = models.IntegerField(default=10)
    is_library = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class QuizCategory(models.Model):
    template = models.ForeignKey(QuizTemplate, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    weight = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class QuizCategoryTranslation(models.Model):
    category = models.ForeignKey(QuizCategory, on_delete=models.CASCADE, related_name='translations')
    language_code = models.CharField(max_length=10)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)


class Question(models.Model):
    QUESTION_TYPES = [('yesno','yesno'),('single_choice','single_choice'),('multi_choice','multi_choice'),('rating','rating'),('numeric','numeric'),('text','text')]

    template = models.ForeignKey(QuizTemplate, on_delete=models.CASCADE, related_name='questions')
    category = models.ForeignKey(QuizCategory, null=True, blank=True, on_delete=models.SET_NULL)
    text = models.TextField()
    type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    difficulty = models.IntegerField(default=1)
    expected_duration = models.IntegerField(default=60)  # seconds
    max_score = models.FloatField(default=1.0)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    expected_value = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class QuestionTranslation(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='translations')
    language_code = models.CharField(max_length=10)
    text = models.TextField()


class QuestionChoice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.TextField()
    is_correct = models.BooleanField(default=False)
    weight = models.FloatField(default=0.0)


class QuizInstance(models.Model):
    LANG_MODE = [('auto','auto'),('flexible','flexible'),('fixed','fixed')]
    template = models.ForeignKey(QuizTemplate, on_delete=models.CASCADE)
    candidate = models.ForeignKey('candidates.Candidate', on_delete=models.CASCADE)
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    language_mode = models.CharField(max_length=20, choices=LANG_MODE, default='auto')
    language_code = models.CharField(max_length=10, default='en')
    question_count = models.IntegerField(default=10)
    duration_seconds = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
