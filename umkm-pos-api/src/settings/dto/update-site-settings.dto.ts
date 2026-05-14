import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';

export class UpdateSiteSettingsDto {
  @ApiProperty({
    example: false,
    description: 'Dark mode enabled',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;

  @ApiProperty({
    example: 'en',
    description: 'Language preference',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'id', 'es', 'fr', 'zh'], { message: 'Invalid language' })
  language?: string;

  @ApiProperty({ example: 'UTC', description: 'Timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    example: true,
    description: 'Notifications enabled',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;
}
