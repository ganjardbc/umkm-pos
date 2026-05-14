import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

/**
 * Query DTO for stock logs endpoint
 * Extends PaginationDto to include product_id filter
 */
export class StockLogsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter logs by product ID',
    example: '550e8400-e29b-41d4-a716-446655440031',
  })
  @IsOptional()
  @IsUUID()
  product_id?: string;
}
