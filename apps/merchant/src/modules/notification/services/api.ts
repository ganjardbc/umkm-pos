import api from '@/plugins/axios.ts';

export const getListNotification = async (params: any = {}, options: any = {}) => {
  return await api.get('/api/v1/notification', { params, ...(options || {}) });
};

export const getDetailNotification = async (id: string | number, options: any = {}) => {
  return await api.get(`/api/v1/notification/${id}`, { ...(options || {}) });
};

export const markNotificationAsRead = async (id: string | number, options: any = {}) => {
  return await api.patch(`/api/v1/notification/${id}/read`, {}, { ...(options || {}) });
};

export const markAllNotificationAsRead = async (options: any = {}) => {
  return await api.patch('/api/v1/notification/read-all', {}, { ...(options || {}) });
};
