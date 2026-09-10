import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { PrismaService } from '../database/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { MerchantsQueryDto } from './dto/merchants-query.dto';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

describe('MerchantsService', () => {
  let service: MerchantsService;
  let prisma: PrismaService;
  let uploadsService: UploadsService;

  const mockPrisma = {
    merchants: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    uploads: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockUploadsService = {
    generateSignedUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MerchantsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    service = module.get<MerchantsService>(MerchantsService);
    prisma = module.get<PrismaService>(PrismaService);
    uploadsService = module.get<UploadsService>(UploadsService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated merchants without search filter', async () => {
      const userMerchantId = 'merchant-1';
      const query = new MerchantsQueryDto();
      query.page = 1;
      query.limit = 10;

      const mockMerchants = [
        {
          id: userMerchantId,
          slug: 'test-merchant',
          name: 'Test Merchant',
          logo_upload_id: null,
          created_at: new Date(),
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockMerchants, 1]);

      const result = await service.findAll(query, userMerchantId);

      expect(mockPrisma.merchants.findMany).toHaveBeenCalledWith({
        where: { id: userMerchantId },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(mockPrisma.merchants.count).toHaveBeenCalledWith({
        where: { id: userMerchantId },
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(userMerchantId);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter merchants by name when search parameter is provided', async () => {
      const userMerchantId = 'merchant-1';
      const query = new MerchantsQueryDto();
      query.page = 1;
      query.limit = 10;
      query.search = 'kopi';

      const mockMerchants = [
        {
          id: userMerchantId,
          slug: 'kopi-kenangan',
          name: 'Kopi Kenangan',
          logo_upload_id: null,
          created_at: new Date(),
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockMerchants, 1]);

      const result = await service.findAll(query, userMerchantId);

      expect(mockPrisma.merchants.findMany).toHaveBeenCalledWith({
        where: {
          id: userMerchantId,
          name: { contains: 'kopi' },
        },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(mockPrisma.merchants.count).toHaveBeenCalledWith({
        where: {
          id: userMerchantId,
          name: { contains: 'kopi' },
        },
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Kopi Kenangan');
      expect(result.meta.total).toBe(1);
    });

    it('should handle custom pagination (page 2, limit 5)', async () => {
      const userMerchantId = 'merchant-1';
      const query = new MerchantsQueryDto();
      query.page = 2;
      query.limit = 5;

      mockPrisma.$transaction.mockResolvedValue([[], 8]);

      const result = await service.findAll(query, userMerchantId);

      expect(mockPrisma.merchants.findMany).toHaveBeenCalledWith({
        where: { id: userMerchantId },
        orderBy: { created_at: 'desc' },
        skip: 5,
        take: 5,
      });
      expect(result.meta).toEqual({
        total: 8,
        page: 2,
        limit: 5,
        totalPages: 2,
      });
    });

    it('should attach signed url when merchant has logo_upload_id', async () => {
      const userMerchantId = 'merchant-1';
      const query = new MerchantsQueryDto();

      const mockMerchants = [
        {
          id: userMerchantId,
          slug: 'test-merchant',
          name: 'Test Merchant',
          logo_upload_id: 'upload-123',
          created_at: new Date(),
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockMerchants, 1]);
      mockUploadsService.generateSignedUrl.mockResolvedValue({
        url: 'https://signed-url.example.com/logo.png',
      });

      const result = await service.findAll(query, userMerchantId);

      expect(mockUploadsService.generateSignedUrl).toHaveBeenCalledWith(
        'upload-123',
      );
      expect(result.data[0].logo).toBe(
        'https://signed-url.example.com/logo.png',
      );
    });
  });

  describe('findOne', () => {
    it('should return merchant when user has access', async () => {
      const merchantId = 'merchant-1';
      const mockMerchant = {
        id: merchantId,
        slug: 'test-merchant',
        name: 'Test Merchant',
        logo_upload_id: null,
      };

      mockPrisma.merchants.findUnique
        .mockResolvedValueOnce({ slug: 'other-slug' }) // isAdminUser check
        .mockResolvedValueOnce(mockMerchant); // findUnique by id

      const result = await service.findOne(merchantId, merchantId);

      expect(result).toEqual(mockMerchant);
    });

    it('should throw ForbiddenException if user has no access to target merchant', async () => {
      const targetMerchantId = 'merchant-2';
      const userMerchantId = 'merchant-1';

      mockPrisma.merchants.findUnique.mockResolvedValueOnce({
        slug: 'regular-merchant',
      });

      await expect(
        service.findOne(targetMerchantId, userMerchantId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if merchant not found', async () => {
      const merchantId = 'merchant-1';

      mockPrisma.merchants.findUnique
        .mockResolvedValueOnce({ slug: 'regular-merchant' }) // isAdmin check
        .mockResolvedValueOnce(null); // findUnique by id

      await expect(service.findOne(merchantId, merchantId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return merchant by slug', async () => {
      const mockMerchant = {
        id: 'merchant-1',
        slug: 'test-slug',
        name: 'Test Merchant',
        logo_upload_id: null,
      };

      mockPrisma.merchants.findUnique.mockResolvedValue(mockMerchant);

      const result = await service.findBySlug('test-slug');

      expect(result).toEqual(mockMerchant);
      expect(mockPrisma.merchants.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-slug' },
      });
    });

    it('should throw NotFoundException if slug not found', async () => {
      mockPrisma.merchants.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a merchant when slug is unique', async () => {
      const dto: CreateMerchantDto = {
        slug: 'new-store',
        name: 'New Store',
      };
      const userId = 'user-1';

      mockPrisma.merchants.findUnique.mockResolvedValue(null);
      mockPrisma.merchants.create.mockResolvedValue({
        id: 'merchant-new',
        ...dto,
        created_by: userId,
        updated_by: userId,
      });

      const result = await service.create(dto, userId);

      expect(result.id).toBe('merchant-new');
      expect(mockPrisma.merchants.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          created_by: userId,
          updated_by: userId,
        },
      });
    });

    it('should throw ConflictException if slug already exists', async () => {
      const dto: CreateMerchantDto = {
        slug: 'existing-store',
        name: 'Existing Store',
      };

      mockPrisma.merchants.findUnique.mockResolvedValue({
        id: 'merchant-existing',
        slug: 'existing-store',
      });

      await expect(service.create(dto, 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update merchant details', async () => {
      const merchantId = 'merchant-1';
      const dto: UpdateMerchantDto = { name: 'Updated Store' };
      const userId = 'user-1';

      mockPrisma.merchants.findUnique
        .mockResolvedValueOnce({ slug: 'regular-merchant' }) // isAdmin check
        .mockResolvedValueOnce({ id: merchantId, name: 'Old Store' }); // findOne

      mockPrisma.merchants.update.mockResolvedValue({
        id: merchantId,
        name: 'Updated Store',
        updated_by: userId,
      });

      const result = await service.update(merchantId, dto, userId, merchantId);

      expect(result.name).toBe('Updated Store');
      expect(mockPrisma.merchants.update).toHaveBeenCalledWith({
        where: { id: merchantId },
        data: expect.objectContaining({
          ...dto,
          updated_by: userId,
          updated_at: expect.any(Date),
        }),
      });
    });

    it('should throw ConflictException if updated slug is taken by another merchant', async () => {
      const merchantId = 'merchant-1';
      const dto: UpdateMerchantDto = { slug: 'taken-slug' };

      mockPrisma.merchants.findUnique
        .mockResolvedValueOnce({ slug: 'regular-merchant' }) // isAdmin check
        .mockResolvedValueOnce({ id: merchantId, slug: 'old-slug' }) // findOne
        .mockResolvedValueOnce({ id: 'merchant-2', slug: 'taken-slug' }); // slug uniqueness check

      await expect(
        service.update(merchantId, dto, 'user-1', merchantId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a merchant', async () => {
      const merchantId = 'merchant-1';

      mockPrisma.merchants.findUnique
        .mockResolvedValueOnce({ slug: 'regular-merchant' }) // isAdmin check
        .mockResolvedValueOnce({ id: merchantId }); // findOne

      mockPrisma.merchants.delete.mockResolvedValue({ id: merchantId });

      const result = await service.remove(merchantId, merchantId);

      expect(result.id).toBe(merchantId);
      expect(mockPrisma.merchants.delete).toHaveBeenCalledWith({
        where: { id: merchantId },
      });
    });
  });

  describe('setImage', () => {
    it('should set merchant logo from upload', async () => {
      const merchantId = 'merchant-1';
      const uploadId = 'upload-1';
      const userId = 'user-1';

      mockPrisma.merchants.findUnique
        .mockResolvedValueOnce({ slug: 'regular-merchant' }) // isAdmin check
        .mockResolvedValueOnce({ id: merchantId }); // findOne

      mockPrisma.uploads.findUnique.mockResolvedValue({ id: uploadId });
      mockUploadsService.generateSignedUrl.mockResolvedValue({
        url: 'https://signed-url.example.com/logo.png',
      });
      mockPrisma.merchants.update.mockResolvedValue({
        id: merchantId,
        logo_upload_id: uploadId,
        logo: 'https://signed-url.example.com/logo.png',
      });

      const result = await service.setImage(
        merchantId,
        uploadId,
        merchantId,
        userId,
      );

      expect(result.logo_upload_id).toBe(uploadId);
      expect(mockPrisma.merchants.update).toHaveBeenCalledWith({
        where: { id: merchantId },
        data: expect.objectContaining({
          logo_upload_id: uploadId,
          logo: 'https://signed-url.example.com/logo.png',
          updated_by: userId,
          updated_at: expect.any(Date),
        }),
      });
    });

    it('should throw BadRequestException if upload not found', async () => {
      const merchantId = 'merchant-1';

      mockPrisma.merchants.findUnique
        .mockResolvedValueOnce({ slug: 'regular-merchant' }) // isAdmin check
        .mockResolvedValueOnce({ id: merchantId }); // findOne

      mockPrisma.uploads.findUnique.mockResolvedValue(null);

      await expect(
        service.setImage(merchantId, 'non-existent', merchantId, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeImage', () => {
    it('should remove merchant logo', async () => {
      const merchantId = 'merchant-1';
      const userId = 'user-1';

      mockPrisma.merchants.findUnique
        .mockResolvedValueOnce({ slug: 'regular-merchant' }) // isAdmin check
        .mockResolvedValueOnce({ id: merchantId }); // findOne

      mockPrisma.merchants.update.mockResolvedValue({
        id: merchantId,
        logo_upload_id: null,
        logo: null,
      });

      const result = await service.removeImage(merchantId, merchantId, userId);

      expect(result.logo_upload_id).toBeNull();
      expect(mockPrisma.merchants.update).toHaveBeenCalledWith({
        where: { id: merchantId },
        data: expect.objectContaining({
          logo_upload_id: null,
          logo: null,
          updated_by: userId,
          updated_at: expect.any(Date),
        }),
      });
    });
  });
});
