export const __appToken = 'APP_TOKEN';
export const __appBearer = 'APP_BEARER';
export const __appUser = 'APP_USER';
export const __appMerchant = 'APP_MERCHANT';
export const __appListOutlet = 'APP_LIST_OUTLET';
export const __appOutlet = 'APP_ACTIVE_OUTLET';
export const __appRole = 'APP_ACTIVE_ROLE';
export const __appPermissions = 'APP_ACTIVE_PERMISSIONS';
export const __appIsLogin = 'APP_IS_LOGIN';

export const setAuth = (data: any) => {
  localStorage.setItem(__appIsLogin, 'true');
  localStorage.setItem(__appToken, data?.access_token || '');
  localStorage.setItem(__appBearer, data?.token_type || '');

  // User & Merchant
  const user = data?.user || '';
  const merchant = user?.merchant || '';

  delete user.merchant;
  delete user.merchant_id;

  localStorage.setItem(__appUser, JSON.stringify(user));
  localStorage.setItem(__appMerchant, JSON.stringify(merchant));

  // List Outlet & Permissions
  const listOutlet = data?.rbac?.flatMap((f: any) => ({
    outlet: f.outlet,
    permissions: f.role?.permissions?.flatMap((f: any) => f.code) || [],
    role: {
      id: f.role?.id,
      name: f.role?.name,
      description: f.role?.description,
    },
  })) || [];
  localStorage.setItem(__appListOutlet, JSON.stringify(listOutlet));

  // Outlet, Roles & Permissions
  const rbac = data?.rbac?.[0] || {};
  const role = rbac?.role || {};
  const outlet = rbac?.outlet || {};
  const permissions = role?.permissions?.flatMap((f: any) => f.code) || [];
  
  delete role.permissions;
  
  localStorage.setItem(__appPermissions, JSON.stringify(permissions));
  localStorage.setItem(__appRole, JSON.stringify(role));
  localStorage.setItem(__appOutlet, JSON.stringify(outlet));
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

export const getListOutlet = () => {
  const localOutlet = localStorage.getItem(__appListOutlet) || '';
  return localOutlet ? JSON.parse(localOutlet) : {};
}

export const getOutlet = () => {
  const localOutlet = localStorage.getItem(__appOutlet) || '';
  return localOutlet ? JSON.parse(localOutlet) : {};
}

export const setOutlet = (outlet: any) => {
  localStorage.setItem(__appPermissions, JSON.stringify(outlet?.permissions));
  localStorage.setItem(__appRole, JSON.stringify(outlet?.role));
  localStorage.setItem(__appOutlet, JSON.stringify(outlet?.outlet));
}

export const getRole = () => {
  const localRole = localStorage.getItem(__appRole) || '';
  return localRole ? JSON.parse(localRole) : {};
}

export const isUserNotAdmin = () => {
  const { name } = getRole();
  const whiteListRoles = ['admin', 'superadmin'];
  return !whiteListRoles.includes(name);
}

export const getPermissions = () => {
  const localPermissions = localStorage.getItem(__appPermissions) || '';
  return localPermissions ? JSON.parse(localPermissions) : [];
}

export const isHasPermission = (permission: string) => {
  const defaultOfPermissions: string[] = ['dashboard.view', 'reports.view'];
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
    outlet: getOutlet(),
    permissions: getPermissions(),
  };
}

export const removeAuth = () => {
  localStorage.removeItem(__appToken);
  localStorage.removeItem(__appUser);
  localStorage.removeItem(__appRole);
  localStorage.removeItem(__appMerchant);
  localStorage.removeItem(__appListOutlet);
  localStorage.removeItem(__appOutlet);
  localStorage.removeItem(__appPermissions);
  localStorage.removeItem(__appIsLogin);
}
