'use client';
import { Tarea, EstadoTarea } from '../types/tarea';

interface TareaListProps {
  tareas: Tarea[];
  onEdit: (tarea: Tarea) => void;
  onDelete: (id: number) => void;
}

export default function TareaList({ tareas, onEdit, onDelete }: TareaListProps) {
  const getEstadoColor = (estado: EstadoTarea): string => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoText = (estado: EstadoTarea): string => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_progreso':
        return 'En progreso';
      case 'completada':
        return 'Completada';
      default:
        return estado;
    }
  };

  if (tareas.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-500 text-lg">No hay tareas creadas todavía</p>
        <p className="text-gray-400 text-sm mt-2">Crea tu primera tarea usando el formulario de arriba</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          Lista de Tareas ({tareas.length})
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {tareas.map((tarea) => (
          <div key={tarea.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {tarea.nombre}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(tarea.estado)}`}>
                    {getEstadoText(tarea.estado)}
                  </span>
                  <span>
                    Creada: {new Date(tarea.fecha_creacion).toLocaleDateString('es-ES')}
                  </span>
                  {tarea.fecha_modificacion !== tarea.fecha_creacion && (
                    <span>
                      Modificada: {new Date(tarea.fecha_modificacion).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onEdit(tarea)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(tarea.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}