import api from '@/plugins/axios.ts';

export const getListCustomers = async (params: any, options: any = {}) => {
  return await api.get('/api/v1/customers', { params, ...(options || {}) });
};

export const getDetailCustomer = async (id: string, options: any = {}) => {
  return await api.get(`/api/v1/customers/${id}`, { ...(options || {}) });
};

export const postCustomer = async (data: any, options: any = {}) => {
  return await api.post('/api/v1/customers', data, { ...(options || {}) });
};

export const patchCustomer = async (id: string, data: any, options: any = {}) => {
  return await api.patch(`/api/v1/customers/${id}`, data, { ...(options || {}) });
};

export const deleteCustomer = async (id: string, options: any = {}) => {
  return await api.delete(`/api/v1/customers/${id}`, { ...(options || {}) });
};
