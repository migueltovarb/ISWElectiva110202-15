import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import apiClient, {
  API_URL,
  retryRequest,
  attachRequestInterceptor,
  attachResponseInterceptor,
} from './config';

// ✅ Mock de axios que soporta función + objeto
vi.mock('axios', async () => {
  const actualAxios = await vi.importActual<typeof import('axios')>('axios');

  const handlers = {
    request: {
      handler: null,
      use: vi.fn((fn) => {
        handlers.request.handler = fn;
      }),
    },
    response: {
      handler: null,
      use: vi.fn((_, errorFn) => {
        handlers.response.handler = errorFn;
      }),
    },
  };

  // Axios instance mockeada: objeto + función (vi.fn())
  const mockedInstance: any = Object.assign(
    vi.fn(), // hace que apiClient(...) funcione
    {
      defaults: {
        baseURL: 'http://localhost:8000/api',
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      },
      interceptors: handlers,
      request: vi.fn(), // puede ser sobreescrito
    }
  );

  const axiosMock = Object.assign(() => mockedInstance, actualAxios.default, {
    create: () => mockedInstance,
    post: vi.fn(),
  });

  // Exponer interceptores a los tests
  (axiosMock as any).handlers = handlers;

  return {
    default: axiosMock,
  };
});

import axios from 'axios';

let localStorageMock: Record<string, string> = {};

beforeEach(() => {
  // Simular localStorage
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => localStorageMock[key] || null,
    setItem: (key: string, value: string) => {
      localStorageMock[key] = value;
    },
    removeItem: (key: string) => {
      delete localStorageMock[key];
    },
    clear: () => {
      localStorageMock = {};
    },
  });

  localStorageMock = {};

  attachRequestInterceptor();
  attachResponseInterceptor();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('apiClient config', () => {
  it('should use the correct API base URL and headers', () => {
    expect(apiClient.defaults.baseURL).toBe(API_URL);
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    expect(apiClient.defaults.timeout).toBe(30000);
  });

  it('should add Authorization header if token exists', async () => {
    localStorage.setItem('access_token', 'mocked-token');

    const handler = (axios as any).handlers.request.handler;
    const mockConfig = { headers: {} };
    const result = await handler(mockConfig);

    expect(result.headers.Authorization).toBe('Bearer mocked-token');
  });

  it('should retry and refresh token on 401 response once', async () => {
    localStorage.setItem('refresh_token', 'refresh-token-old');

    const error = {
      config: {
        _retry: false,
        url: `${API_URL}/some-protected-route`,
        method: 'get',
        headers: {},
      },
      response: {
        status: 401,
      },
      message: 'Unauthorized',
    };

    // Simular refresco de token
    vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { access: 'new-token' } });

    // Mock de reintento del request original
    const retryMock = vi.fn().mockResolvedValue({ data: 'ok' });
    (apiClient as any).mockImplementation(retryMock); // apiClient(...) funciona

    const handler = (axios as any).handlers.response.handler;
    const result = await handler(error);

    expect(localStorage.getItem('access_token')).toBe('new-token');
    expect(retryMock).toHaveBeenCalledOnce();
    expect(result.data).toBe('ok');
  });

  it('retryRequest should retry the given function up to 3 times', async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const result = await retryRequest(mockFn, 3, 1);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('retryRequest should throw error after max retries', async () => {
    const alwaysFail = vi.fn().mockRejectedValue(new Error('always fail'));

    await expect(retryRequest(alwaysFail, 2, 1)).rejects.toThrow('always fail');
    expect(alwaysFail).toHaveBeenCalledTimes(2);
  });
});
