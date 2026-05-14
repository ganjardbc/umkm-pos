import api from '@/plugins/axios.ts';

export const getListStock = async (data: any, options: any = {}) => {
  return await api.get(
    '/api/v1/stock/logs',
    { params: data, ...(options || {}) },
  );
};

export const adjustStock = async (data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/stock/adjust`,
    data,
    { ...(options || {}) },
  );
};
