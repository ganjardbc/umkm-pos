import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

@Injectable()
export class S3ConfigService implements OnModuleInit {
  private readonly logger = new Logger(S3ConfigService.name);

  constructor(private configService: ConfigService) {}

  get region(): string {
    return this.configService.get<string>('AWS_REGION', 'us-east-1');
  }

  get accessKeyId(): string {
    return this.configService.get<string>('AWS_ACCESS_KEY_ID', '');
  }

  get secretAccessKey(): string {
    return this.configService.get<string>('AWS_SECRET_ACCESS_KEY', '');
  }

  get bucket(): string {
    return this.configService.get<string>('S3_BUCKET_NAME', '');
  }

  get endpoint(): string | undefined {
    return this.configService.get<string>('S3_ENDPOINT') || undefined;
  }

  get maxFileSize(): number {
    return this.configService.get<number>('MAX_FILE_SIZE', 5242880);
  }

  get allowedMimeTypes(): string[] {
    const raw = this.configService.get<string>('ALLOWED_MIME_TYPES', '');
    return raw ? raw.split(',').map((m) => m.trim()) : [];
  }

  get signedUrlExpiry(): number {
    return this.configService.get<number>('SIGNED_URL_EXPIRY', 900);
  }

  createS3Client(): S3Client {
    const config: S3ClientConfig = {
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    };

    if (this.endpoint) {
      config.endpoint = this.endpoint;
      config.forcePathStyle = true;
    }

    return new S3Client(config);
  }

  onModuleInit(): void {
    this.validate();
  }

  validate(): void {
    const missing: string[] = [];

    if (!this.accessKeyId) missing.push('AWS_ACCESS_KEY_ID');
    if (!this.secretAccessKey) missing.push('AWS_SECRET_ACCESS_KEY');
    if (!this.bucket) missing.push('S3_BUCKET_NAME');

    if (missing.length > 0) {
      this.logger.error(
        `S3 configuration is incomplete. Missing: ${missing.join(', ')}. File upload will not work.`,
      );
    }
  }
}
