# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
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
- **Charts:** Chart.js
- **Tools:** Day.js, XLSX, html2canvas, Playwright

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

**Key patterns:**
- Stores use external file pattern: `state.ts`, `getters.ts`, `actions.ts` imported into `index.ts`
- Routes auto-registered via `import.meta.glob` in `global-routes.ts`
- Permission guards on routes via `meta.permission` array
- Auth tokens in localStorage (keys defined in `src/helpers/auth.ts`)
- Global components auto-registered from `src/components/Ui*.vue`
- Toast service available via `PrimeVue/toastservice`

## Authentication & Permissions

- **Storage keys:** `APP_TOKEN`, `APP_USER`, `APP_MERCHANT`, `APP_ACTIVE_OUTLET`, `APP_ACTIVE_ROLE`, `APP_ACTIVE_PERMISSIONS`, `APP_LIST_OUTLET`
- **Permission system:** Roles have permissions; route meta includes required permission codes
- **Helper functions:** `isHasPermission()`, `getPermissions()`, `getRole()`, `getOutlet()`, `setOutlet()`, `isUserNotAdmin()`
- **401 handling:** Axios interceptor shows confirm dialog then redirects to login

## API Integration

- **Base URL:** `VITE_API_BASE_URL` env variable
- **Token format:** Bearer token stored in `APP_BEARER`
- **Auto-attach:** Request interceptor adds `Authorization: Bearer <token>`
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
