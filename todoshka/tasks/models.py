from django.contrib.auth.models import User
from django.db import models


class Task(models.Model):
    TASK_TYPE_CHOICES = (
        ('subtask', 'subtask'),
        ('task', 'task'),
        ('project', 'project'),
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateTimeField(blank=True, null=True)
    parent_task = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True)
    completed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task_type = models.CharField(max_length=10, choices=TASK_TYPE_CHOICES)

    has_time=models.BooleanField(default=False)

    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f'{self.name} comp = {self.completed} due_date ={self.due_date} user = {self.user}'
