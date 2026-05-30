import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export const ADJUSTMENT_REASONS = [
  'restock',
  'damage',
  'correction',
  'manual',
] as const;

export type AdjustmentReason = (typeof ADJUSTMENT_REASONS)[number];

export class CreateStockAdjustmentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440021',
    description: 'Outlet ID where stock should be adjusted',
  })
  @IsNotEmpty()
  @IsUUID()
  outlet_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440031',
    description: 'Product ID to adjust',
  })
  @IsNotEmpty()
  @IsUUID()
  product_id: string;

  @ApiProperty({
    example: 10,
    description:
      'Quantity change. Positive = add stock, negative = reduce stock. Must not be 0.',
  })
  @IsInt()
  change_qty: number;

  @ApiProperty({
    example: 'restock',
    description:
      'Reason for adjustment. One of: restock, damage, correction, manual',
    enum: ADJUSTMENT_REASONS,
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(ADJUSTMENT_REASONS, {
    message: `reason must be one of: ${ADJUSTMENT_REASONS.join(', ')}`,
  })
  reason: AdjustmentReason;

  @ApiPropertyOptional({
    example: 'Restocked from supplier delivery',
    description: 'Optional note/reference for this adjustment',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
