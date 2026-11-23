import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
  PATH_EXPORTS,
  PATH_SHIFTS,
  PATH_SALES,
  PATH_OUTLETS,
} from '@/modules/reports/services/constants.ts';
import { READ } from '@/modules/reports/services/rbac.ts';
import { READ as SHIFT_READ } from '@/modules/shift/services/rbac.ts';

const crumbs = (label: string, route: string) => [
  { label: 'Beranda', route: '/landing', isActive: false },
  { label: 'Laporan', route: PATH_SALES, isActive: false },
  { label, route, isActive: true },
];

export default [
  // Old entry point, kept so bookmarks keep working.
  { path: PREFIX_ROUTE_PATH, redirect: PATH_SALES },
  {
    path: PATH_SALES,
    name: `${PREFIX_ROUTE_NAME}-sales`,
    component: () => import('@/modules/reports/pages/sales.vue'),
    meta: {
      title: 'Laporan Penjualan',
      layout: 'default',
      permission: [READ],
      breadcrumbs: crumbs('Laporan Penjualan', PATH_SALES),
    },
  },
  {
    path: PATH_OUTLETS,
    name: `${PREFIX_ROUTE_NAME}-outlets`,
    component: () => import('@/modules/reports/pages/outlets.vue'),
    meta: {
      title: 'Perbandingan Outlet',
      layout: 'default',
      permission: [READ],
      breadcrumbs: crumbs('Perbandingan Outlet', PATH_OUTLETS),
    },
  },
  {
    path: PATH_EXPORTS,
    name: `${PREFIX_ROUTE_NAME}-exports`,
    component: () => import('@/modules/reports/pages/exports.vue'),
    meta: {
      title: 'Ekspor Laporan',
      layout: 'default',
      permission: [READ],
      breadcrumbs: crumbs('Ekspor Laporan', PATH_EXPORTS),
    },
  },
  {
    path: PATH_SHIFTS,
    name: `${PREFIX_ROUTE_NAME}-shifts`,
    component: () => import('@/modules/reports/pages/ShiftDaily.vue'),
    meta: {
      title: 'Laporan Harian Kasir',
      layout: 'default',
      permission: [SHIFT_READ],
      breadcrumbs: crumbs('Laporan Harian Kasir', PATH_SHIFTS),
    },
  },
];
