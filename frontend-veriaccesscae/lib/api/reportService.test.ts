import MockAdapter from 'axios-mock-adapter';
import apiClient from './config';
import * as reportService from './reports';
import { describe, it, expect, afterEach } from 'vitest';

const mock = new MockAdapter(apiClient);

describe('Report Service', () => {
  const reportId = 1;

  const mockReport: reportService.ReportDefinitionResponse = {
    id: reportId,
    name: 'Ventas Mensuales',
    description: 'Reporte de ventas del mes',
    report_type: 'ventas',
    period: 'mensual',
    filters: { region: 'Norte' },
    created_by: 1,
    created_at: '2025-01-01T00:00:00Z',
  };

  const mockGeneratedReport: reportService.GeneratedReportResponse = {
    id: 101,
    report: reportId,
    file: '/files/reporte-enero.pdf',
    format: 'pdf',
    period_start: '2025-01-01',
    period_end: '2025-01-31',
    generated_at: '2025-02-01T00:00:00Z',
    generated_by: 1,
  };

  const mockSchedule: reportService.ReportScheduleResponse = {
    id: 201,
    report: reportId,
    is_active: true,
    run_daily: false,
    run_weekly: true,
    day_of_week: 1,
    run_monthly: false,
    run_time: '08:00:00',
    created_by: 1,
    created_at: '2025-01-01T00:00:00Z',
  };

  afterEach(() => {
    mock.reset();
  });

  it('debería obtener todos los reportes', async () => {
    mock.onGet('/reports/definitions/').reply(200, [mockReport]);
    const res = await reportService.getReports();
    expect(Array.isArray(res) ? res[0].id : res.results[0].id).toBe(reportId);
  });

  it('debería obtener un reporte por ID', async () => {
    mock.onGet(`/reports/definitions/${reportId}/`).reply(200, mockReport);
    const res = await reportService.getReport(reportId);
    expect(res.id).toBe(reportId);
  });

  it('debería crear un reporte', async () => {
    const { id, ...partialReport } = mockReport;
    mock.onPost('/reports/definitions/').reply(200, mockReport);
    const res = await reportService.createReport(partialReport);
    expect(res.name).toBe(mockReport.name);
    expect(res.filters.region).toBe('Norte');
  });

  it('debería generar un reporte', async () => {
    const { report, ...params } = mockGeneratedReport;
    mock.onPost('/reports/generated/').reply(200, mockGeneratedReport);
    const res = await reportService.generateReport(reportId, params);
    expect(res.format).toBe('pdf');
    expect(res.period_start).toBe('2025-01-01');
  });

  it('debería obtener reportes generados', async () => {
    mock.onGet('/reports/generated/', { params: { report: reportId } }).reply(200, [mockGeneratedReport]);
    const res = await reportService.getGeneratedReports(reportId);
    expect(Array.isArray(res) ? res[0].id : res.results[0].id).toBe(mockGeneratedReport.id);
  });

  it('debería obtener todos los reportes generados sin filtro', async () => {
    mock.onGet('/reports/generated/').reply(200, [mockGeneratedReport]);
    const res = await reportService.getGeneratedReports();
    expect(Array.isArray(res) ? res[0].file : res.results[0].file).toBe(mockGeneratedReport.file);
  });

  it('debería obtener schedules de un reporte', async () => {
    mock.onGet('/reports/schedules/', { params: { report: reportId } }).reply(200, [mockSchedule]);
    const res = await reportService.getReportSchedules(reportId);
    if (Array.isArray(res)) {
      expect(res[0].run_weekly).toBe(true);
    } else {
      expect(res.results[0].run_weekly).toBe(true);
    }
  });

  it('debería obtener schedules sin filtro', async () => {
    mock.onGet('/reports/schedules/').reply(200, [mockSchedule]);
    const res = await reportService.getReportSchedules();
    if (Array.isArray(res)) {
      expect(res[0].run_time).toBe('08:00:00');
    } else {
      expect(res.results[0].run_time).toBe('08:00:00');
    }
  });

  it('debería crear un schedule de reporte', async () => {
    const { id, ...partialSchedule } = mockSchedule;
    mock.onPost('/reports/schedules/').reply(200, mockSchedule);
    const res = await reportService.createReportSchedule(partialSchedule);
    expect(res.id).toBe(mockSchedule.id);
    expect(res.run_time).toBe('08:00:00');
  });
});
