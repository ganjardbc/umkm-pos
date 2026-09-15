import api from '@/plugins/axios.ts';

export const getDetailMerchants = async (id: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/merchants/${id}`,
    { ...(options || {}) },
  );
};

export const putMerchants = async (id: string | number, data: any, options: any = {}) => {
  return await api.patch(
    `/api/v1/merchants/${id}`,
    data,
    { ...(options || {}) },
  );
};
