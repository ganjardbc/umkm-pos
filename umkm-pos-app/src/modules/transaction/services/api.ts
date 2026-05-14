import api from '@/plugins/axios.ts';

export const getListTransaction = async (data: any, options: any = {}) => {
  return await api.get(
    '/api/v1/transactions',
    { params: data, ...(options || {}) },
  );
};

export const getDetailTransaction = async (id: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/transactions/${id}`,
    { ...(options || {}) },
  );
};

export const postTransaction = async (data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/transactions`,
    data,
    { ...(options || {}) },
  );
};

export const postCancelTransaction = async (id: string | number, options: any = {}) => {
  return await api.post(
    `/api/v1/transactions/${id}/cancel`,
    { ...(options || {}) },
  );
};
