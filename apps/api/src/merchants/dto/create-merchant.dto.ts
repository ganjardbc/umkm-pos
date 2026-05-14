import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateMerchantDto {
  @ApiProperty({
    example: 'demo-store',
    description: 'Unique slug for the merchant',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must only contain lowercase letters, numbers and hyphens',
  })
  slug: string;

  @ApiProperty({ example: 'Demo Store', description: 'Name of the merchant' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: '08123456789', description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ example: 'Jl. Ahmad Yani No. 123', description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Logo URL',
  })
  @IsOptional()
  @IsString()
  logo?: string;
}
