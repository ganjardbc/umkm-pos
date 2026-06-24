import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../database';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('db')
  @ApiOperation({ summary: 'Check database health connection' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  @ApiResponse({ status: 503, description: 'Database is unhealthy' })
  async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        database: {
          status: 'up',
        },
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'down',
        database: {
          status: 'down',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
}
