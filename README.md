# UMKM POS Monorepo

Repository ini menggunakan struktur monorepo yang scalable:

- `apps/web` — frontend Vue + Vite.
- `apps/api` — backend NestJS + Prisma.
- `packages/shared-types` — shared TypeScript types antar app.
- `packages/shared-utils` — stub utilitas bersama.
- `packages/eslint-config` — stub shared lint config.
- `infra/docker` — artefak docker/deployment.
- `infra/scripts` — script operasional.
- `docs/architecture` — dokumentasi arsitektur.
- `docs/runbooks` — runbook operasional.

## Prasyarat

- Node.js 22+
- pnpm 10+

## Setup

```bash
pnpm install
```

## Command dari root

```bash
pnpm dev:web      # Jalankan frontend
pnpm dev:api      # Jalankan backend (watch mode)
pnpm build        # Build semua workspace aktif
pnpm test         # Jalankan test di workspace yang punya script test
pnpm lint         # Jalankan lint di workspace yang punya script lint
pnpm format       # Jalankan format di workspace yang punya script format
```

## Menjalankan command per workspace

```bash
pnpm --filter umkm-pos-app <script>
pnpm --filter umkm-pos-api <script>
pnpm --filter @umkm-pos/shared-types <script>
```
