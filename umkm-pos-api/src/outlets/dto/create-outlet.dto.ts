import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateOutletDto {
  @ApiProperty({
    example: 'main-branch',
    description: 'Unique slug per merchant',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must only contain lowercase letters, numbers and hyphens',
  })
  slug: string;

  @ApiProperty({ example: 'Main Branch', description: 'Outlet name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Jl. Sudirman No. 1',
    description: 'Physical location / address',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/outlet-logo.png',
    description: 'Logo URL',
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the outlet is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
