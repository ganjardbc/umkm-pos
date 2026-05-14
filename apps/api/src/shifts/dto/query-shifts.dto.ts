import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryShiftsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by outlet ID',
    example: '550e8400-e29b-41d4-a716-446655440021',
  })
  @IsOptional()
  @IsUUID()
  outlet_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by shift status',
    enum: ['open', 'closed', 'transferred'],
    example: 'open',
  })
  @IsOptional()
  @IsEnum(['open', 'closed', 'transferred'])
  status?: 'open' | 'closed' | 'transferred';

  @ApiPropertyOptional({
    description: 'Filter by start date (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (ISO 8601)',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Filter by shift owner user ID',
    example: '550e8400-e29b-41d4-a716-446655440021',
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;
}
