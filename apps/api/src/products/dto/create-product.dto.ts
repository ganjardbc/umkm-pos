import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

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
    description: 'Initial stock quantity',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_qty?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Minimum stock alert threshold',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_stock?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the product is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
