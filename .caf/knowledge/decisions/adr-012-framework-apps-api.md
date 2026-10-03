# ADR-012: Framework: apps/api

## Status
Proposed — the rationale below was inferred from the repository by Claude on 2026-10-03 and is NOT confirmed by the team. Change to Accepted only after a human has reviewed it.

## Context
App "umkm-pos-api" (apps/api) uses NestJS.

One backend serves the merchant app, the admin console and the public customer catalog.

## Decision
Use NestJS as a modular monolith: one module per domain (`products/`, `shifts/`, `transactions/`, …), a global `JwtAuthGuard`, and `PermissionGuard` + `@RequirePermission()` for RBAC.

Why (partly recorded): `docs/architecture/design.md` states "modular monolith, not microservices". Why NestJS over other Node frameworks is not recorded; inferred reasons are its module/guard/decorator model, which the tenant-scoping and RBAC rules are built on.

## Alternatives Considered
Not recorded in the repo (Express/Fastify without a framework would be the usual candidates). Open question.

## Consequences
- Cross-cutting rules live in `apps/api/src/common/` (guards, decorators, pipes, the response interceptor and exception filter) and apply globally from `main.ts`.
- Every route is protected unless marked `@Public()`.
- No `typecheck` script: `nest build` is the type gate. `lint` runs ESLint with `--fix`; CI uses `lint:ci`.
