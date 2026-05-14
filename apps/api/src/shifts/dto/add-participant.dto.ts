import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddParticipantDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440021',
    description: 'UUID of the user to add as participant',
  })
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
