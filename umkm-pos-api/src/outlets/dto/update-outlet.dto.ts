import { PartialType } from '@nestjs/swagger';
import { CreateOutletDto } from './create-outlet.dto';

export class UpdateOutletDto extends PartialType(CreateOutletDto) {}
