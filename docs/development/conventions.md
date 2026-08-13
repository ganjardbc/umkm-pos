# Development Conventions — WisataPOS

## Monorepo Convention

```txt
pnpm workspace
turborepo
```

Structure:

```txt
umkm-pos/
├── apps/
│   ├── web/          — Vue 3 dashboard
│   ├── api/          — NestJS backend
│   └── landing/      — Vue 3 landing page
├── packages/
│   ├── shared-types/
│   ├── shared-utils/
│   └── eslint-config/
├── docs/
├── .caf/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Package Naming

Scope: `@umkm-pos/*`

```txt
@umkm-pos/shared-types
@umkm-pos/shared-utils
@umkm-pos/eslint-config
```

Apps:

```txt
umkm-pos-api     (apps/api)
umkm-pos-app     (apps/web)
@umkm-pos/landing (apps/landing)
```

---

## Root Scripts

```json
{
  "dev": "turbo dev",
  "build": "turbo build",
  "test": "turbo test",
  "lint": "turbo lint",
  "format": "turbo format",
  "typecheck": "turbo typecheck",
  "dev:web": "pnpm --filter umkm-pos-app dev",
  "dev:api": "pnpm --filter umkm-pos-api start:dev"
}
```

---

## TypeScript Convention

```txt
Strict mode enabled
No implicit any
Use explicit DTO/type
No any kecuali benar-benar diperlukan
```

---

## File Naming Convention

### General

kebab-case:

```txt
create-product.dto.ts
product-categories.module.ts
jwt-auth.guard.ts
```

### NestJS Files

```txt
*.module.ts
*.controller.ts
*.service.ts
*.dto.ts
*.guard.ts
*.decorator.ts
*.interceptor.ts
*.filter.ts
```

### Vue Files

PascalCase untuk component:

```txt
ProductTable.vue
ProductForm.vue
ShiftCard.vue
```

kebab-case untuk pages:

```txt
index.vue
create.vue
edit.vue
detail.vue
```

---

## Backend Module Convention

```txt
module-name/
├── dto/
│   ├── create-module.dto.ts
│   ├── update-module.dto.ts
│   └── query-module.dto.ts
├── module-name.module.ts
├── module-name.controller.ts
└── module-name.service.ts
```

---

## Frontend Module Convention

```txt
modules/module-name/
├── pages/
│   ├── index.vue
│   ├── create.vue
│   └── edit.vue
├── components/
│   ├── ModuleTable.vue
│   └── ModuleForm.vue
├── stores/
│   ├── state.ts
│   ├── getters.ts
│   ├── actions.ts
│   └── index.ts
├── services/
│   ├── module.service.ts
│   ├── constants.ts     — route path, name, API path
│   └── rbac.ts          — permission code constants
└── router/
    └── index.ts
```

Scaffold modul baru dengan:

```bash
# Dari apps/web/
npx hygen module new
```

---

## Route Meta Convention

```ts
meta: {
  title: 'Page Title',
  layout: 'default',
  permission: ['products.read'],
  breadcrumbs: [
    { label: 'Home', route: '/landing', isActive: false },
    { label: 'Products', route: '/products', isActive: true },
  ],
}
```

---

## Store Convention (Pinia Split-File)

```txt
stores/
  state.ts     — reactive state + types
  getters.ts   — computed values
  actions.ts   — API calls + mutations
  index.ts     — defineStore composition
```

Store naming: `use{Module}Store`

---

## Service Convention

```ts
// constants.ts
export const PREFIX_ROUTE_PATH = '/products';
export const PREFIX_ROUTE_NAME = 'products';
export const API_PATH = '/products';

// rbac.ts
export const READ = 'products.read';
export const WRITE = 'products.write';
```

---

## API Path Convention

```txt
Plural noun: /products, /transactions, /outlets
Resource + action: /shifts/:id/close, /uploads
Public: /public/*
Auth: /auth/*
RBAC: /rbac/*
```

---

## Import Convention

Frontend:

```ts
import { useAuthStore } from '@/modules/auth/stores';
import { productService } from '@/modules/product/services/product.service';
```

Shared package:

```ts
import type { ApiResponse } from '@umkm-pos/shared-types';
```

---

## Environment Convention

Backend `.env`:

```txt
DATABASE_URL
JWT_SECRET
S3_ENDPOINT
S3_ACCESS_KEY
S3_SECRET_KEY
S3_BUCKET
PORT
```

Frontend `.env`:

```txt
VITE_API_BASE_URL
```

Jangan commit `.env`. Sediakan `.env.example`.

---

## Git Convention

Branch naming:

```txt
feature/product-category
feature/shift-multi-cashier
fix/transaction-stock-deduction
chore/setup-shared-types
docs/api-contract-update
refactor/auth-module-cleanup
```

Commit style (Conventional Commits):

```txt
feat(products): add category filter
fix(shifts): fix end_time not saved on close
docs(api): update transaction endpoint docs
chore(deps): upgrade prisma to 5.x
refactor(auth): simplify JWT guard
```

---

## Documentation Convention

Setiap perubahan significant harus update docs:

```txt
Backend endpoint baru → docs/api/api-contract.md
Model/field baru → docs/database/database-design.md
Route baru → docs/frontend/frontend-routes.md
Page baru → docs/frontend/ui-pages.md
Module baru → docs/architecture/module-breakdown.md
Task selesai → docs/development/progress.md + backlog.md
```

---

## Forbidden Practices

```txt
Menyimpan business logic di controller
Menyimpan DB query di controller
Trust merchant_id dari client input
Membuat PrismaClient baru di service
Menggunakan any tanpa alasan
Menyimpan API call langsung di Vue page
Menyimpan semua store dalam satu file besar
Menyimpan semua route dalam satu global file
Duplicate type yang sudah ada di shared-types
```
