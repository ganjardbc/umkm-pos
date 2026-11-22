import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateIf,
  MaxLength,
  Min,
} from 'class-validator';
import { IsOptional } from 'class-validator';

export class PayTransactionDto {
  @ApiProperty({
    example: 'cash',
    description: 'Payment method (e.g. cash, qris, transfer)',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  payment_method: string;

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

  @ApiPropertyOptional({
    example: false,
    description: 'Whether payment was recorded offline',
  })
  @IsOptional()
  @IsBoolean()
  is_offline?: boolean;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440021',
    description:
      'Shift receiving the payment (required when payment_method is cash)',
  })
  @ValidateIf((o) => o.payment_method === 'cash' || o.shift_id !== undefined)
  @IsUUID()
  shift_id?: string;
}
