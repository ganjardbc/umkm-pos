import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { CreateOutletDto } from '../../../outlets/dto/create-outlet.dto';
import { OutletsQueryDto } from '../../../outlets/dto/outlets-query.dto';

export class AdminOutletsQueryDto extends OutletsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter outlets by merchant ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  merchant_id?: string;
}

export class AdminCreateOutletDto extends CreateOutletDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Merchant that owns the outlet',
  })
  @IsNotEmpty()
  @IsUUID()
  merchant_id: string;
}
