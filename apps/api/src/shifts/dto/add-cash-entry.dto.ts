import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AddCashEntryDto {
  @ApiProperty({ enum: ['in', 'out'], example: 'out' })
  @IsIn(['in', 'out'])
  type: 'in' | 'out';

  @ApiProperty({
    example: 25000,
    description: 'Amount (> 0, max 2 decimals)',
  })
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999999.99)
  amount: number;

  @ApiProperty({ example: 'Beli es batu', maxLength: 255 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason: string;
}
