import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/notification/services/constants.ts';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/notification/pages/index.vue'),
    meta: {
      title: 'Notification',
      layout: 'default',
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Notification',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
];
