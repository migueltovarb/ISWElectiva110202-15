import apiClient from './config';
import { PaginatedResponse } from './types';

export interface ParkingAreaResponse {
  id: number;
  name: string;
  description?: string;
  max_capacity: number;
  current_count: number;
  is_active: boolean;
  available_spots: number;
  vehicles_count?: number;
  [key: string]: any;
}

export interface VehicleResponse {
  id: number;
  user: number;
  user_detail?: {
    id: number;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  license_plate: string;
  brand: string;
  model: string;
  color: string;
  parking_area: number;
  parking_area_detail?: ParkingAreaResponse;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface VehicleCreateData {
  license_plate: string;
  brand: string;
  model: string;
  color: string;
  parking_area: number;
  user?: number;
}

export interface VehicleUpdateData {
  license_plate?: string;
  brand?: string;
  model?: string;
  color?: string;
  parking_area?: number;
  is_active?: boolean;
}

export interface ParkingAccessResponse {
  id: number;
  vehicle: number;
  vehicle_detail?: VehicleResponse;
  parking_area: number;
  parking_area_detail?: ParkingAreaResponse;
  valid_from: string;
  valid_to: string | null;
  is_active?: boolean;
  [key: string]: any;
}

export interface ParkingLogResponse {
  id: number;
  vehicle: number;
  vehicle_detail?: VehicleResponse;
  parking_area: number;
  parking_area_detail?: ParkingAreaResponse;
  timestamp: string;
  direction: 'in' | 'out';
  status: 'granted' | 'denied';
  reason?: string;
  [key: string]: any;
}

export interface ParkingStatsResponse {
  total_capacity: number;
  current_occupancy: number;
  available_spots: number;
  occupancy_percentage: number;
  areas: {
    id: number;
    name: string;
    capacity: number;
    occupied: number;
    available: number;
  }[];
}

// Vehículos
export const getVehicles = async (params?: Record<string, any>): Promise<VehicleResponse[] | PaginatedResponse<VehicleResponse>> => {
  try {
    const { data } = await apiClient.get('/parking/vehicles/', { params });
    return data;
  } catch (error) {
    console.error("Error getting vehicles:", error);
    throw new Error('No se pudo obtener la lista de vehículos.');
  }
};

export const getVehicle = async (id: string | number): Promise<VehicleResponse> => {
  try {
    const { data } = await apiClient.get(`/parking/vehicles/${id}/`);
    return data;
  } catch (error) {
    console.error(`Error getting vehicle ${id}:`, error);
    throw new Error(`No se pudo obtener el vehículo con ID ${id}.`);
  }
};

export const createVehicle = async (data: VehicleCreateData): Promise<VehicleResponse> => {
  try {
    let vehicleData = { ...data };

    if (!vehicleData.user) {
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('No se encontró información del usuario. Por favor, inicie sesión nuevamente.');

      const user = JSON.parse(userStr);
      vehicleData.user = user.id;
    }

    const response = await apiClient.post('/parking/vehicles/', vehicleData);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('vehicleCreated'));
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      if (typeof error.response.data === 'object') {
        const errorMessages = Object.entries(error.response.data)
          .map(([field, messages]) => {
            const fieldNames: Record<string, string> = {
              license_plate: 'Placa',
              brand: 'Marca',
              model: 'Modelo',
              color: 'Color',
              parking_area: 'Área de Estacionamiento',
              user: 'Usuario'
            };
            const fieldName = fieldNames[field] || field;
            return Array.isArray(messages) ? `${fieldName}: ${messages.join(', ')}` : `${fieldName}: ${messages}`;
          })
          .join('; ');
        throw new Error(errorMessages || 'Error al crear el vehículo');
      }
      throw new Error(error.response.data);
    }
    throw error;
  }
};

export const updateVehicle = async (id: string | number, data: VehicleUpdateData): Promise<VehicleResponse> => {
  try {
    const response = await apiClient.patch(`/parking/vehicles/${id}/`, data);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('vehicleUpdated'));
    }

    return response.data;
  } catch (error) {
    console.error(`Error updating vehicle ${id}:`, error);
    throw new Error(`No se pudo actualizar el vehículo con ID ${id}.`);
  }
};

export const deleteVehicle = async (id: string | number): Promise<void> => {
  try {
    await apiClient.delete(`/parking/vehicles/${id}/`);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('vehicleDeleted'));
    }
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permisos para eliminar este vehículo.');
    } else if (error.response?.status === 404) {
      throw new Error('El vehículo no fue encontrado.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'No se puede eliminar el vehículo.');
    }
    throw error;
  }
};

// Áreas de estacionamiento
export const getParkingAreas = async (params?: Record<string, any>): Promise<ParkingAreaResponse[] | PaginatedResponse<ParkingAreaResponse>> => {
  try {
    const { data } = await apiClient.get('/parking/areas/', { params });
    return data;
  } catch (error) {
    console.error("Error getting parking areas:", error);
    throw new Error('No se pudo obtener las áreas de estacionamiento.');
  }
};

export const getAvailableParkingAreas = async (): Promise<ParkingAreaResponse[]> => {
  try {
    const { data } = await apiClient.get('/parking/areas/', { params: { active_only: 'true' } });

    if (Array.isArray(data)) {
      return data;
    }
    if (data && 'results' in data) {
      return data.results;
    }
    return [];
  } catch (error) {
    console.error("Error getting available parking areas:", error);
    throw new Error('No se pudo obtener las áreas disponibles.');
  }
};

