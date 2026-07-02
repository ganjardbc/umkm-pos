/**
 * GOLDEN EXAMPLE — Frontend API Service
 *
 * Source: apps/web/src/modules/notification/services/api.ts
 *
 * Rules illustrated:
 * - Import dari @/plugins/axios — bukan `import axios from 'axios'` atau raw fetch
 * - Named exports per endpoint, bukan default export class
 * - Signature konsisten: (params?, options?) untuk GET; (data, options?) untuk POST/PATCH
 * - Tidak ada business logic di sini — hanya HTTP binding
 * - File ini adalah SATU-SATUNYA tempat axios dipanggil untuk modul ini
 *   Component/store boleh import fungsi-fungsi ini, tapi tidak boleh panggil axios langsung
 */

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
