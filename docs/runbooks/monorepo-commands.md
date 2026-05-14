# Monorepo Runbook Commands

## Install dependencies

```bash
pnpm install
```

## Build semua workspace

```bash
pnpm -r build
```

## Jalankan app frontend

```bash
pnpm dev:web
```

## Jalankan app backend

```bash
pnpm dev:api
```

## Selective CI rules (path-based)

Workflow CI (`.github/workflows/ci.yml`) menggunakan path filter untuk menentukan job mana yang dieksekusi.

### Impact matrix

- `apps/web/**` → jalankan pipeline **web** (`build` web + build shared-types).
- `apps/api/**` → jalankan pipeline **api** (`lint`, `test`, `build` api + build shared-types).
- `packages/shared-types/**` → jalankan **web + api**.
- `pnpm-lock.yaml`, `pnpm-workspace.yaml`, root `package.json`, `.github/workflows/**` → jalankan **full CI** (web + api).

### Jobs

- `prepare`: deteksi perubahan path dan expose output untuk gating job berikutnya.
- `web`: jalan hanya saat impact ke frontend (langsung/shared/global).
- `api`: jalan hanya saat impact ke backend (langsung/shared/global).
- `summary`: selalu jalan untuk menulis ringkasan run/skip beserta alasannya ke `GITHUB_STEP_SUMMARY`.

### Verifikasi cepat skenario PR

1. Ubah file di `apps/web/**` → hanya `web` + `summary` yang run.
2. Ubah file di `apps/api/**` → hanya `api` + `summary` yang run.
3. Ubah file di `packages/shared-types/**` → `web` dan `api` run.
4. Ubah lockfile/workflow/root package → `web` dan `api` run (full CI).
