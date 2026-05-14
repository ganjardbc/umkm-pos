import api from '@/plugins/axios.ts';

export const getListnotification = async (data: any, options:any = {}) => {
  return await api.get(
    '/api/notification',
    { params: data, ...(options || {}) },
  );
};

export const getDetailnotification = async (id: string|number, options:any = {}) => {
  return await api.get(
    `/api/notification/${id}`,
    { ...(options || {}) },
  );
};

export const postnotification = async (data: any, options:any = {}) => {
  return await api.post(
    `/api/notification`,
    data,
    { ...(options || {}) },
  );
};

export const putnotification = async (id: string|number, data: any, options:any = {}) => {
  return await api.put(
    `/api/notification/${id}`,
    data,
    { ...(options || {}) },
  );
};
