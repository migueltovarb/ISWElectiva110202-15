import { describe, it, expect } from 'vitest';
import type { PaginatedResponse } from './types';
import type { IncidentResponse } from './security';

describe('PaginatedResponse<T>', () => {
  it('debería representar correctamente una respuesta paginada de incidentes', () => {
    const mockPaginatedResponse: PaginatedResponse<IncidentResponse> = {
      count: 2,
      next: 'http://api.example.com/incidents?page=2',
      previous: null,
      results: [
        {
          id: 1,
          title: 'Incendio',
          description: 'Incendio en el almacén',
          location: 'Almacén 3',
          severity: 'high',
          status: 'new',
          reported_by: 1,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 2,
          title: 'Fuga de gas',
          description: 'Se detectó fuga en planta 1',
          location: 'Planta 1',
          severity: 'critical',
          status: 'in_progress',
          reported_by: 2,
          created_at: '2025-01-02T00:00:00Z',
          updated_at: '2025-01-02T00:00:00Z',
        },
      ],
    };

    expect(mockPaginatedResponse.count).toBe(2);
    expect(mockPaginatedResponse.next).toContain('page=2');
    expect(mockPaginatedResponse.previous).toBeNull();
    expect(mockPaginatedResponse.results.length).toBe(2);
    expect(mockPaginatedResponse.results[0].title).toBe('Incendio');
    expect(mockPaginatedResponse.results[1].severity).toBe('critical');
  });
});
