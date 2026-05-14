import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440021',
    description: 'Outlet ID where the shift will be opened',
  })
  @IsNotEmpty()
  @IsUUID()
  outlet_id: string;
}
