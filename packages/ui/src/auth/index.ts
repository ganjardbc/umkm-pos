/**
 * Auth storage primitives shared by every app.
 *
 * Only the parts that are genuinely app-agnostic live here: the localStorage
 * key names, the readers, and the session write/clear. What a login response
 * means — which outlet is active, how permissions are resolved — differs per
 * app, so each app builds its own `setAuth` on top of `setSession`.
 */

export const AUTH_KEYS = {
  token: 'APP_TOKEN',
  bearer: 'APP_BEARER',
  user: 'APP_USER',
  merchant: 'APP_MERCHANT',
  listOutlet: 'APP_LIST_OUTLET',
  outlet: 'APP_ACTIVE_OUTLET',
  role: 'APP_ACTIVE_ROLE',
  permissions: 'APP_ACTIVE_PERMISSIONS',
  isLogin: 'APP_IS_LOGIN',
} as const;

export const readJson = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key) || '';
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getToken = () => localStorage.getItem(AUTH_KEYS.token) || '';

export const getUser = () => readJson<any>(AUTH_KEYS.user, {});

export const getMerchant = () => readJson<any>(AUTH_KEYS.merchant, {});

export const getRole = () => readJson<any>(AUTH_KEYS.role, {});

export const getPermissions = (): string[] => readJson<string[]>(AUTH_KEYS.permissions, []);

export const isLogin = () => localStorage.getItem(AUTH_KEYS.isLogin) || '';

/**
 * Write the parts of a login response every app stores identically, and hand
 * back the `rbac` array so the caller can resolve its own outlet/permission
 * rules. `merchant` is lifted off the user before the user is persisted.
 */
export const setSession = (data: any) => {
  localStorage.setItem(AUTH_KEYS.isLogin, 'true');
  localStorage.setItem(AUTH_KEYS.token, data?.access_token || '');
  localStorage.setItem(AUTH_KEYS.bearer, data?.token_type || '');

  const user = data?.user || {};
  const merchant = user?.merchant || {};

  delete user.merchant;
  delete user.merchant_id;

  writeJson(AUTH_KEYS.user, user);
  writeJson(AUTH_KEYS.merchant, merchant);

  return { user, merchant, rbac: (data?.rbac || []) as any[] };
};

/** Clear every key in AUTH_KEYS; keys an app never writes are simply absent. */
export const clearSession = () => {
  Object.values(AUTH_KEYS).forEach((key) => localStorage.removeItem(key));
};

/**
 * Build an app's permission check. `defaults` are codes every signed-in user of
 * that app implicitly holds.
 */
export const createHasPermission =
  (defaults: string[] = []) =>
  (permission: string) =>
    [...getPermissions(), ...defaults].includes(permission);
