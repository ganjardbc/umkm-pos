import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME
} from '@/modules/landing/services/constants';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/landing/pages/index.vue'),
    meta: {
      title: 'Home',
      layout: 'default',
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: true,
        },
      ]
    }
  },
];
