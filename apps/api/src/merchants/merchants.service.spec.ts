import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { PrismaService } from '../database/prisma.service';
import { UploadsService } from '../uploads/uploads.service';

describe('MerchantsService', () => {
  let service: MerchantsService;

  const mockPrisma = {
    merchants: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
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
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UploadsService, useValue: mockUploadsService },
      ],
    }).compile();

    service = module.get<MerchantsService>(MerchantsService);

    jest.clearAllMocks();
  });

  const ownMerchantId = 'merchant-own';
  const otherMerchantId = 'merchant-other';
  const adminMerchantId = 'merchant-admin-id';

  describe('findBySlug', () => {
    it('throws NotFoundException when slug does not exist', async () => {
      mockPrisma.merchants.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.findBySlug('missing-slug', ownMerchantId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when caller requests another merchant slug (cross-tenant)', async () => {
      mockPrisma.merchants.findUnique
        // lookup by slug
        .mockResolvedValueOnce({
          id: otherMerchantId,
          slug: 'other-merchant',
          logo_upload_id: null,
        })
        // isAdminUser lookup for caller's merchant
        .mockResolvedValueOnce({ slug: 'not-admin-slug' });

      await expect(
        service.findBySlug('other-merchant', ownMerchantId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('returns merchant when caller requests own slug', async () => {
      mockPrisma.merchants.findUnique
        .mockResolvedValueOnce({
          id: ownMerchantId,
          slug: 'own-merchant',
          logo_upload_id: null,
        })
        .mockResolvedValueOnce({ slug: 'not-admin-slug' });

      const result = await service.findBySlug('own-merchant', ownMerchantId);

      expect(result).toMatchObject({ id: ownMerchantId, slug: 'own-merchant' });
    });

    it('allows admin merchant caller to access any merchant slug', async () => {
      mockPrisma.merchants.findUnique
        .mockResolvedValueOnce({
          id: otherMerchantId,
          slug: 'other-merchant',
          logo_upload_id: null,
        })
        .mockResolvedValueOnce({ slug: 'merchant-admin' });

      const result = await service.findBySlug(
        'other-merchant',
        adminMerchantId,
      );

      expect(result).toMatchObject({ id: otherMerchantId });
    });
  });

  describe('findOne', () => {
    it('throws ForbiddenException for foreign merchant_id', async () => {
      mockPrisma.merchants.findUnique.mockResolvedValueOnce({
        slug: 'not-admin-slug',
      });

      await expect(
        service.findOne(otherMerchantId, ownMerchantId),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.merchants.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('throws ForbiddenException for foreign merchant_id', async () => {
      mockPrisma.merchants.findUnique.mockResolvedValueOnce({
        slug: 'not-admin-slug',
      });

      await expect(
        service.update(
          otherMerchantId,
          { name: 'hacked' } as any,
          'user-1',
          ownMerchantId,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.merchants.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws ForbiddenException for foreign merchant_id', async () => {
      mockPrisma.merchants.findUnique.mockResolvedValueOnce({
        slug: 'not-admin-slug',
      });

      await expect(
        service.remove(otherMerchantId, ownMerchantId),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.merchants.delete).not.toHaveBeenCalled();
    });
  });
});