export const getParkingArea = async (id: string | number): Promise<ParkingAreaResponse> => {
  try {
    const { data } = await apiClient.get(`/parking/areas/${id}/`);
    return data;
  } catch (error) {
    console.error(`Error getting parking area ${id}:`, error);
    throw new Error(`No se pudo obtener el área con ID ${id}.`);
  }
};

export const createParkingArea = async (data: Partial<ParkingAreaResponse>): Promise<ParkingAreaResponse> => {
  try {
    const { data: res } = await apiClient.post('/parking/areas/', data);
    return res;
  } catch (error) {
    console.error("Error creating parking area:", error);
    throw new Error('No se pudo crear el área de estacionamiento.');
  }
};

export const updateParkingArea = async (id: string | number, data: Partial<ParkingAreaResponse>): Promise<ParkingAreaResponse> => {
  try {
    const { data: res } = await apiClient.patch(`/parking/areas/${id}/`, data);
    return res;
  } catch (error) {
    console.error(`Error updating parking area ${id}:`, error);
    throw new Error(`No se pudo actualizar el área con ID ${id}.`);
  }
};

export const deleteParkingArea = async (id: string | number): Promise<void> => {
  try {
    await apiClient.delete(`/parking/areas/${id}/`);
  } catch (error) {
    console.error(`Error deleting parking area ${id}:`, error);
    throw new Error(`No se pudo eliminar el área con ID ${id}.`);
  }
};

// Logs de estacionamiento
export const getParkingLogs = async (params?: Record<string, any>): Promise<ParkingLogResponse[] | PaginatedResponse<ParkingLogResponse>> => {
  try {
    const { data } = await apiClient.get('/parking/logs/', { params });
    return data;
  } catch (error) {
    console.error("Error getting parking logs:", error);
    throw new Error('No se pudo obtener los logs de estacionamiento.');
  }
};

export const getParkingLog = async (id: string | number): Promise<ParkingLogResponse> => {
  try {
    const { data } = await apiClient.get(`/parking/logs/${id}/`);
    return data;
  } catch (error) {
    console.error(`Error getting parking log ${id}:`, error);
    throw new Error(`No se pudo obtener el log con ID ${id}.`);
  }
};

// Acceso de estacionamiento
export const getParkingAccess = async (params?: Record<string, any>): Promise<ParkingAccessResponse[] | PaginatedResponse<ParkingAccessResponse>> => {
  try {
    const { data } = await apiClient.get('/parking/access/', { params });
    return data;
  } catch (error) {
    console.error("Error getting parking access:", error);
    throw new Error('No se pudo obtener los accesos de estacionamiento.');
  }
};

export const createParkingAccess = async (data: Partial<ParkingAccessResponse>): Promise<ParkingAccessResponse> => {
  try {
    const { data: res } = await apiClient.post('/parking/access/', data);
    return res;
  } catch (error) {
    console.error("Error creating parking access:", error);
    throw new Error('No se pudo crear el acceso de estacionamiento.');
  }
};

export const updateParkingAccess = async (id: string | number, data: Partial<ParkingAccessResponse>): Promise<ParkingAccessResponse> => {
  try {
    const { data: res } = await apiClient.patch(`/parking/access/${id}/`, data);
    return res;
  } catch (error) {
    console.error(`Error updating parking access ${id}:`, error);
    throw new Error(`No se pudo actualizar el acceso con ID ${id}.`);
  }
};

export const deleteParkingAccess = async (id: string | number): Promise<void> => {
  try {
    await apiClient.delete(`/parking/access/${id}/`);
  } catch (error) {
    console.error(`Error deleting parking access ${id}:`, error);
    throw new Error(`No se pudo eliminar el acceso con ID ${id}.`);
  }
};

// Funciones de utilidad
export const checkVehicleAccess = async (vehicleId: string | number, areaId: string | number): Promise<boolean> => {
  try {
    const { data } = await apiClient.post<{has_access: boolean}>('/parking/check-access/', {
      vehicle: vehicleId,
      parking_area: areaId
    });
    return data.has_access;
  } catch (error) {
    console.error("Error checking vehicle access:", error);
    return false; // o throw error, dependiendo de tu lógica
  }
};

export const getParkingStats = async (): Promise<ParkingStatsResponse> => {
  try {
    const { data } = await apiClient.get('/parking/areas/stats/');
    return data;
  } catch (error) {
    console.error("Error getting parking stats:", error);
    return {
      total_capacity: 0,
      current_occupancy: 0,
      available_spots: 0,
      occupancy_percentage: 0,
      areas: []
    };
  }
};

// Registrar entrada/salida
export const registerEntry = async (vehicleId: string | number, areaId: string | number): Promise<ParkingLogResponse> => {
  try {
    const { data } = await apiClient.post('/parking/register-entry/', {
      vehicle: vehicleId,
      parking_area: areaId,
      direction: 'in'
    });
    return data;
  } catch (error) {
    console.error("Error registering entry:", error);
    throw error;
  }
};

export const registerExit = async (vehicleId: string | number, areaId: string | number): Promise<ParkingLogResponse> => {
  try {
    const { data } = await apiClient.post('/parking/register-exit/', {
      vehicle: vehicleId,
      parking_area: areaId,
      direction: 'out'
    });
    return data;
  } catch (error) {
    console.error("Error registering exit:", error);
    throw error;
  }
};
