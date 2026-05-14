import api from '@/plugins/axios.ts';

export const getListRole = async (data: any, options: any = {}) => {
  return await api.get(
    '/api/v1/rbac/roles',
    { params: data, ...(options || {}) },
  );
};

export const getDetailRole = async (id: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/rbac/roles/${id}`,
    { ...(options || {}) },
  );
};

export const postRole = async (data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/rbac/roles`,
    data,
    { ...(options || {}) },
  );
};

export const putRole = async (id: string | number, data: any, options: any = {}) => {
  return await api.patch(
    `/api/v1/rbac/roles/${id}`,
    data,
    { ...(options || {}) },
  );
};

export const deleteRole = async (id: string | number, options: any = {}) => {
  return await api.delete(
    `/api/v1/rbac/roles/${id}`,
    { ...(options || {}) },
  );
};

export const assignPermission = async (id: string | number, data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/rbac/roles/${id}/permissions`,
    data,
    { ...(options || {}) },
  );
};

export const deletePermission = async (id: string | number, permissionId: string | number, options: any = {}) => {
  return await api.delete(
    `/api/v1/rbac/roles/${id}/permissions/${permissionId}`,
    { ...(options || {}) },
  );
};
