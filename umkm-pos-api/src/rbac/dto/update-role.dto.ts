import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: 'senior_cashier',
    description: 'Unique role name (lowercase, underscores)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9_]+$/, {
    message:
      'name must only contain lowercase letters, numbers, and underscores',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated role description',
    description: 'Role description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
