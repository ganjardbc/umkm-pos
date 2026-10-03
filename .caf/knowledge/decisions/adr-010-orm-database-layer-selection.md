# ADR-010: ORM/database layer selection

## Status
Proposed — the rationale below was inferred from the repository by Claude on 2026-10-03 and is NOT confirmed by the team. Change to Accepted only after a human has reviewed it.

## Context
Detected Prisma (`apps/api/prisma/schema.prisma`, datasource provider `mysql`, 22 models). The API is multi-tenant and the POS commit must write a transaction, its items, the stock change and the stock log together.

## Decision
Use Prisma with MySQL, accessed only through the injected `PrismaService` (`apps/api/src/database/`). Models keep the database's `snake_case` names and `CHAR(36)` UUID keys.

Why (partly recorded): the DB-first naming convention is an accepted decision — see `docs/decisions/adr-002-db-first-schema-convention.md`. Why Prisma rather than another ORM is not recorded; inferred reasons are the typed client and `$transaction` for the atomic POS commit.

## Alternatives Considered
Not recorded in the repo (TypeORM is the usual NestJS alternative). Open question for the team.

## Consequences
- Prisma model and field names are `snake_case` (`this.prisma.store_tables`, `merchant_id`), unlike typical camelCase TypeScript.
- The Prisma client must be generated before lint/test/build — CI runs `prisma generate` first.
- Unit tests mock `@prisma/client` globally (`apps/api/jest.setup.ts`), so no test exercises real SQL.
- `apps/api/prisma/` contains both `migrations/` and `migrations_legacy_backup/`; which one is authoritative is not documented.
