# PROJECT_CONTEXT.md
# ==================

Project: WisataPOS API  
Type: SaaS POS Backend for UMKM Tourism Businesses  
Framework: NestJS  
Language: TypeScript  
Database: MySQL  
ORM: Prisma  

## Purpose

WisataPOS API is a multi-tenant POS backend system designed for small tourism-related businesses such as cafés, souvenir shops, agro-tourism outlets, and small multi-booth merchants. The API serves mobile/web POS clients and owner dashboards.

The system must be simple, reliable, transaction-safe, and easy to evolve.

## Core Capabilities (MVP)

- POS transaction commit
- Product management
- Stock tracking + audit log
- Shift tracking
- Multi-outlet support
- Multi-user support
- RBAC (role + permission)
- Merchant multi-tenant isolation
- Offline transaction sync
- Daily report aggregation

## Non-Goals (MVP)

- Accounting system
- Tax engine
- Loyalty program
- CRM
- Supplier & purchasing
- Multi-warehouse inventory

## Engineering Principles

- Modular monolith
- Thin controllers
- Service-layer business logic
- DTO validation everywhere
- Prisma-only DB access
- No premature microservices
- No overengineering
