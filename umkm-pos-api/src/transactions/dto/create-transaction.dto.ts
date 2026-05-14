import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionItemInputDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440031',
    description: 'Product ID',
  })
  @IsNotEmpty()
  @IsUUID()
  product_id: string;

  @ApiProperty({ example: 2, description: 'Quantity ordered (must be > 0)' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  qty: number;
}

export class CreateTransactionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440021',
    description: 'Outlet ID',
  })
  @IsNotEmpty()
  @IsUUID()
  outlet_id: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440041',
    description: 'Shift ID (nullable)',
  })
  @IsOptional()
  @IsUUID()
  shift_id?: string;

  @ApiProperty({
    example: 'cash',
    description: 'Payment method (e.g. cash, qris, transfer)',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  payment_method: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this is an offline transaction',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_offline?: boolean;

  @ApiPropertyOptional({
    example: 'device-abc-123',
    description: 'Device identifier for offline sync',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  device_id?: string;

  @ApiProperty({
    type: [TransactionItemInputDto],
    description: 'Items in this transaction',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemInputDto)
  items: TransactionItemInputDto[];
}
