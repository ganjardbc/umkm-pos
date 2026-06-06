import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CatalogProductsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440021' })
  @IsOptional()
  @IsUUID()
  outlet_id?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440031' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ example: 'kopi' })
  @IsOptional()
  @IsString()
  search?: string;
}
