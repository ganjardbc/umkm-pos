import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CategoriesQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search categories by name or description',
    example: 'makanan',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
