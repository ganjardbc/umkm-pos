import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class HandoffShiftDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440021',
    description: 'UUID of the user to transfer shift ownership to',
  })
  @IsNotEmpty()
  @IsUUID()
  target_user_id: string;

  @ApiProperty({
    example: false,
    description: 'Whether to remove the previous owner from participants',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  remove_previous_owner?: boolean = false;
}
