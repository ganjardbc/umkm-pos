import api from '@/plugins/axios.ts';

export const getDetailprofile = async (options:any = {}) => {
  return await api.get(
    `/api/v1/auth/profile`,
    { ...(options || {}) },
  );
};
