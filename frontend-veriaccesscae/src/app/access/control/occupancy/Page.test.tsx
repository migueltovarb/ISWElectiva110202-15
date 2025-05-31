import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import OccupancyControlPage from './page';

// ✅ Mock de navegación de Next.js
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/mocked-path',
}));

// ✅ Mock del servicio de acceso
vi.mock('../../../../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../../../../lib/api')>('../../../../../lib/api');
  return {
    ...actual,
    accessService: {
      getCurrentOccupancy: vi.fn(),
      updateResidentsCount: vi.fn(),
    },
  };
});

import { accessService } from '../../../../../lib/api';

describe('OccupancyControlPage', () => {
  const mockData = {
    id: 1,
    residents_count: 2,
    visitors_count: 3,
    total_count: 5,
    max_capacity: 10,
    last_updated: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra estado de carga y luego los datos', async () => {
    (accessService.getCurrentOccupancy as any).mockResolvedValue(mockData);

    render(<OccupancyControlPage />);
    
    // ✅ Verifica que el spinner (role=status) está presente
    expect(screen.getByRole('status')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Control de Aforo')).toBeInTheDocument();
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });
  });

  it('permite agregar un residente', async () => {
    (accessService.getCurrentOccupancy as any).mockResolvedValue(mockData);
    (accessService.updateResidentsCount as any).mockResolvedValue({
      ...mockData,
      residents_count: 3,
      total_count: 6,
    });

    render(<OccupancyControlPage />);
    await waitFor(() => screen.getByText('➕ Agregar Residente'));
    fireEvent.click(screen.getByText('➕ Agregar Residente'));

    await waitFor(() => {
      expect(screen.getByText('Residente agregado correctamente')).toBeInTheDocument();
    });
  });

  it('no permite agregar residentes si el aforo está lleno', async () => {
    const fullData = { ...mockData, total_count: 10 };
    (accessService.getCurrentOccupancy as any).mockResolvedValue(fullData);

    render(<OccupancyControlPage />);
    await waitFor(() => {
      expect(screen.getByText('➕ Agregar Residente')).toBeDisabled();
      expect(screen.getByText(/¡Aforo máximo alcanzado!/)).toBeInTheDocument();
    });
  });

  it('permite remover un residente', async () => {
    (accessService.getCurrentOccupancy as any).mockResolvedValue(mockData);
    (accessService.updateResidentsCount as any).mockResolvedValue({
      ...mockData,
      residents_count: 1,
      total_count: 4,
    });

    render(<OccupancyControlPage />);
    await waitFor(() => screen.getByText('➖ Remover Residente'));
    fireEvent.click(screen.getByText('➖ Remover Residente'));

    await waitFor(() => {
      expect(screen.getByText('Residente removido correctamente')).toBeInTheDocument();
    });
  });
});
