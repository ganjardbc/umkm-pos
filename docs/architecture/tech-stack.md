# Tech Stack — WisataPOS

## Monorepo

```txt
Turborepo    — task orchestration & caching
PNPM         — package manager + workspaces
```

## Backend (apps/api)

```txt
NestJS       — Node.js framework (modular monolith)
TypeScript   — language
Prisma       — ORM (DB-first, MySQL)
MySQL        — database
JWT          — authentication
bcrypt       — password hashing
class-validator + class-transformer — DTO validation
Swagger/OpenAPI — API documentation
```

## Frontend (apps/web)

```txt
Vue 3        — UI framework
Vite         — build tool
TypeScript   — language
Pinia        — state management
Vue Router   — client-side routing
PrimeVue     — UI component library
Tailwind CSS v4 — utility-first CSS
Axios        — HTTP client
```

## Frontend (apps/landing)

```txt
Vue 3 + Vite — marketing landing page
```

## Shared Packages

```txt
@umkm-pos/shared-types  — TypeScript type contracts
@umkm-pos/shared-utils  — pure utility functions
@umkm-pos/eslint-config — shared ESLint config
```

## Infrastructure

```txt
Docker       — containerization
MinIO / S3   — file storage (uploads)
```

## Development Tools

```txt
ESLint       — linting
Prettier     — formatting
Jest         — backend testing
Hygen        — frontend module scaffold
```
