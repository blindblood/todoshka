from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .models import Task
from django.contrib.auth.decorators import login_required

from .serializers import TaskSerializer


def home(request):
    return render(request, 'tasks/home.html')


class TaskViewSet(ModelViewSet):
    queryset = Task.objects.select_related('user', 'parent_task').all()

    serializer_class = TaskSerializer
    # permission_classes = [IsAuthenticated]


