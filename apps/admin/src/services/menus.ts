const DEFAULT_FEATURE_FLAG = true;

// Dashboard
import { PREFIX_ROUTE_PATH as PRP_DASHBOARD } from '@/modules/dashboard/services/constants';
import { PERMISSIONS as DASHBOARD_PERMISSIONS } from '@/modules/dashboard/services/rbac.ts';

// Merchants
import { PREFIX_ROUTE_PATH as PRP_MERCHANTS } from '@/modules/merchants/services/constants';
import { PERMISSIONS as MERCHANTS_PERMISSIONS } from '@/modules/merchants/services/rbac.ts';

// Outlet
import { PREFIX_ROUTE_PATH as PRP_OUTLET } from '@/modules/outlet/services/constants';
import { PERMISSIONS as OUTLET_PERMISSIONS } from '@/modules/outlet/services/rbac.ts';

// User
import { PREFIX_ROUTE_PATH as PRP_USER } from '@/modules/user/services/constants';
import { PERMISSIONS as USER_PERMISSIONS } from '@/modules/user/services/rbac.ts';

// Role
import { PREFIX_ROUTE_PATH as PRP_ROLE } from '@/modules/role/services/constants';
import { PERMISSIONS as ROLE_PERMISSIONS } from '@/modules/role/services/rbac.ts';

// Permission
import { PREFIX_ROUTE_PATH as PRP_PERMISSION } from '@/modules/permission/services/constants';
import { PERMISSIONS as PERMISSION_PERMISSIONS } from '@/modules/permission/services/rbac.ts';

export default [
  {
    icon: 'pi pi-objects-column',
    label: 'Dashboard',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: DASHBOARD_PERMISSIONS,
    route: PRP_DASHBOARD,
  },
  {
    icon: 'pi pi-shop',
    label: 'Merchant',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: MERCHANTS_PERMISSIONS,
    route: PRP_MERCHANTS,
  },
  {
    icon: 'pi pi-sitemap',
    label: 'Outlet',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: OUTLET_PERMISSIONS,
    route: PRP_OUTLET,
  },
  {
    icon: 'pi pi-users',
    label: 'Pengguna',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: USER_PERMISSIONS,
    route: PRP_USER,
  },
  {
    icon: 'pi pi-flag',
    label: 'Role',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: ROLE_PERMISSIONS,
    route: PRP_ROLE,
  },
  {
    icon: 'pi pi-shield',
    label: 'Permission',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: PERMISSION_PERMISSIONS,
    route: PRP_PERMISSION,
  },
];
