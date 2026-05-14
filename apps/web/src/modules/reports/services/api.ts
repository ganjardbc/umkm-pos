import api from '@/plugins/axios.ts';

export const getListreports = async (data: any, options:any = {}) => {
  return await api.get(
    '/api/reports',
    { params: data, ...(options || {}) },
  );
};

export const getDetailreports = async (id: string|number, options:any = {}) => {
  return await api.get(
    `/api/reports/${id}`,
    { ...(options || {}) },
  );
};

export const postreports = async (data: any, options:any = {}) => {
  return await api.post(
    `/api/reports`,
    data,
    { ...(options || {}) },
  );
};

export const putreports = async (id: string|number, data: any, options:any = {}) => {
  return await api.put(
    `/api/reports/${id}`,
    data,
    { ...(options || {}) },
  );
};

// Export API endpoints - returns blob data
export const exportSummary = async (params: any, options: any = {}): Promise<Blob> => {
  const response = await api.get(
    '/api/v1/reports/export/summary',
    { params, responseType: 'blob', ...(options || {}) },
  );
  return response.data;
};

export const exportDailyReports = async (params: any, options: any = {}): Promise<Blob> => {
  const response = await api.get(
    '/api/v1/reports/export/daily',
    { params, responseType: 'blob', ...(options || {}) },
  );
  return response.data;
};

export const exportTopProducts = async (params: any, options: any = {}): Promise<Blob> => {
  const response = await api.get(
    '/api/v1/reports/export/top-products',
    { params, responseType: 'blob', ...(options || {}) },
  );
  return response.data;
};

export const exportOutletComparison = async (params: any, options: any = {}): Promise<Blob> => {
  const response = await api.get(
    '/api/v1/reports/export/outlet-comparison',
    { params, responseType: 'blob', ...(options || {}) },
  );
  return response.data;
};
