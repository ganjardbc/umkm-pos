import { createRouter, createWebHistory } from 'vue-router';
import type { Router } from 'vue-router';
import { isHasPermission, isLogin } from '@/helpers/auth.ts';
import { PREFIX_ROUTE_PATH as PRP_AUTH } from '@/modules/auth/services/constants';
import { PREFIX_ROUTE_PATH as PRP_LANDING } from '@/modules/landing/services/constants';

const modules = import.meta.glob('../modules/**/router/index.ts',{ eager: true });

const entireModules = Object.entries(modules)
  .map((fileModule: any) => {
    return fileModule[1].default
  })
  .flat();

// middleware route guard for permission check
entireModules.forEach((route) => {
  const { meta } = route;
  if (meta && meta.permission) {
    route.beforeEnter = (_: any, __: any, next: any) => {
      const hasPermission = meta.permission.some((permission: string) => isHasPermission(permission))
      if (hasPermission !== false) {
        next();
      } else {
        next({ name: '403' });
      }
    };
  }
});

// 404 route
entireModules.push({
  path: '/:catchAll(.*)',
  name: '404',
  meta: {
    title: '404 Not Found',
    layout: 'default',
  },
  component: () => import('@/modules/error/pages/404.vue'),
});

// setup router
export function setupRouter(): Router {
	const router = createRouter({
		history: createWebHistory(),
		routes: entireModules,
	});

  // Centralized auth guard to avoid layout flicker and duplicated redirects.
  router.beforeEach((to) => {
    const routeLayout = to.meta?.layout;
    const loggedIn = !!isLogin();

    if (routeLayout === 'auth' && loggedIn) {
      return PRP_LANDING;
    }

    if (routeLayout === 'default' && !loggedIn) {
      return PRP_AUTH;
    }

    return true;
  });

  return router;
}
