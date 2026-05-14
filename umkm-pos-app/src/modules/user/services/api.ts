import api from '@/plugins/axios.ts';

export const getListUser = async (data: any, options: any = {}) => {
  return await api.get(
    '/api/v1/users',
    { params: data, ...(options || {}) },
  );
};

export const getDetailUser = async (id: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/users/${id}`,
    { ...(options || {}) },
  );
};

export const postUser = async (data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/users`,
    data,
    { ...(options || {}) },
  );
};

export const putUser = async (id: string | number, data: any, options: any = {}) => {
  console.log('putUser', data);
  return await api.patch(
    `/api/v1/users/${id}`,
    data,
    { ...(options || {}) },
  );
};

export const deactivateUser = async (id: string | number, options: any = {}) => {
  return await api.delete(
    `/api/v1/users/${id}`,
    { ...(options || {}) },
  );
};

export const getUserRole = async (id: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/rbac/users/${id}/roles`,
    { ...(options || {}) },
  );
};

export const assignRoleToUser = async (data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/rbac/user-roles`,
    data,
    { ...(options || {}) },
  );
};

export const revokeRoleFromUser = async (data: any, options: any = {}) => {
  return await api.delete(
    `/api/v1/rbac/user-roles`,
    { ...(options || {}), data },
  );
};
