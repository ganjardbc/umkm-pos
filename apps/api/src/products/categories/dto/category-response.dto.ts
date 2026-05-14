import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'uuid-string', description: 'Category ID' })
  id: string;

  @ApiProperty({ example: 'uuid-string', description: 'Merchant ID' })
  merchant_id: string;

  @ApiProperty({ example: 'Electronics', description: 'Category name' })
  name: string;

  @ApiPropertyOptional({
    example: 'Electronic devices and accessories',
    description: 'Category description',
  })
  description?: string;

  @ApiProperty({ example: true, description: 'Whether the category is active' })
  is_active: boolean;

  @ApiPropertyOptional({
    example: 'uuid-string',
    description: 'User ID who created the category',
  })
  created_by?: string;

  @ApiPropertyOptional({
    example: 'uuid-string',
    description: 'User ID who last updated the category',
  })
  updated_by?: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Category creation timestamp',
  })
  created_at: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Category last update timestamp',
  })
  updated_at: Date;
}
