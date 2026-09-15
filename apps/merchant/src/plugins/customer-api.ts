import axios from 'axios';
import { getCustomerSessionToken, clearCustomerSession } from '@/helpers/customer-session.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const customerApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

customerApi.interceptors.request.use((config) => {
  const sessionToken = getCustomerSessionToken();
  if (sessionToken) {
    config.headers['x-customer-session-token'] = sessionToken;
  }
  return config;
});

customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearCustomerSession();
    }
    return Promise.reject(error);
  },
);

export default customerApi;
