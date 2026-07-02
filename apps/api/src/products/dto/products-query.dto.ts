import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ProductsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Outlet ID to include outlet-level inventory in product list',
    example: '550e8400-e29b-41d4-a716-446655440021',
  })
  @IsOptional()
  @IsUUID()
  outlet_id?: string;

  @ApiPropertyOptional({
    description: 'Filter products by category ID',
    example: '550e8400-e29b-41d4-a716-446655440022',
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Search products by name',
    example: 'kopi',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
