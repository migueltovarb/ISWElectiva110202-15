import { describe, it, expect, vi } from 'vitest';
import * as api from './index';

// ✅ Mocks corregidos según los nombres reales
vi.mock('./aunt', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}));
vi.mock('./access', () => ({
  getAccessLogs: vi.fn(), // ← corregido
}));
vi.mock('./security', () => ({
  getAlarms: vi.fn(), // ← usa una función real aquí si aplica
}));
vi.mock('./parking', () => ({
  getParkingStats: vi.fn(), // ← corregido
}));
vi.mock('./notifications', () => ({
  getNotifications: vi.fn(),
}));
vi.mock('./reports', () => ({
  getReports: vi.fn(),
}));
vi.mock('./config', () => ({
  __esModule: true,
  default: { defaults: { baseURL: 'http://localhost:8000/api' } },
}));

describe('API index exports', () => {
  it('should export apiClient as default from config', () => {
    expect(api.apiClient).toBeDefined();
    expect(api.apiClient.defaults.baseURL).toBe('http://localhost:8000/api');
  });

  it('should re-export authService with expected methods', () => {
    expect(api.authService).toBeDefined();
    expect(typeof api.authService.login).toBe('function');
    expect(typeof api.authService.logout).toBe('function');
  });

  it('should re-export accessService with expected methods', () => {
    expect(api.accessService).toBeDefined();
    expect(typeof api.accessService.getAccessLogs).toBe('function'); // ← corregido
  });

  it('should re-export securityService with at least one method', () => {
    expect(api.securityService).toBeDefined();
    expect(typeof api.securityService.getAlarms).toBe('function'); // ← ajusta según tu código
  });

  it('should re-export parkingService with expected methods', () => {
    expect(api.parkingService).toBeDefined();
    expect(typeof api.parkingService.getParkingStats).toBe('function'); // ← corregido
  });

  it('should re-export notificationService with expected methods', () => {
    expect(api.notificationService).toBeDefined();
    expect(typeof api.notificationService.getNotifications).toBe('function');
  });

  it('should re-export reportService with expected methods', () => {
    expect(api.reportService).toBeDefined();
    expect(typeof api.reportService.getReports).toBe('function');
  });
});
