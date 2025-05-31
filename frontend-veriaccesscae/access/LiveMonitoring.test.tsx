import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import LiveMonitoring from './LiveMonitoring';
import { accessService } from '../lib/api';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Mock del servicio: la ruta debe coincidir con la importación real
vi.mock('../lib/api', () => ({
  accessService: {
    getAccessLogs: vi.fn(),
  },
}));

const mockLogs = [
  {
    id: 1,
    user_detail: { username: 'jdoe', full_name: 'John Doe' },
    access_point_detail: { name: 'Puerta A', location: 'Lobby' },
    timestamp: new Date().toISOString(),
    status: 'granted',
    direction: 'in',
  },
];

describe('LiveMonitoring Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading placeholders initially', async () => {
    (accessService.getAccessLogs as any).mockResolvedValue({ results: mockLogs });

    render(<LiveMonitoring />);

    await waitFor(() =>
      expect(screen.getByText(/Monitoreo en Tiempo Real/i)).toBeInTheDocument()
    );
  });

  it('should render access logs after fetching', async () => {
    (accessService.getAccessLogs as any).mockResolvedValue({ results: mockLogs });

    render(<LiveMonitoring />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Puerta A/)).toBeInTheDocument();
      expect(screen.getByText(/Permitido/)).toBeInTheDocument();
    });
  });

  it('should show an error message when fetching fails', async () => {
    (accessService.getAccessLogs as any).mockRejectedValue(new Error('Network error'));

    render(<LiveMonitoring />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error al cargar los registros de acceso/)
      ).toBeInTheDocument();
    });
  });

  it('should allow manual refresh by clicking the "Actualizar" button', async () => {
    (accessService.getAccessLogs as any).mockResolvedValue({ results: mockLogs });

    render(<LiveMonitoring />);
    await waitFor(() => screen.getByText(/John Doe/));

    fireEvent.click(screen.getByText(/Actualizar/));

    await waitFor(() => {
      expect(accessService.getAccessLogs).toHaveBeenCalledTimes(2);
    });
  });

  // ⏱ Test con timeout extendido a 15 segundos
  it(
    'should auto-refresh every 10 seconds',
    async () => {
      (accessService.getAccessLogs as any).mockResolvedValue({ results: mockLogs });

      render(<LiveMonitoring />);
      await waitFor(() => screen.getByText(/John Doe/));

      await new Promise((res) => setTimeout(res, 11000)); // espera el segundo fetch

      expect(accessService.getAccessLogs).toHaveBeenCalledTimes(2);
    },
    15000 // ⬅ aumenta el timeout de este test
  );

  it('should show fallback when no logs are returned', async () => {
    (accessService.getAccessLogs as any).mockResolvedValue({ results: [] });

    render(<LiveMonitoring />);

    await waitFor(() => {
      expect(screen.getByText(/No hay registros de acceso recientes/)).toBeInTheDocument();
    });
  });
});
