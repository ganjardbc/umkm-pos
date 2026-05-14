# Database Configuration Guide

## Overview

The UMKM-POS API uses Prisma 7 with MariaDB adapter to connect to MySQL database. The connection is configured dynamically from environment variables.

## Configuration

### Environment Variables

The database connection is configured via `DATABASE_URL` in `.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/db_umkm_pos"
```

### URL Format

```
mysql://[user]:[password]@[host]:[port]/[database]
```

**Components:**
- `user`: Database username (e.g., `root`)
- `password`: Database password (leave empty if no password)
- `host`: Database host (e.g., `localhost`)
- `port`: Database port (default: `3306`)
- `database`: Database name (e.g., `db_umkm_pos`)

## Implementation Details

### PrismaService

The `PrismaService` automatically parses the `DATABASE_URL` and creates a database connection:

```typescript
// src/database/prisma.service.ts
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

export class PrismaService extends PrismaClient {
  constructor() {
    const url = new URL(process.env.DATABASE_URL);
    
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: parseInt(url.port, 10),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    });
    
    super({ adapter });
  }
}
```

### ConfigModule

The application uses `@nestjs/config` to load environment variables:

```typescript
// src/app.module.ts
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
  ],
})
export class AppModule {}
```

## Prisma 7 Changes

Prisma 7 requires using driver adapters instead of direct connection strings:

1. **Adapter Required**: Must use `@prisma/adapter-mariadb` for MySQL/MariaDB
2. **No URL in Schema**: The `url` field is removed from `schema.prisma`
3. **Config File**: Database URL is now in `prisma.config.ts`
4. **Runtime Configuration**: Connection is configured in `PrismaClient` constructor

## Testing Connection

### 1. Check Environment Variables

```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL
```

### 2. Test Database Connection

```bash
# Connect to MySQL
mysql -u root -h localhost -P 3306 db_umkm_pos

# Or using the connection string
mysql $(echo $DATABASE_URL | sed 's/mysql:\/\///')
```

### 3. Test Prisma Connection

```bash
# Open Prisma Studio
npx prisma studio

# Or run a simple query
npx prisma db execute --stdin <<< "SELECT 1"
```

### 4. Test Application

```bash
# Start development server
npm run start:dev

# Test endpoint
curl http://localhost:3000
```

## Troubleshooting

### Error: DATABASE_URL environment variable is not set

**Solution:**
1. Ensure `.env` file exists in project root
2. Verify `DATABASE_URL` is defined in `.env`
3. Restart the development server

### Error: Cannot connect to database

**Solution:**
1. Verify MySQL is running:
   ```bash
   mysql -u root -h localhost -P 3306
   ```
2. Check database exists:
   ```sql
   SHOW DATABASES LIKE 'db_umkm_pos';
   ```
3. Verify credentials in `DATABASE_URL`

### Error: acquireTimeout undefined

**Solution:**
This error occurs when the adapter receives invalid configuration. Ensure:
1. `DATABASE_URL` is properly formatted
2. All URL components are valid
3. ConfigModule is imported before DatabaseModule

## Best Practices

### Development

- ✅ Use `.env` for local configuration
- ✅ Keep `.env` in `.gitignore`
- ✅ Use `.env.example` as template
- ✅ Document any changes to environment variables

### Production

- ⚠️ Use environment-specific configuration
- ⚠️ Never commit `.env` to version control
- ⚠️ Use strong database passwords
- ⚠️ Restrict database user permissions
- ⚠️ Enable SSL/TLS for database connections
- ⚠️ Use connection pooling for better performance

## Connection Pooling

The MariaDB adapter automatically handles connection pooling. Default settings:

```typescript
{
  connectionLimit: 10,
  acquireTimeout: 10000,
  waitForConnections: true,
  queueLimit: 0
}
```

To customize pool settings, you can extend the adapter configuration:

```typescript
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: parseInt(url.port, 10),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  // Custom pool settings
  connectionLimit: 20,
  acquireTimeout: 15000,
});
```

## References

- [Prisma 7 Documentation](https://www.prisma.io/docs)
- [Prisma MariaDB Adapter](https://www.prisma.io/docs/orm/overview/databases/mariadb)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [MySQL Connection Strings](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html)
