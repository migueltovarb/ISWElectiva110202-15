export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada';

export interface Tarea {
  id: number;
  nombre: string;
  estado: EstadoTarea;
  fecha_creacion: string;
  fecha_modificacion: string;
}