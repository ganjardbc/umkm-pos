import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { S3ConfigService } from './s3-config.service';
import { StorageDriver } from './drivers/storage-driver.interface';
import { S3StorageDriver } from './drivers/s3-storage.driver';
import { LocalStorageDriver } from './drivers/local-storage.driver';

@Injectable()
export class UploadsService {
  private readonly storage: StorageDriver;

  constructor(
    private prisma: PrismaService,
    private s3Config: S3ConfigService,
    s3Driver: S3StorageDriver,
    localDriver: LocalStorageDriver,
  ) {
    const driver = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
    this.storage = driver === 's3' ? s3Driver : localDriver;
  }

  async upload(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{
    id: string;
    original_name: string;
    mime_type: string;
    size: number;
    s3_key: string;
    url: string;
  }> {
    this.validateFile(file);

    const { key, url } = await this.storage.upload(file);

    const upload = await this.prisma.uploads.create({
      data: {
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        s3_key: key,
        bucket: this.s3Config.bucket,
        uploaded_by_id: userId,
      },
    });

    return {
      id: upload.id,
      original_name: upload.original_name,
      mime_type: upload.mime_type,
      size: upload.size,
      s3_key: upload.s3_key,
      url,
    };
  }

  async findById(id: string) {
    const upload = await this.prisma.uploads.findUnique({ where: { id } });

    if (!upload) {
      throw new NotFoundException(`Upload with ID ${id} not found`);
    }

    return upload;
  }

  async generateSignedUrl(id: string): Promise<{ url: string }> {
    const upload = await this.findById(id);
    const url = await this.storage.getUrl(upload.s3_key);
    return { url };
  }

  async delete(id: string): Promise<void> {
    const upload = await this.findById(id);

    await this.storage.delete(upload.s3_key);

    await this.prisma.uploads.delete({ where: { id } });
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const allowedMimeTypes = this.s3Config.allowedMimeTypes;

    if (
      allowedMimeTypes.length > 0 &&
      !allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed: ${allowedMimeTypes.join(', ')}`,
      );
    }
  }
}
