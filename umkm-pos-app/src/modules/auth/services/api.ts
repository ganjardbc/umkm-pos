import api from '@/plugins/axios.ts';
import type { LoginPayload, RegisterPayload } from './types';

export const postLogin = (data: LoginPayload, options: any = {}) => {
  return api.post(
    '/api/v1/auth/login',
    data,
    { ...(options || {}) },
  );
};

export const postRegister = (data: RegisterPayload, options: any = {}) => {
  return api.post(
    '/api/v1/auth/register',
    data,
    { ...(options || {}) },
  );
};
