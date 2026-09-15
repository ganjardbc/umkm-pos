import api from '@/plugins/axios.ts';

export const getListUser = async (data: any, options: any = {}) => {
  return await api.get(
    '/api/v1/admin/users',
    { params: data, ...(options || {}) },
  );
};

export const getDetailUser = async (id: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/admin/users/${id}`,
    { ...(options || {}) },
  );
};

export const postUser = async (data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/admin/users`,
    data,
    { ...(options || {}) },
  );
};

export const putUser = async (id: string | number, data: any, options: any = {}) => {
  return await api.patch(
    `/api/v1/admin/users/${id}`,
    data,
    { ...(options || {}) },
  );
};

export const deactivateUser = async (id: string | number, options: any = {}) => {
  return await api.delete(
    `/api/v1/admin/users/${id}`,
    { ...(options || {}) },
  );
};

export const getUserRole = async (id: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/admin/users/${id}/roles`,
    { ...(options || {}) },
  );
};

export const assignRoleToUser = async (id: string | number, data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/admin/users/${id}/roles`,
    data,
    { ...(options || {}) },
  );
};

export const revokeRoleFromUser = async (id: string | number, data: any, options: any = {}) => {
  return await api.delete(
    `/api/v1/admin/users/${id}/roles`,
    { ...(options || {}), data },
  );
};
