import api from '@/plugins/axios.ts';

export const getListOutlet = async (data: any, options: any = {}) => {
  return await api.get(
    '/api/v1/admin/outlets',
    { params: data, ...(options || {}) },
  );
};

export const getDetailOutlet = async (id: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/admin/outlets/${id}`,
    { ...(options || {}) },
  );
};

export const postOutlet = async (data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/admin/outlets`,
    data,
    { ...(options || {}) },
  );
};

export const putOutlet = async (id: string | number, data: any, options: any = {}) => {
  return await api.patch(
    `/api/v1/admin/outlets/${id}`,
    data,
    { ...(options || {}) },
  );
};

export const deleteOutlet = async (id: string | number, options: any = {}) => {
  return await api.delete(
    `/api/v1/admin/outlets/${id}`,
    { ...(options || {}) },
  );
};
