import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440021',
    description: 'Outlet ID where the shift will be opened',
  })
  @IsNotEmpty()
  @IsUUID()
  outlet_id: string;

  @ApiProperty({
    example: 100000,
    description: 'Opening cash in the drawer (>= 0, max 2 decimals)',
  })
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999999999.99)
  opening_cash: number;
}
