# API_CONVENTIONS.md
# ==================

## API Style

- REST
- JSON only
- Versioned later if needed
- Resource-oriented routes

## Controller Rules

- Thin controller
- No business logic
- No Prisma usage
- Only DTO + service call

## DTO Rules

- All input via DTO
- class-validator required
- Transform enabled
- No raw body usage

## Response Shape

Standard success:

{
  "success": true,
  "data": ...
}

Standard error:

{
  "success": false,
  "message": "...",
  "code": "ERROR_CODE"
}

## Validation

- Reject unknown fields
- Use whitelist mode
- Explicit types

## Auth

Protected routes require:
Authorization: Bearer <token>

## Swagger

Swagger must be enabled.
All DTOs documented.
Auth bearer configured.
