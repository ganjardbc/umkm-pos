/**
 * GOLDEN EXAMPLE — Backend Query DTO (ADR-004)
 *
 * Source: apps/api/src/stock/dto/stock-logs-query.dto.ts
 *
 * Rules illustrated:
 * - ADR-004: endpoint dengan pagination + filter WAJIB extends PaginationDto
 *   menjadi satu DTO, bukan mix @Query('param') + @Query() PaginationDto
 * - Setiap filter field wajib @IsOptional + @IsUUID (atau validator yang tepat)
 * - @ApiPropertyOptional dengan contoh UUID untuk dokumentasi Swagger
 * - Pola komposisi: tambah filter baru = tambah field di DTO ini, bukan param baru di controller
 *
 * Cara pakai di controller:
 *   @Get('logs')
 *   findLogs(
 *     @CurrentUser('merchant_id') merchantId: string,
 *     @Query() query: StockLogsQueryDto,   // <-- satu binding saja
 *   ) {
 *     const { product_id, outlet_id, page, limit } = query;
 *     ...
 *   }
 */

import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class StockLogsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter logs by product ID',
    example: '550e8400-e29b-41d4-a716-446655440031',
  })
  @IsOptional()
  @IsUUID()
  product_id?: string;

  @ApiPropertyOptional({
    description: 'Filter logs by outlet ID',
    example: '550e8400-e29b-41d4-a716-446655440021',
  })
  @IsOptional()
  @IsUUID()
  outlet_id?: string;
}
