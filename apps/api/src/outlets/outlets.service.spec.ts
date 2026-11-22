import { Test, TestingModule } from '@nestjs/testing';
import { OutletsService } from './outlets.service';
import { PrismaService } from '../database/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { OutletsQueryDto } from './dto/outlets-query.dto';
import { BadRequestException } from '@nestjs/common';

describe('OutletsService', () => {
  let service: OutletsService;
  let prisma: PrismaService;

  const mockPrisma = {
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
    shifts: {
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockUploadsService = {
    generateSignedUrl: jest
      .fn()
      .mockResolvedValue({ url: 'https://example.com/logo.png' }),
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

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated outlets without search filter', async () => {
      const merchantId = 'merchant-1';
      const query = new OutletsQueryDto();
      query.page = 1;
      query.limit = 10;

      const mockOutlets = [
        {
          id: 'outlet-1',
          name: 'Outlet 1',
          location: 'Location 1',
          logo_upload_id: null,
        },
      ];
      mockPrisma.$transaction.mockResolvedValue([mockOutlets, 1]);
      mockPrisma.outlet_product_inventory.groupBy.mockResolvedValue([
        { outlet_id: 'outlet-1', _count: { product_id: 5 } },
      ]);

      const result = await service.findAll(merchantId, query);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('outlet-1');
      expect(result.data[0].product_count).toBe(5);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply search filter on name and location while scoping to merchant_id', async () => {
      const merchantId = 'merchant-1';
      const query = new OutletsQueryDto();
      query.page = 1;
      query.limit = 10;
      query.search = 'kopi';

      mockPrisma.$transaction.mockImplementation(async (promises) => {
        return [[], 0];
      });

      await service.findAll(merchantId, query);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
  describe('shift_required', () => {
    beforeEach(() => {
      mockPrisma.$transaction.mockImplementation((cb) => cb(mockPrisma));
    });

    it('returns shift_required true for an untouched outlet (AC-1)', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        shift_required: true,
        logo_upload_id: null,
      });

      const result = await service.findOne('outlet-1', 'merchant-1');

      expect(result.shift_required).toBe(true);
    });

    it('stores the new value and findOne reads it back (AC-2)', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        logo_upload_id: null,
      });
      mockPrisma.outlets.update.mockResolvedValue({
        id: 'outlet-1',
        shift_required: false,
      });
      mockPrisma.shifts.count.mockResolvedValue(0);

      await service.update(
        'outlet-1',
        { shift_required: false },
        'merchant-1',
        'user-1',
      );

      expect(mockPrisma.outlets.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ shift_required: false }),
        }),
      );

      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        shift_required: false,
        logo_upload_id: null,
      });
      const result = await service.findOne('outlet-1', 'merchant-1');
      expect(result.shift_required).toBe(false);
    });

    it('rejects turning off while an open shift exists (AC-4)', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        logo_upload_id: null,
      });
      mockPrisma.outlets.update.mockResolvedValue({ id: 'outlet-1' });
      mockPrisma.shifts.count.mockResolvedValue(1);

      const promise = service.update(
        'outlet-1',
        { shift_required: false },
        'merchant-1',
        'user-1',
      );

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow(/tutup/i);
      expect(mockPrisma.shifts.count).toHaveBeenCalledWith({
        where: { outlet_id: 'outlet-1', status: 'open' },
      });
    });

    it('does not check shifts when turning on', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        logo_upload_id: null,
      });
      mockPrisma.outlets.update.mockResolvedValue({ id: 'outlet-1' });

      await service.update(
        'outlet-1',
        { shift_required: true },
        'merchant-1',
        'user-1',
      );

      expect(mockPrisma.shifts.count).not.toHaveBeenCalled();
    });
  });
});
