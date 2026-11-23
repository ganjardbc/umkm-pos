import api from '@/plugins/axios.ts';

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

export const exportTransactionsCsv = async (params: any, options: any = {}): Promise<Blob> => {
  const response = await api.get(
    '/api/v1/reports/export/transactions',
    { params, responseType: 'blob', ...(options || {}) },
  );
  return response.data;
};

// JSON endpoints — unwrap the TransformInterceptor envelope.
const get = async (url: string, params: any) => (await api.get(url, { params })).data?.data;

export const getSummary = (params: any) => get('/api/v1/reports/summary', params);
export const getDailySales = (params: any) => get('/api/v1/reports/daily', params);
export const getTopProducts = (params: any) => get('/api/v1/reports/top-products', params);
export const getOutletComparison = (params: any) => get('/api/v1/reports/outlet-comparison', params);
