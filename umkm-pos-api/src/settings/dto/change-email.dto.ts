import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, Length } from 'class-validator';

export class ChangeEmailDto {
  @ApiProperty({
    example: 'newemail@example.com',
    description: 'New email address',
  })
  @IsNotEmpty()
  @IsEmail()
  newEmail: string;

  @ApiProperty({ example: '123456', description: 'Verification code' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'Verification code must be 6 digits' })
  verificationCode: string;
}
