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
  readJson,
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

  // Every outlet the user can act in, each with its own role + permission set.
  const listOutlet = rbac.map((f: any) => ({
    outlet: f.outlet,
    permissions: f.role?.permissions?.flatMap((p: any) => p.code) || [],
    role: {
      id: f.role?.id,
      name: f.role?.name,
      description: f.role?.description,
    },
  }));
  writeJson(AUTH_KEYS.listOutlet, listOutlet);

  // The first assignment becomes the active outlet context.
  const first = rbac?.[0] || {};
  const role = first?.role || {};
  const permissions = role?.permissions?.flatMap((f: any) => f.code) || [];

  delete role.permissions;

  writeJson(AUTH_KEYS.permissions, permissions);
  writeJson(AUTH_KEYS.role, role);
  writeJson(AUTH_KEYS.outlet, first?.outlet || {});
};

export const getListOutlet = () => readJson<any>(AUTH_KEYS.listOutlet, {});

export const getOutlet = () => readJson<any>(AUTH_KEYS.outlet, {});

/** Switch the active outlet context to one of the entries from getListOutlet(). */
export const setOutlet = (outlet: any) => {
  writeJson(AUTH_KEYS.permissions, outlet?.permissions);
  writeJson(AUTH_KEYS.role, outlet?.role);
  writeJson(AUTH_KEYS.outlet, outlet?.outlet);
};

export const isUserNotAdmin = () => {
  const { name } = getRole();
  const whiteListRoles = ['admin', 'superadmin'];
  return !whiteListRoles.includes(name);
};

export const isHasPermission = createHasPermission(['dashboard.view', 'reports.view']);

export const getPersonalInformation = () => ({
  user: getUser(),
  role: getRole(),
  merchant: getMerchant(),
  outlet: getOutlet(),
  permissions: getPermissions(),
});

export const removeAuth = clearSession;
