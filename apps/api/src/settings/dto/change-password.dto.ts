import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123', description: 'Current password' })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword123', description: 'New password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[A-Z]/, { message: 'Password must contain uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain lowercase letter' })
  @Matches(/\d/, { message: 'Password must contain number' })
  newPassword: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Confirm new password',
  })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
