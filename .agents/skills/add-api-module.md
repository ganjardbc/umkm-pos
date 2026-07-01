---
name: add-api-module
description: Scaffold a new NestJS API module following project conventions. Pass the module name (e.g. "invoices" or "loyalty-points").
---

# Skill: Add API Module

## Trigger

Use when asked to create/scaffold a new backend module:
- "add api module invoices"
- "scaffold backend module for X"
- "/add-api-module <name>"

## Module Name Convention

Input: any form (camelCase, kebab, singular, plural)
Normalize to: `kebab-case` for folder, `PascalCase` for class names

Examples:
- `store-tables` → folder `store-tables/`, class `StoreTablesService`
- `audit-logs` → folder `audit-logs/`, class `AuditLogsService`

## Files to Create

Path: `apps/api/src/<module-name>/`

### `<module>.module.ts`
```ts
import { Module } from '@nestjs/common';
import { <Module>Service } from './<module>.service';
import { <Module>Controller } from './<module>.controller';
import { DatabaseModule } from '../database';

@Module({
  imports: [DatabaseModule],
  controllers: [<Module>Controller],
  providers: [<Module>Service],
  exports: [<Module>Service],
})
export class <Module>Module {}
```

### `<module>.controller.ts`
```ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { <Module>Service } from './<module>.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { AuthUser } from '@umkm-pos/shared-types';

@ApiTags('<module-name>')
@Controller('<module-name>')
export class <Module>Controller {
  constructor(private readonly <module>Service: <Module>Service) {}
}
```

### `<module>.service.ts`
```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class <Module>Service {
  constructor(private readonly prisma: PrismaService) {}
}
```

### `dto/` folder
Create placeholder DTOs as needed:
- `create-<item>.dto.ts`
- `update-<item>.dto.ts`
- `list-<items>.dto.ts` (for pagination query params)

## Register in App Module

After creating the module, add to `apps/api/src/app.module.ts`:
```ts
import { <Module>Module } from './<module-name>/<module-name>.module';

@Module({
  imports: [
    // ... existing imports
    <Module>Module,
  ],
})
```

## Permission Codes

Use format `<resource>.<action>`:
```
<module>.read
<module>.write
<module>.delete
```

Register permissions in the RBAC seed if applicable.

## Checklist After Scaffolding

- [ ] Module file created and imports `DatabaseModule`
- [ ] Controller uses `@ApiTags`, `@RequirePermission`, `@CurrentUser`
- [ ] Service injects `PrismaService` via constructor
- [ ] DTOs use `class-validator` + `@ApiProperty`
- [ ] Module registered in `app.module.ts`
- [ ] Run `pnpm typecheck` to verify no errors
