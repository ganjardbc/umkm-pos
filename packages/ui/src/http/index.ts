import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { clearSession, getToken, isLogin } from '../auth';

export interface CreateApiClientOptions {
  baseURL?: string;
  /**
   * Last chance to mutate an outgoing request after the bearer token is
   * attached — e.g. the merchant app adds its active-outlet header here.
   */
  onRequest?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
  /** Where to send the user once an expired session is confirmed. */
  loginPath: string;
  expiredMessage?: string;
}

export const createApiClient = ({
  baseURL = '',
  onRequest,
  loginPath,
  expiredMessage = 'Session has expired. Please log in again.',
}: CreateApiClientOptions): AxiosInstance => {
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use(
    (config) => {
      const token = getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return onRequest ? onRequest(config) : config;
    },
    (error) => Promise.reject(error),
  );

  // On 401 for a session we still believe is live, confirm with the user and
  // bounce them to the login page.
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401 && isLogin()) {
        if (window.confirm(expiredMessage)) {
          clearSession();
          window.location.href = loginPath;
        }
      }
      return Promise.reject(error);
    },
  );

  return api;
};

/**
 * Package-level services (uploads, etc.) need an axios instance, but the
 * instance is configured by the app. The app registers it once at startup.
 */
let apiClient: AxiosInstance | null = null;

export const setApiClient = (client: AxiosInstance) => {
  apiClient = client;
};

export const getApiClient = (): AxiosInstance => {
  if (!apiClient) {
    throw new Error(
      '@umkm-pos/ui: no API client registered. Call setApiClient() during app startup.',
    );
  }
  return apiClient;
};

export type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig };
