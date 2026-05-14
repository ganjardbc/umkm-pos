import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  MaxLength,
  Matches,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Merchant Info DTO
 * Nested DTO for merchant information during registration
 */
export class MerchantInfoDto {
  @ApiProperty({
    description: 'Unique slug for the merchant',
    example: 'my-store',
  })
  @IsString()
  @IsNotEmpty({ message: 'Merchant slug is required' })
  @MaxLength(120)
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'Merchant slug must only contain lowercase letters, numbers and hyphens',
  })
  slug: string;

  @ApiProperty({
    description: 'Merchant name',
    example: 'My Store',
  })
  @IsString()
  @IsNotEmpty({ message: 'Merchant name is required' })
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    description: 'Merchant phone number',
    example: '08123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Merchant address',
    example: 'Jl. Ahmad Yani No. 123',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Merchant logo URL',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsString()
  logo?: string;
}

/**
 * Outlet Info DTO
 * Nested DTO for outlet information during registration
 */
export class OutletInfoDto {
  @ApiProperty({
    description: 'Unique slug for the outlet (per merchant)',
    example: 'main-branch',
  })
  @IsString()
  @IsNotEmpty({ message: 'Outlet slug is required' })
  @MaxLength(120)
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'Outlet slug must only contain lowercase letters, numbers and hyphens',
  })
  slug: string;

  @ApiProperty({
    description: 'Outlet name',
    example: 'Main Branch',
  })
  @IsString()
  @IsNotEmpty({ message: 'Outlet name is required' })
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    description: 'Outlet location/address',
    example: 'Jl. Sudirman No. 1',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Outlet logo URL',
    example: 'https://example.com/outlet-logo.png',
  })
  @IsOptional()
  @IsString()
  logo?: string;
}

/**
 * Register DTO
 * Used for new user registration with merchant and outlet creation
 */
export class RegisterDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({
    description: 'Merchant information',
    type: MerchantInfoDto,
  })
  @ValidateNested()
  @Type(() => MerchantInfoDto)
  @IsNotEmpty({ message: 'Merchant information is required' })
  merchant: MerchantInfoDto;

  @ApiProperty({
    description: 'Outlets information (at least 1 outlet required)',
    type: [OutletInfoDto],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one outlet is required' })
  @ValidateNested({ each: true })
  @Type(() => OutletInfoDto)
  outlets: OutletInfoDto[];
}
