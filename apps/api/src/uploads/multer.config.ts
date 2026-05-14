import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import type { Request } from 'express';

export const multerOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: 5242880,
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(
        new BadRequestException(
          `Invalid file type: ${file.mimetype}. Allowed: ${allowedMimeTypes.join(', ')}`,
        ),
        false,
      );
      return;
    }

    callback(null, true);
  },
};
