import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'product.create',
    description: 'Unique permission code (dot-notation, e.g. resource.action)',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9_.]+$/, {
    message:
      'code must only contain lowercase letters, numbers, dots, and underscores',
  })
  code: string;

  @ApiPropertyOptional({
    example: 'Allows creating new products',
    description: 'Permission description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
