# Common Module

Shared utilities, decorators, guards, interceptors, filters, and pipes used across the application.

## 📁 Structure

```
common/
├── decorators/           # Custom decorators
│   ├── current-user.decorator.ts
│   ├── require-permission.decorator.ts
│   └── public.decorator.ts
├── guards/              # Route guards
│   ├── jwt-auth.guard.ts
│   └── permission.guard.ts
├── interceptors/        # Response interceptors
│   └── transform.interceptor.ts
├── filters/             # Exception filters
│   └── http-exception.filter.ts
├── pipes/               # Validation pipes
│   └── validation.pipe.ts
├── dto/                 # Shared DTOs
│   └── pagination.dto.ts
├── interfaces/          # Shared interfaces
│   └── response.interface.ts
└── index.ts             # Barrel exports
```

## 🎯 Components

### Decorators

#### `@CurrentUser()`
Get current authenticated user from request.

```typescript
@Get('profile')
getProfile(@CurrentUser() user: any) {
  return user;
}

// Get specific property
@Get('profile')
getProfile(@CurrentUser('id') userId: string) {
  return { userId };
}
```

#### `@RequirePermission(permission: string)`
Require specific permission for endpoint access.

```typescript
@Post()
@RequirePermission('products.create')
create(@Body() dto: CreateProductDto) {
  return this.productsService.create(dto);
}
```

#### `@Public()`
Mark endpoint as public (skip JWT authentication).

```typescript
@Post('login')
@Public()
login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

### Guards

#### `JwtAuthGuard`
Protects routes that require authentication.

```typescript
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  // All routes require authentication
}
```

#### `PermissionGuard`
Checks if user has required permission.

```typescript
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ProductsController {
  @Post()
  @RequirePermission('products.create')
  create() {
    // Only users with 'products.create' permission can access
  }
}
```

### Interceptors

#### `TransformInterceptor`
Wraps all responses in standard format.

```typescript
// Before
{ id: 1, name: "Product" }

// After
{
  "success": true,
  "data": { id: 1, name: "Product" }
}
```

### Filters

#### `HttpExceptionFilter`
Formats all HTTP exceptions consistently.

```typescript
// Error response format
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": ["name should not be empty"]
}
```

### Pipes

#### `ValidationPipe`
Validates and transforms DTOs.

```typescript
@Post()
create(@Body() dto: CreateProductDto) {
  // dto is validated and transformed
}
```

### DTOs

#### `PaginationDto`
Reusable pagination DTO.

```typescript
@Get()
findAll(@Query() pagination: PaginationDto) {
  const { page, limit, skip } = pagination;
  // Use for database query
}
```

### Interfaces

#### `ApiResponse<T>`
Standard API response interface.

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}
```

#### `PaginatedResponse<T>`
Paginated response interface.

```typescript
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

#### `ErrorResponse`
Error response interface.

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: any[];
}
```

## 🚀 Usage Examples

### Complete Controller Example

```typescript
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  RequirePermission,
  Public,
  JwtAuthGuard,
  PermissionGuard,
  PaginationDto,
} from '../common';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermission('products.view')
  async findAll(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: any,
  ) {
    return this.productsService.findAll(pagination, user.merchant_id);
  }

  @Post()
  @RequirePermission('products.create')
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.productsService.create(dto, merchantId);
  }

  @Post('public-endpoint')
  @Public()
  async publicEndpoint() {
    // No authentication required
    return { message: 'Public endpoint' };
  }
}
```

### Global Application Setup

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  TransformInterceptor,
  HttpExceptionFilter,
} from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Global response transformer
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
```

## 📝 Best Practices

1. **Always use DTOs** for request validation
2. **Use @RequirePermission()** instead of checking roles
3. **Use @CurrentUser()** to get authenticated user
4. **Mark public endpoints** with @Public()
5. **Use PaginationDto** for list endpoints
6. **Follow standard response format** (handled by TransformInterceptor)

## 🔒 Security Notes

- JwtAuthGuard is applied globally (except @Public() routes)
- PermissionGuard checks database for user permissions
- ValidationPipe rejects unknown fields (whitelist mode)
- All responses are transformed to standard format
- All errors are caught and formatted consistently
