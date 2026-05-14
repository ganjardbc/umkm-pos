import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'newemail@example.com',
    description: 'Email to verify',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
