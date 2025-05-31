'use client';
import { useState } from 'react';
import { Tarea, EstadoTarea } from '../types/tarea';

interface TareaFormProps {
  onSubmit: (tarea: { nombre: string; estado: EstadoTarea }) => void;
  tarea?: Tarea;
  onCancel?: () => void;
}

export default function TareaForm({ onSubmit, tarea, onCancel }: TareaFormProps) {
  const [nombre, setNombre] = useState(tarea?.nombre || '');
  const [estado, setEstado] = useState<EstadoTarea>(tarea?.estado || 'pendiente');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim()) {
      onSubmit({ nombre: nombre.trim(), estado });
      if (!tarea) {
        setNombre('');
        setEstado('pendiente');
      }
    }
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEstado(e.target.value as EstadoTarea);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {tarea ? 'Editar Tarea' : 'Nueva Tarea'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la tarea
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Escribe el nombre de la tarea..."
            required
            maxLength={100}
          />
        </div>
        
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="estado"
            value={estado}
            onChange={handleEstadoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {tarea ? 'Actualizar' : 'Crear'} Tarea
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}