# Repository Guidelines

## Quick Commands (source of truth: `package.json`)
- `npm run dev` - Vite dev server.
- `npm run build` - required verification step (`vue-tsc -b && vite build`).
- `npm run preview` - serve built app.
- `npm run new-module` - Hygen scaffold (`npx hygen module new`).
- There is no dedicated `test` or `lint` script currently; do not assume they exist.

## Architecture That Affects Changes
- App bootstrap flow is `src/main.ts` -> `src/core/global-components.ts` + `src/core/global-styles.ts` + `src/core/initiate.ts`.
- Routes are auto-collected from every `src/modules/**/router/index.ts` via `import.meta.glob` in `src/core/global-routes.ts`; new modules become routable once their router file exports a default route array.
- Permission guard is injected centrally in `src/core/global-routes.ts` from each route's `meta.permission`; unauthorized users are redirected to route name `403`.
- Global components are auto-registered from `src/components/*.vue` (not subdirectories) in `src/core/global-components.ts`.
- Shared HTTP client is `src/plugins/axios.ts`; it attaches `Authorization: Bearer <token>` and on `401` clears auth + redirects to auth prefix route.

## Module Conventions (follow existing modules)
- Keep feature code inside `src/modules/<kebab-case-name>/` with `pages/`, `router/`, `services/`, and `stores/`.
- Store pattern is split files (`state.ts`, `getters.ts`, `actions.ts`, `index.ts`) instead of one large store file.
- Route constants and RBAC are expected in each module's `services/constants.ts` and `services/rbac.ts` (see `_templates/module/new/*`).

## Auth / RBAC Gotchas
- Local storage keys and helpers are centralized in `src/helpers/auth.ts`; reuse these helpers instead of hardcoding keys.
- `isHasPermission()` always includes `dashboard.view` and `reports.view` by default; this can affect guard/debug expectations.

## Styling / Tooling Notes
- Alias `@` -> `src` is defined in both `vite.config.ts` and `tsconfig.app.json`.
- Tailwind v4 is active with `darkMode: 'selector'` in `tailwind.config.ts`; PrimeVue theme config is applied in `src/core/initiate.ts`.
