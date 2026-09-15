import api from '@/plugins/axios.ts';
import type { LoginPayload } from './types';

export const postLogin = (data: LoginPayload, options: any = {}) => {
  return api.post('/api/v1/admin/auth/login', data, { ...options });
};
