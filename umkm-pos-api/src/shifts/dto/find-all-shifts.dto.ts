import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * DTO for finding all shifts with optional outlet filter
 */
export class FindAllShiftsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by outlet ID',
    example: '550e8400-e29b-41d4-a716-446655440021',
  })
  @IsOptional()
  @IsUUID()
  outlet_id?: string;
}
