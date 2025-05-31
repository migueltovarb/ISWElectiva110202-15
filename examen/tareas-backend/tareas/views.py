from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import Tarea
from .serializers import TareaSerializer

class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer

# Vista alternativa con funciones simples
@csrf_exempt
@require_http_methods(["GET", "POST"])
def tareas_list(request):
    if request.method == 'GET':
        tareas = Tarea.objects.all()
        data = []
        for tarea in tareas:
            data.append({
                'id': tarea.id,
                'nombre': tarea.nombre,
                'estado': tarea.estado,
                'fecha_creacion': tarea.fecha_creacion.isoformat(),
                'fecha_modificacion': tarea.fecha_modificacion.isoformat(),
            })
        return JsonResponse({'tareas': data})
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            tarea = Tarea.objects.create(
                nombre=data['nombre'],
                estado=data.get('estado', 'pendiente')
            )
            return JsonResponse({
                'id': tarea.id,
                'nombre': tarea.nombre,
                'estado': tarea.estado,
                'fecha_creacion': tarea.fecha_creacion.isoformat(),
                'fecha_modificacion': tarea.fecha_modificacion.isoformat(),
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def tarea_detail(request, pk):
    try:
        tarea = Tarea.objects.get(pk=pk)
    except Tarea.DoesNotExist:
        return JsonResponse({'error': 'Tarea no encontrada'}, status=404)
    
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            tarea.nombre = data.get('nombre', tarea.nombre)
            tarea.estado = data.get('estado', tarea.estado)
            tarea.save()
            return JsonResponse({
                'id': tarea.id,
                'nombre': tarea.nombre,
                'estado': tarea.estado,
                'fecha_creacion': tarea.fecha_creacion.isoformat(),
                'fecha_modificacion': tarea.fecha_modificacion.isoformat(),
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        tarea.delete()
        return JsonResponse({'message': 'Tarea eliminada correctamente'})

