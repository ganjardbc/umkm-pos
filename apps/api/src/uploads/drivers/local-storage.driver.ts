import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFile, unlink } from 'fs';
import { join } from 'path';
import { StorageDriver } from './storage-driver.interface';

@Injectable()
export class LocalStorageDriver implements StorageDriver {
  private readonly logger = new Logger(LocalStorageDriver.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadDir = join(process.cwd(), 'uploads');
    this.baseUrl = (process.env.APP_URL || 'http://localhost:3030').replace(
      /\/+$/,
      '',
    );

    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created uploads directory at ${this.uploadDir}`);
    }
  }

  async upload(
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    const key = `${randomUUID()}-${file.originalname}`;
    const filePath = join(this.uploadDir, key);

    await new Promise<void>((resolve, reject) => {
      writeFile(filePath, file.buffer, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const url = `${this.baseUrl}/uploads/local/${key}`;

    return { key, url };
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.uploadDir, key);

    try {
      await new Promise<void>((resolve, reject) => {
        unlink(filePath, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (error: unknown) {
      this.logger.warn(
        `Failed to delete local file (path=${filePath}): ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getUrl(key: string): Promise<string> {
    return `${this.baseUrl}/uploads/local/${key}`;
  }
}
