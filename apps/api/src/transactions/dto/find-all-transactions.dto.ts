import { IsOptional, IsUUID, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * DTO for finding all transactions with optional outlet filter
 */
export class FindAllTransactionsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by outlet ID',
    example: '550e8400-e29b-41d4-a716-446655440021',
  })
  @IsOptional()
  @IsUUID()
  outlet_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by cancellation status (true or false)',
    example: 'false',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  is_cancelled?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by order status',
    example: 'menunggu_konfirmasi',
  })
  @IsOptional()
  @IsString()
  order_status?: string;

  @ApiPropertyOptional({
    description: 'Filter by order source',
    example: 'customer_catalog',
  })
  @IsOptional()
  @IsString()
  order_source?: string;

  @ApiPropertyOptional({
    description: 'Filter by table ID',
    example: '550e8400-e29b-41d4-a716-446655440021',
  })
  @IsOptional()
  @IsUUID()
  table_id?: string;
}
