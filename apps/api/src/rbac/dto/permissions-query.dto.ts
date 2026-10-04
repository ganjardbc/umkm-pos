import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class PermissionsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search permissions by code or description',
    example: 'product',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
