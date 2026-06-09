import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class StartCustomerSessionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440021' })
  @IsNotEmpty()
  @IsUUID()
  outlet_id: string;

  @ApiProperty({ example: 'DEMO123' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  secret_code: string;

  @ApiProperty({ example: 'Budi' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  customer_name: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  customer_phone?: string;
}
