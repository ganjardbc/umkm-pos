import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
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

  @ApiPropertyOptional({
    example: 'Tanpa bawang',
    description: 'Optional note from customer for this item',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customer_note?: string;
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

  @ApiPropertyOptional({
    example: 'customer_catalog',
    description: 'Order source (pos or customer_catalog)',
    default: 'pos',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  order_source?: string;

  @ApiPropertyOptional({
    example: 'menunggu_konfirmasi',
    description: 'Order status for customer catalog flow',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  order_status?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440051',
    description: 'Customer session ID for guest orders',
  })
  @IsOptional()
  @IsUUID()
  customer_session_id?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440061',
    description: 'Store table ID',
  })
  @IsOptional()
  @IsUUID()
  table_id?: string;

  @ApiPropertyOptional({
    example: 'Budi',
    description: 'Customer name snapshot',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  customer_name_snapshot?: string;

  @ApiPropertyOptional({
    example: '08123456789',
    description: 'Customer phone snapshot',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  customer_phone_snapshot?: string;

  @ApiProperty({
    type: [TransactionItemInputDto],
    description: 'Items in this transaction',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemInputDto)
  items: TransactionItemInputDto[];

  @ApiPropertyOptional({
    example: 50000,
    description: 'Cash amount received from customer (cash only)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cash_received?: number;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Change amount returned to customer (cash only)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  change_amount?: number;
}
