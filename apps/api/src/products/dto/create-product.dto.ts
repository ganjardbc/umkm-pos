import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductOptionInputDto {
  @ApiProperty({ example: 'Large' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Added to the product price when chosen (>= 0)',
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price_delta?: number;
}

export class ProductOptionGroupInputDto {
  @ApiProperty({ example: 'Ukuran' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({
    default: false,
    description: 'Customer must pick at least one',
  })
  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: 'Customer may pick more than one',
  })
  @IsOptional()
  @IsBoolean()
  allow_multiple?: boolean;

  @ApiProperty({ type: [ProductOptionInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ProductOptionInputDto)
  options: ProductOptionInputDto[];
}

export class CreateProductDto {
  @ApiProperty({
    example: 'kopi-hitam',
    description: 'Unique slug per merchant (lowercase, hyphens only)',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must only contain lowercase letters, numbers and hyphens',
  })
  slug: string;

  @ApiProperty({ example: 'Kopi Hitam', description: 'Product name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Beverages',
    description: 'Product category',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @ApiPropertyOptional({
    example: 'uuid-string',
    description: 'Category ID (optional, must belong to same merchant)',
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/product.jpg',
    description: 'Thumbnail image URL',
  })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ example: 15000, description: 'Selling price (must be >= 0)' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 8000,
    description: 'Cost / COGS (must be >= 0)',
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Initial stock quantity (saved in outlet_product_inventory)',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_qty?: number;

  @ApiPropertyOptional({
    example: 10,
    description:
      'Minimum stock alert threshold (saved in outlet_product_inventory)',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_stock?: number;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440021',
    description: 'Outlet ID for inventory write on create/update',
  })
  @IsOptional()
  @IsUUID()
  outlet_id?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the product is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    type: [ProductOptionGroupInputDto],
    description:
      'Full replacement of the product option groups. Omit to leave them untouched; send [] to remove all',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ProductOptionGroupInputDto)
  option_groups?: ProductOptionGroupInputDto[];
}
