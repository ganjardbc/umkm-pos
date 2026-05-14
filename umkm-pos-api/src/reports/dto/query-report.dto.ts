import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryReportDto {
  @ApiPropertyOptional({
    description: 'Start date (ISO format: YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsString()
  date_from?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO format: YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsString()
  date_to?: string;

  @ApiPropertyOptional({
    description: 'Filter by outlet ID',
  })
  @IsOptional()
  @IsString()
  outlet_id?: string;

  @ApiPropertyOptional({
    description: 'Number of top products to return (default: 10)',
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
