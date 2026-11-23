import axios, { AxiosError } from 'axios';
import type { ApiErrorBody } from './handleApiError';

let clearAuthHandler: (() => void) | null = null;

export function registerAuthClearHandler(handler: () => void) {
  clearAuthHandler = handler;
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const detail = error.response?.data?.detail;

    const isLoginOrMe =
      url.includes('/auth/token') || url.includes('/auth/me');

    const isDeactivated =
      status === 400 &&
      typeof detail === 'string' &&
      detail.toLowerCase().includes('desactivada');

    if ((status === 401 && !isLoginOrMe) || (isDeactivated && !isLoginOrMe)) {
      clearAuthHandler?.();
    }

    return Promise.reject(error);
  },
);