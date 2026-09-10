import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class UsersQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search users by name, email, or username',
    example: 'alice',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
