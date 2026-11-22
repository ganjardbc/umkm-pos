import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class CloseShiftDto {
  @ApiProperty({
    example: 100000,
    description: 'Closing cash counted in the drawer (>= 0, max 2 decimals)',
  })
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999999999.99)
  closing_cash: number;
}
