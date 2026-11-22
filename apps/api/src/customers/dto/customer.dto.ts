import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Bu Sari' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: '0812-3456-7890',
    description: 'Stored as 62812...; unique per merchant',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'Langganan, suka kopi tanpa gula' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class CustomersQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by name or phone' })
  @IsOptional()
  @IsString()
  search?: string;
}
