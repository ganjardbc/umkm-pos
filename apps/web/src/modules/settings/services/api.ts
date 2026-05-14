import api from '@/plugins/axios.ts';

import type {
  UpdateProfileDto,
  ChangePasswordDto,
  ChangeEmailDto,
  VerifyEmailDto,
  DeactivateAccountDto,
  SiteSettingsDto,
} from './types';

// Profile
export const getProfile = async (options: any = {}) => {
  return api.get(
    '/api/v1/settings/profile',
    { ...(options || {}) },
  );
};

export const updateProfile = async (data: UpdateProfileDto, options: any = {}) => {
  return api.put(
    '/api/v1/settings/profile',
    data,
    { ...(options || {}) },
  );
};

// Password
export const changePassword = async (data: ChangePasswordDto, options: any = {}) => {
  return api.put(
    '/api/v1/settings/password',
    data,
    { ...(options || {}) },
  );
};

// Email
export const verifyEmailRequest = async (data: VerifyEmailDto, options: any = {}) => {
  return api.post(
    '/api/v1/settings/email/verify',
    data,
    { ...(options || {}) },
  );
};

export const updateEmail = async (data: ChangeEmailDto, options: any = {}) => {
  return api.put(
    '/api/v1/settings/email',
    data,
    { ...(options || {}) },
  );
};

// Account
export const deactivateAccount = async (data: DeactivateAccountDto, options: any = {}) => {
  return api.post(
    '/api/v1/settings/account/deactivate',
    data,
    { ...(options || {}) },
  );
};

// Site Settings
export const getSiteSettings = async (options: any = {}) => {
  return api.get(
    '/api/v1/settings/site',
    { ...(options || {}) },
  );
};

export const updateSiteSettings = async (data: SiteSettingsDto, options: any = {}) => {
  return api.put(
    '/api/v1/settings/site',
    data,
    { ...(options || {}) },
  );
};
