import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const isBrowser = typeof window !== 'undefined';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ----------- Interceptor de Request -----------
export const attachRequestInterceptor = () => {
  return apiClient.interceptors.request.use(
    (config) => {
      if (isBrowser) {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      console.log(`Request sent to: ${config.url}`, {
        method: config.method,
        data: config.data,
        params: config.params,
      });
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// ----------- Interceptor de Response -----------
export const attachResponseInterceptor = () => {
  return apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`Response from ${response.config.url}:`, {
        status: response.status,
        statusText: response.statusText,
      });
      return response;
    },
    async (error) => {
      const originalRequest = error.config || {};
      originalRequest._retry = originalRequest._retry || false;

      console.error('API Error:', {
        request: {
          url: originalRequest.url,
          method: originalRequest.method,
          data: originalRequest.data,
        },
        response: error.response
          ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
          : 'No response',
        message: error.message,
      });

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !== `${API_URL}/auth/login/` &&
        isBrowser
      ) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) throw new Error('No refresh token available');

          console.log('Intentando refrescar el token...');
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('access_token', response.data.access);
          console.log('Token refrescado exitosamente');

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          if (isBrowser) {
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      }

      if (error.response) {
        let errorMessage = '';

        switch (error.response.status) {
          case 400:
            console.error('API Error: Bad Request (400)', {
              url: error.config?.url || 'unknown',
              method: error.config?.method || 'unknown',
              data: error.response.data || 'No data',
            });
            break;
          case 403:
            console.error('API Error: Forbidden (403)', {
              url: error.config?.url || 'unknown',
              method: error.config?.method || 'unknown',
            });
            break;
          case 404:
            console.error('API Error: Not Found (404)', {
              url: error.config?.url || 'unknown',
              method: error.config?.method || 'unknown',
            });
            break;
          case 500:
            console.error('API Error: Server Error (500)', {
              url: error.config?.url || 'unknown',
              method: error.config?.method || 'unknown',
            });

            if (error.config?.url?.includes('/access/visitors/')) {
              console.warn('500 relacionado con visitantes. Verificar el backend.');

              if (originalRequest.method === 'get') {
                console.info('Devolviendo array vacío por error 500 en GET visitantes');
                return { data: [] };
              } else if (
                originalRequest.method === 'post' ||
                originalRequest.method === 'patch'
              ) {
                console.error('Error POST/PATCH visitante - posible campo "status" ausente');
                throw new Error(
                  'Error al procesar visitante: La base de datos puede necesitar migración para agregar campos necesarios'
                );
              }
            }
            break;
          default:
            console.error('API Error:', {
              status: error.response.status,
              statusText: error.response.statusText,
              url: error.config?.url || 'unknown',
              method: error.config?.method || 'unknown',
              data: error.response.data || 'No data',
            });
        }

        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (typeof error.response.data === 'object') {
            errorMessage = Object.entries(error.response.data)
              .map(([field, messages]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(', ')}`;
                } else if (typeof messages === 'string') {
                  return `${field}: ${messages}`;
                }
                return `${field}: Error de validación`;
              })
              .join('; ');
          }

          if (errorMessage) {
            console.error('Mensaje de error detallado:', errorMessage);
          }
        }
      } else if (error.request) {
        console.error('API Error: No se recibió respuesta del servidor', {
          url: error.config?.url || 'unknown',
          method: error.config?.method || 'unknown',
        });
        console.info('Posibles soluciones: verificar backend, CORS, red.');
      } else {
        console.error('API Error:', error.message);
      }

      if (
        error.config?.url?.includes('/access/visitors/') &&
        error.config.method === 'get'
      ) {
        console.warn('Usando fallback para visitantes por error.');
        return { data: [] };
      }

      return Promise.reject(error);
    }
  );
};

// Inicializa todos los interceptores en producción
export const initInterceptors = () => {
  if (isBrowser) {
    attachRequestInterceptor();
    attachResponseInterceptor();
  }
};

// Retry con reintento automático
export const retryRequest = async (
  requestFn: () => Promise<any>,
  maxRetries = 3,
  delay = 1000
) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await requestFn();
    } catch (error) {
      retries++;
      if (retries === maxRetries) throw error;
      console.warn(`Reintentando solicitud fallida (intento ${retries}/${maxRetries})...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default apiClient;
