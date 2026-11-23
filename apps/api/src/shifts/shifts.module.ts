import { Module } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';
import { ShiftsAutoCloseService } from './shifts-auto-close.service';
import { DatabaseModule } from '../database';

@Module({
  imports: [DatabaseModule],
  controllers: [ShiftsController],
  providers: [ShiftsService, ShiftsAutoCloseService],
  exports: [ShiftsService],
})
export class ShiftsModule {}
