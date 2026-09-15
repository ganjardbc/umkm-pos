export const __appToken = 'APP_TOKEN';
export const __appBearer = 'APP_BEARER';
export const __appUser = 'APP_USER';
export const __appMerchant = 'APP_MERCHANT';
export const __appRole = 'APP_ACTIVE_ROLE';
export const __appPermissions = 'APP_ACTIVE_PERMISSIONS';
export const __appIsLogin = 'APP_IS_LOGIN';

export const setAuth = (data: any) => {
  localStorage.setItem(__appIsLogin, 'true');
  localStorage.setItem(__appToken, data?.access_token || '');
  localStorage.setItem(__appBearer, data?.token_type || '');

  // User & Merchant
  const user = data?.user || {};
  const merchant = user?.merchant || {};

  delete user.merchant;
  delete user.merchant_id;

  localStorage.setItem(__appUser, JSON.stringify(user));
  localStorage.setItem(__appMerchant, JSON.stringify(merchant));

  // Admin has no active-outlet context: permissions are the union of every
  // role assignment the admin holds.
  const rbac = data?.rbac || [];
  const permissions = [
    ...new Set<string>(
      rbac.flatMap((f: any) => f.role?.permissions?.map((p: any) => p.code) || []),
    ),
  ];
  const firstRole = rbac?.[0]?.role || {};
  const role = {
    id: firstRole?.id,
    name: firstRole?.name,
    description: firstRole?.description,
  };

  localStorage.setItem(__appPermissions, JSON.stringify(permissions));
  localStorage.setItem(__appRole, JSON.stringify(role));
}

export const getToken = () => {
  return localStorage.getItem(__appToken) || '';
}

export const getUser = () => {
  const localUser = localStorage.getItem(__appUser) || '';
  return localUser ? JSON.parse(localUser) : {};
}

export const getMerchant = () => {
  const localMerchant = localStorage.getItem(__appMerchant) || '';
  return localMerchant ? JSON.parse(localMerchant) : {};
}

export const getRole = () => {
  const localRole = localStorage.getItem(__appRole) || '';
  return localRole ? JSON.parse(localRole) : {};
}

export const getPermissions = () => {
  const localPermissions = localStorage.getItem(__appPermissions) || '';
  return localPermissions ? JSON.parse(localPermissions) : [];
}

export const isHasPermission = (permission: string) => {
  const defaultOfPermissions: string[] = ['dashboard.view'];
  const permissions = [...getPermissions(), ...defaultOfPermissions];
  return permissions.includes(permission);
}

export const isLogin = () => {
  return localStorage.getItem(__appIsLogin) || '';
}

export const getPersonalInformation = () => {
  return {
    user: getUser(),
    role: getRole(),
    merchant: getMerchant(),
    permissions: getPermissions(),
  };
}

export const removeAuth = () => {
  localStorage.removeItem(__appToken);
  localStorage.removeItem(__appBearer);
  localStorage.removeItem(__appUser);
  localStorage.removeItem(__appRole);
  localStorage.removeItem(__appMerchant);
  localStorage.removeItem(__appPermissions);
  localStorage.removeItem(__appIsLogin);
}
