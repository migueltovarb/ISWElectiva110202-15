// app/page.tsx - CORREGIDO
'use client';
import { useState, useEffect } from 'react';
import TareaForm from './components/TareaForm';
import TareaList from './components/TareaList';
import { Tarea, EstadoTarea } from './types/tarea';
import { tareaService } from './service/api';

type MessageType = {
  text: string;
  type: 'success' | 'error';
} | null;

export default function Home() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<MessageType>(null);

  // Cargar tareas al iniciar
  useEffect(() => {
    loadTareas();
  }, []);

  // Auto-ocultar mensajes después de 3 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadTareas = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await tareaService.getTareas();
      setTareas(data);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      setMessage({ text: 'Error al cargar las tareas', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTarea = async (tareaData: { nombre: string; estado: EstadoTarea }): Promise<void> => {
    try {
      const nuevaTarea = await tareaService.createTarea(tareaData);
      setTareas(prev => [nuevaTarea, ...prev]);
      setMessage({ text: 'Tarea creada exitosamente', type: 'success' });
    } catch (error) {
      console.error('Error al crear tarea:', error);
      setMessage({ text: 'Error al crear la tarea', type: 'error' });
    }
  };

  const handleUpdateTarea = async (tareaData: { nombre: string; estado: EstadoTarea }): Promise<void> => {
    if (!editingTarea) return;
    
    try {
      const tareaActualizada = await tareaService.updateTarea(editingTarea.id, tareaData);
      setTareas(prev => 
        prev.map(tarea => 
          tarea.id === editingTarea.id ? tareaActualizada : tarea
        )
      );
      setEditingTarea(null);
      setMessage({ text: 'Tarea actualizada exitosamente', type: 'success' });
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      setMessage({ text: 'Error al actualizar la tarea', type: 'error' });
    }
  };

  const handleEditTarea = (tarea: Tarea): void => {
    setEditingTarea(tarea);
  };

  const handleCancelEdit = (): void => {
    setEditingTarea(null);
  };

  const handleDeleteTarea = async (id: number): Promise<void> => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      await tareaService.deleteTarea(id);
      setTareas(prev => prev.filter(tarea => tarea.id !== id));
      setMessage({ text: 'Tarea eliminada exitosamente', type: 'success' });
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      setMessage({ text: 'Error al eliminar la tarea', type: 'error' });
    }
  };

  const getEstadisticas = () => {
    return {
      pendientes: tareas.filter(t => t.estado === 'pendiente').length,
      enProgreso: tareas.filter(t => t.estado === 'en_progreso').length,
      completadas: tareas.filter(t => t.estado === 'completada').length,
    };
  };

  const estadisticas = getEstadisticas();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Gestor de Tareas
          </h1>
          <p className="text-gray-600">
            Organiza tus tareas de manera simple y eficiente
          </p>
        </div>

        {/* Mensajes */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              <span className="text-sm font-medium">{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto text-lg font-bold hover:opacity-70"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Formulario */}
        <TareaForm
          onSubmit={editingTarea ? handleUpdateTarea : handleCreateTarea}
          tarea={editingTarea || undefined}
          onCancel={editingTarea ? handleCancelEdit : undefined}
        />

        {/* Lista de tareas */}
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando tareas...</p>
          </div>
        ) : (
          <TareaList
            tareas={tareas}
            onEdit={handleEditTarea}
            onDelete={handleDeleteTarea}
          />
        )}

        {/* Estadísticas simples */}
        {!loading && tareas.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {estadisticas.pendientes}
                </div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {estadisticas.enProgreso}
                </div>
                <div className="text-sm text-gray-600">En progreso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {estadisticas.completadas}
                </div>
                <div className="text-sm text-gray-600">Completadas</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Gestor de Tareas - Django + Next.js</p>
        </div>
      </div>
    </div>
  );
}