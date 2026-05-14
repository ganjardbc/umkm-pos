import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Parse DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Parse MySQL connection string
    // Format: mysql://user:password@host:port/database
    const url = new URL(databaseUrl);

    const adapter = new PrismaMariaDb({
      host: url.hostname || 'localhost',
      port: url.port ? parseInt(url.port, 10) : 3306,
      user: url.username || 'root',
      password: url.password || '',
      database: url.pathname.slice(1), // Remove leading slash
    });

    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
