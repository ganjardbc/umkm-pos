import api from '@/plugins/axios.ts';

export const getListPermission = async (data: any, options: any = {}) => {
  return await api.get(
    '/api/v1/admin/permissions',
    { params: data, ...(options || {}) },
  );
};

export const getDetailPermission = async (id: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/admin/permissions/${id}`,
    { ...(options || {}) },
  );
};

export const postPermission = async (data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/admin/permissions`,
    data,
    { ...(options || {}) },
  );
};

export const deletePermission = async (id: string | number, options: any = {}) => {
  return await api.delete(
    `/api/v1/admin/permissions/${id}`,
    { ...(options || {}) },
  );
};
