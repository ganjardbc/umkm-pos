# UMKM POS Monorepo

Repository ini sekarang dikelola sebagai **pnpm workspace** dengan dua project utama:

- `umkm-pos-app` (frontend Vue + Vite)
- `umkm-pos-api` (backend NestJS)

## Prasyarat

- Node.js 22+
- pnpm 10+

## Setup

```bash
pnpm install
```

## Command dari root

```bash
pnpm dev:app      # Jalankan frontend
pnpm dev:api      # Jalankan backend (watch mode)
pnpm build        # Build semua workspace
pnpm test         # Jalankan test di workspace yang punya script test
pnpm lint         # Jalankan lint di workspace yang punya script lint
pnpm format       # Jalankan format di workspace yang punya script format
```

## Menjalankan command per workspace

```bash
pnpm --filter umkm-pos-app <script>
pnpm --filter umkm-pos-api <script>
```
