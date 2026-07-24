import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { PrismaService } from '../database/prisma.service';
import { S3ConfigService } from './s3-config.service';
import { S3StorageDriver } from './drivers/s3-storage.driver';
import { LocalStorageDriver } from './drivers/local-storage.driver';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('UploadsService', () => {
  let service: UploadsService;
  let prisma: PrismaService;

  const mockPrisma = {
    uploads: {
      findUnique: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
    },
  };

  const mockS3ConfigService = {
    bucket: 'test-bucket',
    allowedMimeTypes: [],
  };

  const mockS3StorageDriver = {};
  const mockLocalStorageDriver = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: S3ConfigService,
          useValue: mockS3ConfigService,
        },
        {
          provide: S3StorageDriver,
          useValue: mockS3StorageDriver,
        },
        {
          provide: LocalStorageDriver,
          useValue: mockLocalStorageDriver,
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('validateUploadOwnership', () => {
    it('should throw NotFoundException if upload is not found', async () => {
      mockPrisma.uploads.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUploadOwnership('non-existent-upload', 'merchant-1'),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.uploads.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-upload' },
      });
    });

    it('should throw ForbiddenException if user who uploaded does not exist', async () => {
      const mockUpload = {
        id: 'upload-1',
        uploaded_by_id: 'user-1',
      };
      mockPrisma.uploads.findUnique.mockResolvedValue(mockUpload);
      mockPrisma.users.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUploadOwnership('upload-1', 'merchant-1'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.users.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should throw ForbiddenException if upload belongs to a different merchant', async () => {
      const mockUpload = {
        id: 'upload-1',
        uploaded_by_id: 'user-1',
      };
      const mockUser = {
        id: 'user-1',
        merchant_id: 'merchant-2', // different merchant
      };
      mockPrisma.uploads.findUnique.mockResolvedValue(mockUpload);
      mockPrisma.users.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.validateUploadOwnership('upload-1', 'merchant-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should pass validation if upload belongs to the same merchant', async () => {
      const mockUpload = {
        id: 'upload-1',
        uploaded_by_id: 'user-1',
      };
      const mockUser = {
        id: 'user-1',
        merchant_id: 'merchant-1', // same merchant
      };
      mockPrisma.uploads.findUnique.mockResolvedValue(mockUpload);
      mockPrisma.users.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.validateUploadOwnership('upload-1', 'merchant-1'),
      ).resolves.not.toThrow();
    });
  });
});
