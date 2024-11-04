from django.urls import path,include
from django.contrib.auth.views import LoginView, LogoutView
from rest_framework.routers import SimpleRouter

from . import views
from .views import TaskViewSet

router = SimpleRouter()
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path("", views.home, name="project_list"),
    path("api/", include(router.urls)),

]