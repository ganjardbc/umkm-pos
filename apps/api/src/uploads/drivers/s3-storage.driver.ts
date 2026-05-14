import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3ConfigService } from '../s3-config.service';
import { StorageDriver } from './storage-driver.interface';

@Injectable()
export class S3StorageDriver implements StorageDriver {
  private readonly logger = new Logger(S3StorageDriver.name);
  private readonly s3Client: S3Client;

  constructor(private s3Config: S3ConfigService) {
    this.s3Client = this.s3Config.createS3Client();
  }

  async upload(
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    const key = `${randomUUID()}/${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.s3Config.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const url = await this.getUrl(key);

    return { key, url };
  }

  async delete(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.s3Config.bucket,
          Key: key,
        }),
      );
    } catch (error: unknown) {
      this.logger.warn(
        `Failed to delete S3 object (key=${key}): ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.s3Config.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: this.s3Config.signedUrlExpiry,
    });
  }
}
