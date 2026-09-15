# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`apps/admin` is the platform-operator console (admin.insell.id). It shares architecture, tech stack, folder structure, and components with `apps/merchant`, but only ships admin features: dashboard, merchants, outlets, users, roles, permissions, and login.

## Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (port 5174) |
| `npm run build` | Build for production (Type-check + Vite) |
| `npm run preview` | Preview production build |
| `npm run new-module` | Generate new feature module via Hygen |
| `npx hygen module new` | Generate new module (alias) |

## Tech Stack

- **Framework:** Vue 3 + TypeScript + Vite
- **State:** Pinia with modular stores (state/getters/actions in separate files)
- **Routing:** Vue Router with per-module route registration
- **UI:** PrimeVue 4.5 + Tailwind CSS 4.1 + PrimeUI themes
- **HTTP:** Axios with interceptors for auth tokens & 401 handling
- **Validation:** Zod
- **Tools:** Day.js, XLSX, Playwright

## Architecture

**Feature-based module structure:**
```
src/modules/[feature]/
├── pages/          # Routable page components
├── components/     # Feature-specific components
├── router/         # Route definitions
├── services/       # API services + constants
├── stores/         # Pinia store (state.ts, getters.ts, actions.ts, index.ts)
├── helpers/        # Composables & utilities (optional)
└── styles/         # Module-specific styles (optional)
```

**Modules:** `auth` (login only), `dashboard`, `merchants`, `outlet`, `user`, `role`, `permission`, `profile`, `error`.

**Key patterns:**
- Stores use external file pattern: `state.ts`, `getters.ts`, `actions.ts` imported into `index.ts`
- Routes auto-registered via `import.meta.glob` in `global-routes.ts`
- Permission guards on routes via `meta.permission` array
- Auth tokens in localStorage (keys defined in `src/helpers/auth.ts`)
- Global components auto-registered from `src/components/Ui*.vue`
- Merchant dropdowns (outlet/user forms and filters) use `useMerchantOptions()` from `src/modules/merchants/helpers/composables.ts`

## Authentication & Permissions

- **Login:** `POST /api/v1/admin/auth/login`. The API returns 403 for anyone who is not a platform admin (user of the `merchant-admin` merchant).
- **Storage keys:** `APP_TOKEN`, `APP_BEARER`, `APP_USER`, `APP_MERCHANT`, `APP_ACTIVE_ROLE`, `APP_ACTIVE_PERMISSIONS`, `APP_IS_LOGIN`
- **No active outlet:** unlike apps/merchant there is no outlet switcher. `setAuth()` stores the union of permission codes across all of the admin's role assignments.
- **Helper functions:** `isHasPermission()`, `getPermissions()`, `getRole()`, `getPersonalInformation()`
- **401 handling:** Axios interceptor shows confirm dialog then redirects to login

## API Integration

- **Base URL:** `VITE_API_BASE_URL` env variable
- **Endpoints:** every module calls `/api/v1/admin/*` (not scoped to the caller's merchant). Only `/api/v1/uploads` and `/api/v1/auth/profile` (the caller's own profile) are shared with apps/merchant.
- **Auto-attach:** Request interceptor adds `Authorization: Bearer <token>`. No `X-Outlet-Id` header is sent.
- **401 behavior:** Auto-logout + redirect to auth route

## Module Development

Generate a new module:
```bash
npm run new-module
# or manually:
npx hygen module new
```

Each module must export routes in `router/index.ts` with optional `meta.permission` array for route guards.

## Environment

```env
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=PRODUCTION_URL_HERE
```
