import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export const IMPORT_MAX_ROWS = 500;

export class ImportProductRowDto {
  @ApiProperty({ example: 'Keripik Singkong' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 15000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 9000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({
    example: 'Makanan',
    description: 'Matched by name; created when it does not exist yet',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock_qty?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  min_stock?: number;
}

export class ImportProductsDto {
  @ApiProperty({ description: 'Outlet that receives the opening stock' })
  @IsUUID()
  outlet_id: string;

  @ApiProperty({ type: [ImportProductRowDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(IMPORT_MAX_ROWS)
  @ValidateNested({ each: true })
  @Type(() => ImportProductRowDto)
  rows: ImportProductRowDto[];
}
