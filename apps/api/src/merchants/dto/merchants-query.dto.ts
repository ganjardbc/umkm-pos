import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class MerchantsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search merchants by name',
    example: 'demo',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
