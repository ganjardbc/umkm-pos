import { Test, TestingModule } from '@nestjs/testing';
import { OutletsService } from './outlets.service';
import { PrismaService } from '../database/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { OutletsQueryDto } from './dto/outlets-query.dto';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

describe('OutletsService', () => {
  let service: OutletsService;
  let prisma: PrismaService;
  let uploadsService: UploadsService;

  const mockPrisma = {
    $transaction: jest.fn(),
    outlets: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    outlet_product_inventory: {
      groupBy: jest.fn(),
    },
    uploads: {
      findUnique: jest.fn(),
    },
  };

  const mockUploadsService = {
    generateSignedUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutletsService,
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

    service = module.get<OutletsService>(OutletsService);
    prisma = module.get<PrismaService>(PrismaService);
    uploadsService = module.get<UploadsService>(UploadsService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated outlets for a merchant without search', async () => {
      const merchantId = 'merchant-1';
      const query = new OutletsQueryDto();
      query.page = 1;
      query.limit = 10;

      const mockOutlets = [
        {
          id: 'outlet-1',
          merchant_id: merchantId,
          name: 'Main Branch',
          location: 'Jakarta',
          logo_upload_id: null,
          created_at: new Date(),
        },
        {
          id: 'outlet-2',
          merchant_id: merchantId,
          name: 'Second Branch',
          location: 'Bandung',
          logo_upload_id: null,
          created_at: new Date(),
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockOutlets, 2]);
      mockPrisma.outlet_product_inventory.groupBy.mockResolvedValue([
        { outlet_id: 'outlet-1', _count: { product_id: 5 } },
        { outlet_id: 'outlet-2', _count: { product_id: 3 } },
      ]);

      const result = await service.findAll(merchantId, query);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].product_count).toBe(5);
      expect(result.data[1].product_count).toBe(3);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter outlets by name or location when search is provided', async () => {
      const merchantId = 'merchant-1';
      const query = new OutletsQueryDto();
      query.page = 1;
      query.limit = 10;
      query.search = 'cabang';

      const mockOutlets = [
        {
          id: 'outlet-1',
          merchant_id: merchantId,
          name: 'Cabang Utama',
          location: 'Jakarta',
          logo_upload_id: null,
          created_at: new Date(),
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockOutlets, 1]);
      mockPrisma.outlet_product_inventory.groupBy.mockResolvedValue([
        { outlet_id: 'outlet-1', _count: { product_id: 2 } },
      ]);

      const result = await service.findAll(merchantId, query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Cabang Utama');
      expect(result.meta.total).toBe(1);
    });

    it('should attach signed url if outlet has logo_upload_id', async () => {
      const merchantId = 'merchant-1';
      const query = new OutletsQueryDto();

      const mockOutlets = [
        {
          id: 'outlet-1',
          merchant_id: merchantId,
          name: 'Main Branch',
          location: 'Jakarta',
          logo_upload_id: 'upload-123',
          created_at: new Date(),
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockOutlets, 1]);
      mockPrisma.outlet_product_inventory.groupBy.mockResolvedValue([]);
      mockUploadsService.generateSignedUrl.mockResolvedValue({
        url: 'https://s3.example.com/logo.png',
      });

      const result = await service.findAll(merchantId, query);

      expect(mockUploadsService.generateSignedUrl).toHaveBeenCalledWith(
        'upload-123',
      );
      expect(result.data[0].logo).toBe('https://s3.example.com/logo.png');
    });
  });

  describe('findOne', () => {
    it('should return outlet if found', async () => {
      const outletId = 'outlet-1';
      const merchantId = 'merchant-1';
      const mockOutlet = {
        id: outletId,
        merchant_id: merchantId,
        name: 'Main Branch',
        logo_upload_id: null,
      };

      mockPrisma.outlets.findFirst.mockResolvedValue(mockOutlet);

      const result = await service.findOne(outletId, merchantId);
      expect(result).toEqual(mockOutlet);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'merchant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
