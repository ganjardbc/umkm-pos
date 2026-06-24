import { Controller, Get, HttpStatus, Res, SetMetadata } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Response } from 'express';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('db')
  @SetMetadata('isPublic', true)
  @SetMetadata('public', true)
  async checkDatabaseHealth(@Res() res: Response) {
    try {
      // Run a simple query to check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      return res.status(HttpStatus.OK).json({
        status: 'up',
        database: 'connected',
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'down',
        database: 'disconnected',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
