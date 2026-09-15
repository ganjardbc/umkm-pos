import api from '@/plugins/axios.ts';

export const getDashboardStats = async (options: any = {}) => {
  return await api.get(
    '/api/v1/admin/dashboard/stats',
    { ...(options || {}) },
  );
};
