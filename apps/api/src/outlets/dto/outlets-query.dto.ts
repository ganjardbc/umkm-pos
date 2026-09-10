import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class OutletsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search outlets by name or location',
    example: 'cabang',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
