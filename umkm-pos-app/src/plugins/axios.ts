import axios from "axios";

import { getToken, removeAuth, isLogin } from '@/helpers/auth.ts';
import { PREFIX_ROUTE_PATH } from '@/modules/auth/services/constants.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add a request interceptor with token
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // You can modify the request config here if needed
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Add a response interceptor when got 403 error
// and throw to the page login
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response && error.response.status === 401 && isLogin()) {
      const confirm = window.confirm("Session has expired. Please log in again.");
      if (confirm) {
        removeAuth();
        window.location.href = PREFIX_ROUTE_PATH;
      }
    }
    return Promise.reject(error);
  }
);

export const get = async (url: string, config = {}) => {
	return api.get(url, config);
};

export const post = async (url: string, data: any, config = {}) => {
	return api.post(url, data, config);
};

export const put = async (url: string, data: any, config = {}) => {
	return api.put(url, data, config);
};

export const del = async (url: string, config = {}) => {
	return api.delete(url, config);
};

export default api;
