
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tareas', views.TareaViewSet)

urlpatterns = [
    # API REST con ViewSet
    path('api/', include(router.urls)),
    
    # API simple con funciones
    path('api/tareas-simple/', views.tareas_list, name='tareas-list'),
    path('api/tareas-simple/<int:pk>/', views.tarea_detail, name='tarea-detail'),
]