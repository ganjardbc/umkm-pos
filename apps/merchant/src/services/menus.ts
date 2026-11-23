const DEFAULT_FEATURE_FLAG = true;

// Dashboard
import { PREFIX_ROUTE_PATH as PRP_DASHBOARD } from '@/modules/dashboard/services/constants';
import { PERMISSIONS as DASHBOARD_PERMISSIONS } from '@/modules/dashboard/services/rbac.ts';

// Outlet
import { PREFIX_ROUTE_PATH as PRP_OUTLET } from '@/modules/outlet/services/constants';
import { PERMISSIONS as OUTLET_PERMISSIONS } from '@/modules/outlet/services/rbac.ts';

// Product
import { PREFIX_ROUTE_PATH as PRP_PRODUCT } from '@/modules/product/services/constants';
import { PERMISSIONS as PRODUCT_PERMISSIONS } from '@/modules/product-lists/services/rbac';

// Stock
import { PREFIX_ROUTE_PATH as PRP_STOCK } from '@/modules/stock/services/constants';
import { PERMISSIONS as STOCK_PERMISSIONS } from '@/modules/stock/services/rbac.ts';


// Transaction
import { PREFIX_ROUTE_PATH as PRP_TRANSACTION } from '@/modules/transaction/services/constants';
import { PERMISSIONS as TRANSACTION_PERMISSIONS } from '@/modules/transaction/services/rbac.ts';

// Cashier
import { PREFIX_ROUTE_PATH as PRP_CASHIER } from '@/modules/cashier/services/constants';
import { PERMISSIONS as CASHIER_PERMISSIONS } from '@/modules/cashier/services/rbac.ts';

// User
import { PREFIX_ROUTE_PATH as PRP_USER } from '@/modules/user/services/constants';
import { PERMISSIONS as USER_PERMISSIONS } from '@/modules/user/services/rbac.ts';

// Customers
import { PREFIX_ROUTE_PATH as PRP_CUSTOMERS } from '@/modules/customers/services/constants';
import { PERMISSIONS as CUSTOMER_PERMISSIONS } from '@/modules/customers/services/rbac.ts';

// Reports
import { PATH_EXPORTS as PRP_REPORT_EXPORTS, PATH_SHIFTS as PRP_REPORT_SHIFTS, PATH_SALES as PRP_REPORT_SALES, PATH_OUTLETS as PRP_REPORT_OUTLETS } from '@/modules/reports/services/constants';
import { PERMISSIONS as REPORTS_PERMISSIONS } from '@/modules/reports/services/rbac.ts';
import { PERMISSIONS as SHIFT_PERMISSIONS } from '@/modules/shift/services/rbac.ts';

export default [
  {
    icon: 'pi pi-objects-column',
    label: 'Dashboard',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: DASHBOARD_PERMISSIONS,
    route: PRP_DASHBOARD,
  },

  // Penjualan
  {
    group: 'Penjualan',
    icon: 'pi pi-desktop',
    label: 'Kasir',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: CASHIER_PERMISSIONS,
    route: PRP_CASHIER,
  },
  {
    group: 'Penjualan',
    icon: 'pi pi-list',
    label: 'Transaksi',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: TRANSACTION_PERMISSIONS,
    route: PRP_TRANSACTION,
  },
  {
    group: 'Penjualan',
    icon: 'pi pi-id-card',
    label: 'Pelanggan',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: CUSTOMER_PERMISSIONS,
    route: PRP_CUSTOMERS,
  },

  // Inventori
  {
    group: 'Inventori',
    icon: 'pi pi-box',
    label: 'Produk',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: PRODUCT_PERMISSIONS,
    route: PRP_PRODUCT,
  },
  {
    group: 'Inventori',
    icon: 'pi pi-table',
    label: 'Stok',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: STOCK_PERMISSIONS,
    route: PRP_STOCK,
  },

  // Manajemen
  {
    group: 'Manajemen',
    icon: 'pi pi-sitemap',
    label: 'Outlet',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: OUTLET_PERMISSIONS,
    route: PRP_OUTLET,
  },
  {
    group: 'Manajemen',
    icon: 'pi pi-users',
    label: 'Pengguna',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: USER_PERMISSIONS,
    route: PRP_USER,
  },

  // Laporan
  {
    group: 'Laporan',
    icon: 'pi pi-chart-line',
    label: 'Laporan Penjualan',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: REPORTS_PERMISSIONS,
    route: PRP_REPORT_SALES,
  },
  {
    group: 'Laporan',
    icon: 'pi pi-sitemap',
    label: 'Perbandingan Outlet',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: REPORTS_PERMISSIONS,
    route: PRP_REPORT_OUTLETS,
  },
  {
    group: 'Laporan',
    icon: 'pi pi-wallet',
    label: 'Laporan Kasir',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: SHIFT_PERMISSIONS,
    route: PRP_REPORT_SHIFTS,
  },
  {
    group: 'Laporan',
    icon: 'pi pi-download',
    label: 'Ekspor Laporan',
    featureFlag: DEFAULT_FEATURE_FLAG,
    permissions: REPORTS_PERMISSIONS,
    route: PRP_REPORT_EXPORTS,
  },
];
