import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class SetMerchantImageDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Upload ID of the file to set as merchant logo',
  })
  @IsNotEmpty()
  @IsUUID()
  upload_id: string;
}
