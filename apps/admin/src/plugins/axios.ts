import { createApiClient, setApiClient } from '@umkm-pos/ui/http';

import { PREFIX_ROUTE_PATH } from '@/modules/auth/services/constants.ts';

const api = createApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  loginPath: PREFIX_ROUTE_PATH,
});

// Let package-level services (uploads, …) reuse this instance.
setApiClient(api);

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
