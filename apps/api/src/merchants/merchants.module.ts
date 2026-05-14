import { Module } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { MerchantsController } from './merchants.controller';
import { DatabaseModule } from '../database';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [DatabaseModule, UploadsModule],
  controllers: [MerchantsController],
  providers: [MerchantsService],
  exports: [MerchantsService],
})
export class MerchantsModule {}
