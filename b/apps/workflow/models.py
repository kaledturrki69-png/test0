from django.db import models
from django.conf import settings

class WorkflowConfig(models.Model):
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    position = models.ForeignKey('positions.Position', on_delete=models.CASCADE)
    stages = models.JSONField(default=list)
    settings = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
