import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class DeactivateAccountDto {
  @ApiProperty({ example: 'password123', description: 'Password confirmation' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: 'Not using anymore',
    description: 'Reason for deactivation',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
