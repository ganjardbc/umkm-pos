export interface UpdateProfileDto {
  name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangeEmailDto {
  newEmail: string;
  verificationCode?: string;
}

export interface VerifyEmailDto {
  email: string;
}

export interface DeactivateAccountDto {
  password: string;
  reason?: string;
}

export interface SiteSettingsDto {
  darkMode: boolean;
  language: string;
  timezone: string;
  notificationsEnabled: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}
