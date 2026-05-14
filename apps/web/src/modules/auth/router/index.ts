import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME
} from '@/modules/auth/services/constants';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/auth/pages/index.vue'),
    meta: {
      layout: 'auth',
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}register`,
    name: `${PREFIX_ROUTE_NAME}-register`,
    component: () => import('@/modules/auth/pages/register.vue'),
    meta: {
      layout: 'auth',
    }
  },
];
