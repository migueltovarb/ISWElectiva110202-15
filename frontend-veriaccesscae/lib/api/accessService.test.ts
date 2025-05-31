import { vi, describe, it, expect, beforeEach } from 'vitest';
import apiClient from './config';
import {
  getAccessPoints,
  createVisitor,
  updateVisitorStatus,
  getAccessLogs,
  getQRCode,
} from './access';

vi.mock('./config', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

const mockedApiClient = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('Access Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch access points', async () => {
    const mockData = [
      { id: 1, name: 'Main Gate', location: 'Front', is_active: true, max_capacity: 100, current_count: 10, created_at: '2024-01-01T00:00:00Z' }
    ];
    mockedApiClient.get.mockResolvedValueOnce({ data: mockData });

    const result = await getAccessPoints();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/access/access-points/');
    expect(result).toEqual(mockData);
  });

  it('should create a visitor with default pending status', async () => {
    const inputData = {
      first_name: 'John',
      last_name: 'Doe',
      id_number: '123456'
    };
    const mockResponse = {
      ...inputData,
      status: 'pending',
      id: 1,
      created_at: '2024-01-01T00:00:00Z'
    };

    mockedApiClient.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await createVisitor(inputData);

    expect(mockedApiClient.post).toHaveBeenCalled();
    expect(result.status).toBe('pending');
  });

  it('should update visitor status using primary endpoint', async () => {
    const mockResponse = {
      id: 1,
      status: 'approved',
      created_at: '2024-01-01T00:00:00Z',
      first_name: 'Jane',
      last_name: 'Smith',
      id_number: '78910'
    };

    mockedApiClient.patch.mockResolvedValueOnce({ data: mockResponse });

    const result = await updateVisitorStatus(1, 'approved');

    expect(mockedApiClient.patch).toHaveBeenCalledWith('/access/visitors/1/update_status/', { status: 'approved' });
    expect(result.status).toBe('approved');
  });

  it('should fetch access logs with params', async () => {
    const mockLogs = [
      { id: 1, access_point: 1, timestamp: '2024-01-01T00:00:00Z', status: 'granted', direction: 'in' }
    ];
    mockedApiClient.get.mockResolvedValueOnce({ data: mockLogs });

    const result = await getAccessLogs({ limit: 5 });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/access/access-logs/', { params: { limit: 5 } });
    expect(result).toEqual(mockLogs);
  });

  it('should fetch QR code image by ID', async () => {
    const mockQRCode = { qr_code_image: 'base64string==' };
    mockedApiClient.get.mockResolvedValueOnce({ data: mockQRCode });

    const result = await getQRCode(123);

    expect(mockedApiClient.get).toHaveBeenCalledWith('/access/visitor-access/123/qr_image/');
    expect(result.qr_code_image).toBe('base64string==');
  });
});
