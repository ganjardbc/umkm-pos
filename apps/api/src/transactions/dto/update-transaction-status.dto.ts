import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateTransactionStatusDto {
  @ApiProperty({
    example: 'diterima',
    description: 'Next order status',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  order_status: string;

  @ApiPropertyOptional({
    example: 'cash',
    description: 'Payment method, required when status becomes selesai',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  payment_method?: string;

  @ApiPropertyOptional({
    example: 50000,
    description: 'Cash amount received, required when payment method is cash',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cash_received?: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Change amount, required when payment method is cash',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  change_amount?: number;
}
