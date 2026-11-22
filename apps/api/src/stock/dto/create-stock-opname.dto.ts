import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export const OPNAME_MAX_ITEMS = 500;

export class StockOpnameCountDto {
  @ApiProperty({ description: 'Product that was counted' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ example: 12, description: 'Quantity actually on the shelf' })
  @IsInt()
  @Min(0)
  counted_qty: number;
}

export class CreateStockOpnameDto {
  @ApiProperty({ description: 'Outlet where the count was done' })
  @IsUUID()
  outlet_id: string;

  @ApiPropertyOptional({ example: 'Opname akhir bulan' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;

  @ApiProperty({ type: [StockOpnameCountDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(OPNAME_MAX_ITEMS)
  @ValidateNested({ each: true })
  @Type(() => StockOpnameCountDto)
  counts: StockOpnameCountDto[];
}
