import { PREFIX_ROUTE_NAME, PREFIX_ROUTE_PATH } from '@/modules/customer-catalog/services/constants.ts';

export default [
  {
    path: `${PREFIX_ROUTE_PATH}/:outletId`,
    name: 'customer-catalog-start',
    component: () => import('@/modules/customer-catalog/pages/start.vue'),
    meta: {
      title: 'Customer Catalog',
      layout: 'customer',
    },
  },
  {
    path: `${PREFIX_ROUTE_PATH}/:outletId/browse`,
    name: 'customer-catalog-browse',
    component: () => import('@/modules/customer-catalog/pages/browse.vue'),
    meta: {
      title: PREFIX_ROUTE_NAME,
      layout: 'customer',
    },
  },
];
