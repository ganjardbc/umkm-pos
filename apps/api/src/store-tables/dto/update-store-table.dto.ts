import { PartialType } from '@nestjs/swagger';
import { CreateStoreTableDto } from './create-store-table.dto';

export class UpdateStoreTableDto extends PartialType(CreateStoreTableDto) {}
