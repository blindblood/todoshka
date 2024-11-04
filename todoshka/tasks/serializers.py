from rest_framework import serializers
from .models import Task
from django.utils import timezone
from datetime import datetime

class TaskSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    parent_task_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'name', 'description', 'due_date', 'parent_task', 'completed', 'user', 'task_type', 'has_time',
                  'added_at', 'updated_at',  'parent_task_name']

    def get_parent_task_name(self, obj):
        return obj.parent_task.name if obj.parent_task else None