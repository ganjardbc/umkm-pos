import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionItemInputDto } from './create-transaction.dto';

export class AddTransactionItemsDto {
  @ApiProperty({
    type: [TransactionItemInputDto],
    description: 'Items to add to the existing transaction',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemInputDto)
  items: TransactionItemInputDto[];
}
