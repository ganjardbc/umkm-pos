import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class RolesQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search roles by name or description',
    example: 'cashier',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
