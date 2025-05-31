import MockAdapter from 'axios-mock-adapter';
import apiClient from './config';
import * as parkingService from './parking';
import { vi, describe, it, expect, afterEach } from 'vitest';

const mock = new MockAdapter(apiClient);

describe('Parking Service', () => {
  const vehicleId = 1;
  const areaId = 2;

  const mockVehicle = {
    id: vehicleId,
    user: 1,
    license_plate: 'ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    color: 'Red',
    parking_area: areaId,
    is_active: true,
  };

  const mockParkingArea = {
    id: areaId,
    name: 'Zona A',
    max_capacity: 50,
    current_count: 20,
    is_active: true,
    available_spots: 30,
  };

  const mockAccess = {
    id: 1,
    vehicle: vehicleId,
    parking_area: areaId,
    valid_from: '2025-01-01T00:00:00Z',
    valid_to: null,
  };

  afterEach(() => {
    mock.reset();
  });

  describe('Vehicle functions', () => {
    it('should get vehicles', async () => {
      mock.onGet('/parking/vehicles/').reply(200, [mockVehicle]);
      const res = await parkingService.getVehicles();
      expect(res).toEqual([mockVehicle]);
    });

    it('should get a single vehicle', async () => {
      mock.onGet(`/parking/vehicles/${vehicleId}/`).reply(200, mockVehicle);
      const res = await parkingService.getVehicle(vehicleId);
      expect(res).toEqual(mockVehicle);
    });

    it('should create a vehicle with user from localStorage', async () => {
      const { id, ...vehicleData } = mockVehicle;

      const mockUser = { id: 1 };
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce(JSON.stringify(mockUser));
      mock.onPost('/parking/vehicles/').reply(200, mockVehicle);

      const res = await parkingService.createVehicle(vehicleData);
      expect(res).toEqual(mockVehicle);
    });

    it('should update a vehicle', async () => {
      const updateData = { color: 'Blue' };
      mock.onPatch(`/parking/vehicles/${vehicleId}/`).reply(200, { ...mockVehicle, ...updateData });

      const res = await parkingService.updateVehicle(vehicleId, updateData);
      expect(res.color).toBe('Blue');
    });

    it('should delete a vehicle', async () => {
      mock.onDelete(`/parking/vehicles/${vehicleId}/`).reply(204);
      await expect(parkingService.deleteVehicle(vehicleId)).resolves.toBeUndefined();
    });
  });

  describe('Parking area functions', () => {
    it('should get parking areas', async () => {
      mock.onGet('/parking/areas/').reply(200, [mockParkingArea]);
      const res = await parkingService.getParkingAreas();
      expect(res).toEqual([mockParkingArea]);
    });

    it('should get available parking areas (paginated)', async () => {
      mock.onGet('/parking/areas/', { params: { active_only: 'true' } }).reply(200, { results: [mockParkingArea] });
      const res = await parkingService.getAvailableParkingAreas();
      expect(res).toEqual([mockParkingArea]);
    });

    it('should get a parking area by id', async () => {
      mock.onGet(`/parking/areas/${areaId}/`).reply(200, mockParkingArea);
      const res = await parkingService.getParkingArea(areaId);
      expect(res.id).toBe(areaId);
    });

    it('should create a parking area', async () => {
      mock.onPost('/parking/areas/').reply(200, mockParkingArea);
      const res = await parkingService.createParkingArea(mockParkingArea);
      expect(res.id).toBe(areaId);
    });

    it('should update a parking area', async () => {
      mock.onPatch(`/parking/areas/${areaId}/`).reply(200, { ...mockParkingArea, name: 'Zona B' });
      const res = await parkingService.updateParkingArea(areaId, { name: 'Zona B' });
      expect(res.name).toBe('Zona B');
    });

    it('should delete a parking area', async () => {
      mock.onDelete(`/parking/areas/${areaId}/`).reply(204);
      await expect(parkingService.deleteParkingArea(areaId)).resolves.toBeUndefined();
    });
  });

  describe('Access and logs', () => {
    it('should get parking access', async () => {
      mock.onGet('/parking/access/').reply(200, [mockAccess]);
      const res = await parkingService.getParkingAccess();
      expect(res).toEqual([mockAccess]);
    });

    it('should create parking access', async () => {
      mock.onPost('/parking/access/').reply(200, mockAccess);
      const res = await parkingService.createParkingAccess(mockAccess);
      expect(res.id).toBe(1);
    });

    it('should update parking access', async () => {
      mock.onPatch(`/parking/access/${mockAccess.id}/`).reply(200, { ...mockAccess, is_active: false });
      const res = await parkingService.updateParkingAccess(mockAccess.id, { is_active: false });
      expect(res.is_active).toBe(false);
    });

    it('should delete parking access', async () => {
      mock.onDelete(`/parking/access/${mockAccess.id}/`).reply(204);
      await expect(parkingService.deleteParkingAccess(mockAccess.id)).resolves.toBeUndefined();
    });

    it('should get parking logs', async () => {
      mock.onGet('/parking/logs/').reply(200, []);
      const res = await parkingService.getParkingLogs();
      expect(res).toEqual([]);
    });
  });

  describe('Utility functions', () => {
    it('should check vehicle access', async () => {
      mock.onPost('/parking/check-access/').reply(200, { has_access: true });
      const res = await parkingService.checkVehicleAccess(vehicleId, areaId);
      expect(res).toBe(true);
    });

    it('should get parking stats', async () => {
      const mockStats = {
        total_capacity: 100,
        current_occupancy: 50,
        available_spots: 50,
        occupancy_percentage: 50,
        areas: [],
      };
      mock.onGet('/parking/areas/stats/').reply(200, mockStats);
      const res = await parkingService.getParkingStats();
      expect(res.total_capacity).toBe(100);
    });

    it('should register entry', async () => {
      const log = {
        id: 1,
        vehicle: vehicleId,
        parking_area: areaId,
        direction: 'in',
        status: 'granted',
        timestamp: new Date().toISOString(),
      };
      mock.onPost('/parking/register-entry/').reply(200, log);
      const res = await parkingService.registerEntry(vehicleId, areaId);
      expect(res.direction).toBe('in');
    });

    it('should register exit', async () => {
      const log = {
        id: 2,
        vehicle: vehicleId,
        parking_area: areaId,
        direction: 'out',
        status: 'granted',
        timestamp: new Date().toISOString(),
      };
      mock.onPost('/parking/register-exit/').reply(200, log);
      const res = await parkingService.registerExit(vehicleId, areaId);
      expect(res.direction).toBe('out');
    });
  });
});
