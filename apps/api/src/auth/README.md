# Auth Module

Authentication and authorization module using JWT (JSON Web Tokens).

## 📁 Structure

```
auth/
├── auth.module.ts           # Module definition
├── auth.controller.ts       # HTTP endpoints
├── auth.service.ts          # Business logic
├── dto/
│   ├── login.dto.ts         # Login request DTO
│   └── register.dto.ts      # Registration request DTO
└── strategies/
    └── jwt.strategy.ts      # JWT validation strategy
```

## 🔐 Features

- ✅ User login with email & password
- ✅ User registration
- ✅ JWT token generation
- ✅ Password hashing with bcrypt
- ✅ Get user profile
- ✅ Token validation
- ✅ Merchant-scoped users

## 📡 API Endpoints

### 1. Login
**POST** `/auth/login`

**Public endpoint** - No authentication required

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "admin@example.com",
      "name": "Admin User",
      "username": "admin",
      "merchant_id": "123e4567-e89b-12d3-a456-426614174001",
      "merchant": {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "name": "My Store",
        "slug": "my-store"
      },
      "is_active": true
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `401 Unauthorized` - User account is inactive

---

### 2. Register
**POST** `/auth/register`

**Public endpoint** - No authentication required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "merchant_id": "123e4567-e89b-12d3-a456-426614174001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john@example.com",
      "name": "John Doe",
      "username": "john",
      "merchant_id": "123e4567-e89b-12d3-a456-426614174001",
      "merchant": {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "name": "My Store",
        "slug": "my-store"
      },
      "is_active": true
    }
  }
}
```

**Error Responses:**
- `409 Conflict` - Email already registered for this merchant
- `400 Bad Request` - Merchant not found
- `400 Bad Request` - Validation errors

---

### 3. Get Profile
**GET** `/auth/profile`

**Requires authentication** - Bearer token required

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "admin@example.com",
    "name": "Admin User",
    "username": "admin",
    "merchant_id": "123e4567-e89b-12d3-a456-426614174001",
    "merchant": {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "My Store",
      "slug": "my-store"
    },
    "is_active": true,
    "created_at": "2026-02-03T10:00:00.000Z",
    "updated_at": "2026-02-03T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `401 Unauthorized` - User not found

---

## 🔧 Usage Examples

### Login Example

```typescript
// Using fetch
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'Password123!',
  }),
});

const data = await response.json();
const token = data.data.access_token;

// Store token for subsequent requests
localStorage.setItem('token', token);
```

### Authenticated Request Example

```typescript
// Using fetch with Bearer token
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const profile = await response.json();
```

### Using in Controller

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('products')
export class ProductsController {
  @Get()
  findAll(@CurrentUser() user: any) {
    // user.id
    // user.email
    // user.merchant_id
    // user.merchant
    console.log('Current user:', user);
  }
}
```

---

## 🔐 Security Features

### Password Hashing
- Uses **bcrypt** with salt rounds = 10
- Passwords are never stored in plain text
- Stored as `password_hash` in database

### JWT Token
- **Secret**: Configured via `JWT_SECRET` environment variable
- **Expiration**: 7 days
- **Payload**: Contains user ID and email
- **Algorithm**: HS256 (HMAC with SHA-256)

### Token Validation
- Automatically validates on every request (global guard)
- Checks if user exists and is active
- Attaches user object to `request.user`

### Multi-Tenant Security
- Email is unique per merchant (compound unique key)
- Username is unique per merchant
- Users are scoped to their merchant

---

## 🛡️ Guards & Decorators

### Global JWT Guard
Applied to all routes by default. Can be bypassed with `@Public()` decorator.

```typescript
// In app.module.ts
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}
```

### @Public() Decorator
Mark endpoints as public (no authentication required):

```typescript
@Post('login')
@Public()
login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

### @CurrentUser() Decorator
Get authenticated user in controller:

```typescript
@Get('profile')
getProfile(@CurrentUser() user: any) {
  return user;
}

// Get specific property
@Get('merchant-id')
getMerchantId(@CurrentUser('merchant_id') merchantId: string) {
  return { merchantId };
}
```

---

## 📝 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  merchant_id CHAR(36) NOT NULL,
  username VARCHAR(120) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  
  UNIQUE KEY unique_merchant_email (merchant_id, email),
  UNIQUE KEY unique_merchant_username (merchant_id, username),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);
```

---

## 🧪 Testing

### Test Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Password123!"
  }'
```

### Test Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "merchant_id": "your-merchant-id"
  }'
```

### Test Get Profile
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ⚙️ Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=mysql://root:@localhost:3306/db_umkm_pos
```

### Module Configuration

```typescript
// auth.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET || 'dev_secret_change_me_in_production_2026',
  signOptions: {
    expiresIn: '7d', // 7 days
  },
})
```

---

## 🚨 Error Handling

All errors follow standard format:

```json
{
  "success": false,
  "message": "Error message here",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - Invalid credentials or token
- `CONFLICT` - Email already exists
- `BAD_REQUEST` - Validation errors
- `FORBIDDEN` - User inactive

---

## 📚 Best Practices

1. **Always hash passwords** - Never store plain text passwords
2. **Use strong JWT secrets** - Change default secret in production
3. **Set appropriate token expiration** - Balance security vs UX
4. **Validate user is active** - Check `is_active` flag
5. **Scope users to merchants** - Enforce multi-tenancy
6. **Use @CurrentUser() decorator** - Don't manually parse tokens
7. **Mark public endpoints** - Use @Public() for login/register

---

## 🔄 Flow Diagram

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ POST /auth/login
     │ { email, password }
     ▼
┌────────────────┐
│ AuthController │
└────┬───────────┘
     │
     │ authService.login(dto)
     ▼
┌────────────┐
│ AuthService│
└────┬───────┘
     │
     ├─► Find user by email
     ├─► Verify password (bcrypt)
     ├─► Generate JWT token
     └─► Return token + user data
     
     
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ GET /auth/profile
     │ Authorization: Bearer <token>
     ▼
┌──────────────┐
│ JwtAuthGuard │
└────┬─────────┘
     │
     │ Extract token
     ▼
┌─────────────┐
│ JwtStrategy │
└────┬────────┘
     │
     ├─► Validate token
     ├─► Find user by ID
     ├─► Check if active
     └─► Attach user to request
     
     ▼
┌────────────────┐
│ AuthController │
└────┬───────────┘
     │
     │ @CurrentUser() user
     │ authService.getProfile(user.id)
     ▼
┌────────────┐
│ AuthService│
└────┬───────┘
     │
     └─► Return user profile
```

---

## ✅ Checklist

- [x] Login endpoint
- [x] Register endpoint
- [x] Get profile endpoint
- [x] JWT token generation
- [x] Password hashing
- [x] Token validation
- [x] Global JWT guard
- [x] @Public() decorator
- [x] @CurrentUser() decorator
- [x] Swagger documentation
- [x] Error handling
- [x] Multi-tenant support
