import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class SetUserAvatarDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Upload ID of the file to set as user avatar',
  })
  @IsNotEmpty()
  @IsUUID()
  upload_id: string;
}
