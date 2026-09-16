import {
  AUTH_KEYS,
  clearSession,
  createHasPermission,
  getMerchant,
  getPermissions,
  getRole,
  getToken,
  getUser,
  isLogin,
  setSession,
  writeJson,
} from '@umkm-pos/ui/auth';

export {
  getToken,
  getUser,
  getMerchant,
  getRole,
  getPermissions,
  isLogin,
};

export const setAuth = (data: any) => {
  const { rbac } = setSession(data);

  // Admin has no active-outlet context: permissions are the union of every
  // role assignment the admin holds.
  const permissions = [
    ...new Set<string>(
      rbac.flatMap((f: any) => f.role?.permissions?.map((p: any) => p.code) || []),
    ),
  ];
  const firstRole = rbac?.[0]?.role || {};

  writeJson(AUTH_KEYS.permissions, permissions);
  writeJson(AUTH_KEYS.role, {
    id: firstRole?.id,
    name: firstRole?.name,
    description: firstRole?.description,
  });
};

export const isHasPermission = createHasPermission(['dashboard.view']);

export const getPersonalInformation = () => ({
  user: getUser(),
  role: getRole(),
  merchant: getMerchant(),
  permissions: getPermissions(),
});

export const removeAuth = clearSession;
