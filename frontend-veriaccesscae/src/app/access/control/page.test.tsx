import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import AccessControlPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/access/control/occupancy',
}));

vi.mock('../../../../lib/api', async () => {
  return {
    accessService: {
      getVisitors: vi.fn(),
      deleteVisitor: vi.fn(),
      updateVisitorStatus: vi.fn(),
    },
  };
});

import { accessService } from '../../../../lib/api';

describe('AccessControlPage (con Vitest)', () => {
  const mockVisitors = [
    {
      id: 1,
      first_name: 'Juan',
      last_name: 'Pérez',
      status: 'pending',
      visitor_type: 'temporary',
      apartment_number: '101',
      created_by: null,
    },
    {
      id: 2,
      first_name: 'Ana',
      last_name: 'García',
      status: 'pending',
      visitor_type: 'business',
      created_by: 7,
      created_by_detail: {
        id: 7,
        username: 'ana123',
        full_name: 'Ana Usuario',
      },
    },
    {
      id: 3,
      first_name: 'Carlos',
      last_name: 'Ruiz',
      status: 'inside',
      visitor_type: 'regular',
      created_by: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (accessService.getVisitors as any).mockResolvedValue(mockVisitors);
  });

  it('renderiza y muestra visitantes', async () => {
    render(<AccessControlPage />);

    expect(screen.getByText(/Control de Acceso - Administración/i)).toBeInTheDocument();
    expect(screen.getByText(/Cargando visitantes/i)).toBeInTheDocument();

    const juan = await screen.findByText(/Juan Pérez/i);
    const ana = await screen.findByText(/Ana García/i);
    const carlos = await screen.findAllByText(/Carlos Ruiz/i); // findAll para evitar ambigüedad

    expect(juan).toBeInTheDocument();
    expect(ana).toBeInTheDocument();
    expect(carlos.length).toBeGreaterThan(0);
  });

  it('muestra resumen del aforo correctamente', async () => {
    render(<AccessControlPage />);

    await waitFor(() => {
      // Buscamos los textos estáticos
      expect(screen.getByText(/Visitantes dentro:/i)).toBeInTheDocument();
      expect(screen.getByText(/Total visitantes:/i)).toBeInTheDocument();

      // Y buscamos los valores por separado
      expect(screen.getByText('1')).toBeInTheDocument(); // Carlos está dentro
      expect(screen.getByText('3')).toBeInTheDocument(); // Total de visitantes
    });
  });

  it('muestra los botones según el tipo de visitante', async () => {
    render(<AccessControlPage />);

    const juanBtns = await screen.findAllByTitle(/Permitir acceso a Juan Pérez/i);
    const anaBtns = await screen.findAllByTitle(/Aprobar solicitud de Ana García/i);
    const carlosBtns = await screen.findAllByTitle(/Registrar salida de Carlos Ruiz/i);

    expect(juanBtns.length).toBeGreaterThan(0);
    expect(anaBtns.length).toBeGreaterThan(0);
    expect(carlosBtns.length).toBeGreaterThan(0);
  });

  it('muestra sección de visitantes dentro del edificio', async () => {
    render(<AccessControlPage />);
    await screen.findByText(/Visitantes Dentro del Edificio/i);

    const carlosList = await screen.findAllByText(/Carlos Ruiz/i);
    expect(carlosList.length).toBeGreaterThan(0);
  });
});
