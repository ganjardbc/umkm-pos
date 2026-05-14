import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsBoolean,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message:
      'Category name can only contain letters, numbers, spaces, hyphens, and underscores',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
