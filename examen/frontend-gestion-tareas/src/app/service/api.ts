import { Tarea, EstadoTarea } from '../types/tarea';

const API_URL = 'http://localhost:8000/api';

export const tareaService = {
  async getTareas(): Promise<Tarea[]> {
    try {
      const response = await fetch(`${API_URL}/tareas-simple/`);
      if (!response.ok) {
        throw new Error('Error al obtener tareas');
      }
      const data = await response.json();
      return data.tareas || [];
    } catch (error) {
      console.error('Error en getTareas:', error);
      throw error;
    }
  },

  async createTarea(tarea: { nombre: string; estado: EstadoTarea }): Promise<Tarea> {
    try {
      const response = await fetch(`${API_URL}/tareas-simple/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tarea),
      });
      if (!response.ok) {
        throw new Error('Error al crear tarea');
      }
      return response.json();
    } catch (error) {
      console.error('Error en createTarea:', error);
      throw error;
    }
  },

  async updateTarea(id: number, tarea: { nombre: string; estado: EstadoTarea }): Promise<Tarea> {
    try {
      const response = await fetch(`${API_URL}/tareas-simple/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tarea),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar tarea');
      }
      return response.json();
    } catch (error) {
      console.error('Error en updateTarea:', error);
      throw error;
    }
  },

  async deleteTarea(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/tareas-simple/${id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar tarea');
      }
    } catch (error) {
      console.error('Error en deleteTarea:', error);
      throw error;
    }
  },
};