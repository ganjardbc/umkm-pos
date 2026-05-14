import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'john_doe',
    description: 'Unique username per merchant',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username must only contain letters, numbers, and underscores',
  })
  username?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Unique email per merchant',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({
    example: 'NewSecurePass123',
    description: 'New password (hashed before storage)',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    description: 'Avatar URL',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the user is active',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
