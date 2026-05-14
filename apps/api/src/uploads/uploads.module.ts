import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { S3ConfigService } from './s3-config.service';
import { DatabaseModule } from '../database';
import { S3StorageDriver } from './drivers/s3-storage.driver';
import { LocalStorageDriver } from './drivers/local-storage.driver';

@Module({
  imports: [
    DatabaseModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    S3ConfigService,
    S3StorageDriver,
    LocalStorageDriver,
  ],
  exports: [UploadsService, S3ConfigService],
})
export class UploadsModule {}
