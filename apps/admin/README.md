# UMKM-POS Admin

Platform-operator console for **UMKM-POS**, served at `admin.insell.id`.

It uses the same stack and structure as `apps/merchant` (Vue 3, Vite, PrimeVue, Tailwind, Pinia), limited to admin operations.

## Features

| Module | What it does |
|---|---|
| Dashboard | Platform totals: merchants (total, new, active), outlets, users, recent merchants |
| Merchant | List, create, edit, delete merchants |
| Outlet | Manage outlets of any merchant, filter by merchant |
| Pengguna | Manage users of any merchant, assign/revoke roles per outlet |
| Role | Manage global roles and their permissions |
| Permission | Manage permission codes |
| Auth | Login only (no registration) |

Only platform admins (users of the `merchant-admin` merchant) can log in.

## Development

```bash
pnpm install
pnpm --filter @umkm-pos/admin dev     # http://localhost:5174
pnpm --filter @umkm-pos/admin build
```

`apps/admin/.env`:

```env
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:3000
```

Add the admin origin (`http://localhost:5174` locally, `https://admin.insell.id` in production) to the API's `CORS_ORIGIN`.

## Deployment

Built by `apps/admin/Dockerfile` and deployed as the `umkm-pos-admin` service in the root `docker-compose.yml`. CI builds and deploys it when `apps/admin/**` changes.
