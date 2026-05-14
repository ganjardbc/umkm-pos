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

// Product
import { PREFIX_ROUTE_PATH as PRP_PRODUCT } from '@/modules/product/services/constants';
import { PERMISSIONS as PRODUCT_PERMISSIONS } from '@/modules/product-lists/services/rbac';

// Stock
import { PREFIX_ROUTE_PATH as PRP_STOCK } from '@/modules/stock/services/constants';
import { PERMISSIONS as STOCK_PERMISSIONS } from '@/modules/stock/services/rbac.ts';

// Shift
import { PREFIX_ROUTE_PATH as PRP_SHIFT } from '@/modules/shift/services/constants';
import { PERMISSIONS as SHIFT_PERMISSIONS } from '@/modules/shift/services/rbac.ts';

// Transaction
import { PREFIX_ROUTE_PATH as PRP_TRANSACTION } from '@/modules/transaction/services/constants';
import { PERMISSIONS as TRANSACTION_PERMISSIONS } from '@/modules/transaction/services/rbac.ts';

// POS
import { PREFIX_ROUTE_PATH as PRP_POS } from '@/modules/pos/services/constants';
import { PERMISSIONS as POS_PERMISSIONS } from '@/modules/pos/services/rbac.ts';

// User
import { PREFIX_ROUTE_PATH as PRP_USER } from '@/modules/user/services/constants';
import { PERMISSIONS as USER_PERMISSIONS } from '@/modules/user/services/rbac.ts';

// Role
import { PREFIX_ROUTE_PATH as PRP_ROLE } from '@/modules/role/services/constants';
import { PERMISSIONS as ROLE_PERMISSIONS } from '@/modules/role/services/rbac.ts';

// Permission
import { PREFIX_ROUTE_PATH as PRP_PERMISSION } from '@/modules/permission/services/constants';
import { PERMISSIONS as PERMISSION_PERMISSIONS } from '@/modules/permission/services/rbac.ts';

// Reports
import { PREFIX_ROUTE_PATH as PRP_REPORTS } from '@/modules/reports/services/constants';
import { PERMISSIONS as REPORTS_PERMISSIONS } from '@/modules/reports/services/rbac.ts';

export default [
  {
    icon: 'pi pi-objects-column',
    label: 'Dashboard',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: DASHBOARD_PERMISSIONS,
    route: PRP_DASHBOARD,
  },
  {
    icon: 'pi pi-desktop',
    label: 'Cashier',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: POS_PERMISSIONS,
    route: PRP_POS,
  },
  {
    icon: 'pi pi-list',
    label: 'Transactions',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: TRANSACTION_PERMISSIONS,
    route: PRP_TRANSACTION,
  },
  {
    icon: 'pi pi-clock',
    label: 'Shifts',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: SHIFT_PERMISSIONS,
    route: PRP_SHIFT,
  },
  {
    icon: 'pi pi-box',
    label: 'Products',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: PRODUCT_PERMISSIONS,
    route: PRP_PRODUCT,
  },
  {
    icon: 'pi pi-table',
    label: 'Stocks',
    featureFlag: false,
    permissions: STOCK_PERMISSIONS,
    route: PRP_STOCK,
  },
  {
    icon: 'pi pi-shop',
    label: 'Merchants',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: MERCHANTS_PERMISSIONS,
    route: PRP_MERCHANTS,
  },
  {
    icon: 'pi pi-sitemap',
    label: 'Outlets',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: OUTLET_PERMISSIONS,
    route: PRP_OUTLET,
  },
  {
    icon: 'pi pi-users',
    label: 'Users',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: USER_PERMISSIONS,
    route: PRP_USER,
  },
  {
    icon: 'pi pi-flag',
    label: 'Roles',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: ROLE_PERMISSIONS,
    route: PRP_ROLE,
  },
  {
    icon: 'pi pi-shield',
    label: 'Permissions',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: PERMISSION_PERMISSIONS,
    route: PRP_PERMISSION,
  },
  {
    icon: 'pi pi-download',
    label: 'Reports',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: REPORTS_PERMISSIONS,
    route: PRP_REPORTS,
  },
];
