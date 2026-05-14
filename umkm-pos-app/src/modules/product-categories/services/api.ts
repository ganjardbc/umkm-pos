import api from '@/plugins/axios.ts';

export const getListCategories = async (data: any, options:any = {}) => {
  return await api.get(
    '/api/v1/products/categories',
    { params: data, ...(options || {}) },
  );
};

export const getActiveCategories = async (data: any, options:any = {}) => {
  return await api.get(
    '/api/v1/products/categories/active/list',
    { params: data, ...(options || {}) },
  );
};

export const getDetailCategories = async (id: string|number, options:any = {}) => {
  return await api.get(
    `/api/v1/products/categories/${id}`,
    { ...(options || {}) },
  );
};

export const postCategories = async (data: any, options:any = {}) => {
  return await api.post(
    `/api/v1/products/categories`,
    data,
    { ...(options || {}) },
  );
};

export const putCategories = async (id: string|number, data: any, options:any = {}) => {
  return await api.patch(
    `/api/v1/products/categories/${id}`,
    data,
    { ...(options || {}) },
  );
};

export const deleteCategories = async (id: string|number, options:any = {}) => {
  return await api.delete(
    `/api/v1/products/categories/${id}`,
    { ...(options || {}) },
  );
};
