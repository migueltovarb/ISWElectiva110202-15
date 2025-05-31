import MockAdapter from 'axios-mock-adapter';
import apiClient from './config';
import * as securityService from './security';
import { describe, it, expect, afterEach } from 'vitest';

const mock = new MockAdapter(apiClient);

describe('Security Service', () => {
  const incidentId = 1;
  const protocolId = 2;
  const eventId = 3;
  const roundId = 4;
  const executionId = 5;

  const mockIncident: securityService.IncidentResponse = {
    id: incidentId,
    title: 'Incendio',
    description: 'Incendio en el almacén',
    location: 'Almacén 3',
    severity: 'high',
    status: 'new',
    reported_by: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  const mockComment: securityService.IncidentCommentResponse = {
    id: 100,
    incident: incidentId,
    user: 1,
    comment: 'Comentario de prueba',
    created_at: '2025-01-01T01:00:00Z',
    is_system_comment: false,
  };

  const mockProtocol: securityService.EmergencyProtocolResponse = {
    id: protocolId,
    name: 'Evacuación',
    description: 'Protocolo de evacuación',
    instructions: 'Salir ordenadamente',
    is_active: true,
    created_by: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  const mockEvent: securityService.EmergencyEventResponse = {
    id: eventId,
    protocol: protocolId,
    activated_by: 1,
    timestamp: '2025-01-01T02:00:00Z',
    affected_zones: [1, 2],
  };

  const mockRound: securityService.SecurityRoundResponse = {
    id: roundId,
    name: 'Ronda Nocturna',
    is_active: true,
    created_by: 1,
    created_at: '2025-01-01T00:00:00Z',
    estimated_duration: 30,
  };

  const mockExecution = {
    id: executionId,
    round: roundId,
    status: 'in_progress',
    start_time: '2025-01-01T23:00:00Z',
  };

  afterEach(() => {
    mock.reset();
  });

  it('debería obtener todos los incidentes', async () => {
    mock.onGet('/security/incidents/').reply(200, [mockIncident]);
    const res = await securityService.getIncidents();
    expect(Array.isArray(res) ? res[0].id : res.results[0].id).toBe(incidentId);
  });

  it('debería obtener un incidente por ID', async () => {
    mock.onGet(`/security/incidents/${incidentId}/`).reply(200, mockIncident);
    const res = await securityService.getIncident(incidentId);
    expect(res.title).toBe('Incendio');
  });

  it('debería crear un incidente', async () => {
    const { id, updated_at, created_at, ...data } = mockIncident;
    mock.onPost('/security/incidents/').reply(200, mockIncident);
    const res = await securityService.createIncident(data);
    expect(res.id).toBe(incidentId);
  });

  it('debería actualizar un incidente', async () => {
    const update: Pick<securityService.IncidentResponse, 'status'> = {
      status: 'in_progress',
    };

    mock.onPatch(`/security/incidents/${incidentId}/`).reply(200, {
      ...mockIncident,
      ...update,
    });

    const res = await securityService.updateIncident(incidentId, update);
    expect(res.status).toBe('in_progress');
  });

  it('debería agregar un comentario al incidente', async () => {
    const comment = 'Comentario de prueba';
    mock.onPost(`/security/incidents/${incidentId}/comments/`).reply(200, mockComment);
    const res = await securityService.addIncidentComment(incidentId, comment);
    expect(res.comment).toBe(comment);
  });

  it('debería obtener los protocolos de emergencia', async () => {
    mock.onGet('/security/protocols/').reply(200, [mockProtocol]);
    const res = await securityService.getProtocols();
    expect(Array.isArray(res) ? res[0].name : res.results[0].name).toBe('Evacuación');
  });

  it('debería activar un protocolo', async () => {
    mock.onPost('/security/events/').reply(200, mockEvent);
    const res = await securityService.activateProtocol(protocolId, [1, 2]);
    expect(res.protocol).toBe(protocolId);
  });

  it('debería finalizar una emergencia', async () => {
    const now = new Date().toISOString();
    mock.onPatch(`/security/events/${eventId}/`).reply(200, { ...mockEvent, ended_at: now });
    const res = await securityService.endEmergency(eventId, 'Todo bajo control');
    expect(res.ended_at).toBeDefined();
  });

  it('debería obtener las rondas de seguridad', async () => {
    mock.onGet('/security/rounds/').reply(200, [mockRound]);
    const res = await securityService.getRounds();
    expect(Array.isArray(res) ? res[0].name : res.results[0].name).toBe('Ronda Nocturna');
  });

  it('debería iniciar una ronda de seguridad', async () => {
    mock.onPost('/security/executions/').reply(200, mockExecution);
    const res = await securityService.startRound(roundId);
    expect(res.round).toBe(roundId);
  });

  it('debería completar una ronda de seguridad', async () => {
    mock.onPost(`/security/executions/${executionId}/complete/`).reply(200, {
      ...mockExecution,
      status: 'completed',
    });
    const res = await securityService.completeRound(executionId);
    expect(res.status).toBe('completed');
  });

  it('debería obtener alarmas', async () => {
    const mockAlarms = [{ id: 1, type: 'fire' }, { id: 2, type: 'intrusion' }];
    mock.onGet('/security/alarms/').reply(200, mockAlarms);
    const res = await securityService.getAlarms();
    expect(Array.isArray(res) && res.length).toBeGreaterThan(0);
  });
});
