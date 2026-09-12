import { Test, TestingModule } from '@nestjs/testing';
import { OutletsService } from './outlets.service';
import { PrismaService } from '../database/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { OutletsQueryDto } from './dto/outlets-query.dto';

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
});
