import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { PermissionGuard } from '../common/guards/permission.guard';

describe('StockController', () => {
  let controller: StockController;

  const mockStockService = {
    findLogs: jest.fn(),
    findInventory: jest.fn(),
    adjust: jest.fn(),
  };

  const mockPermissionGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: StockService,
          useValue: mockStockService,
        },
      ],
    })
      .overrideGuard(PermissionGuard)
      .useValue(mockPermissionGuard)
      .compile();

    controller = module.get<StockController>(StockController);
    jest.clearAllMocks();
  });

  it('should pass outlet filter to findLogs', async () => {
    const merchantId = 'merchant-1';
    const query = {
      product_id: 'product-1',
      outlet_id: 'outlet-1',
      page: 1,
      limit: 10,
    };
    const response = {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };

    mockStockService.findLogs.mockResolvedValue(response);

    const result = await controller.findLogs(merchantId, query as any);

    expect(result).toEqual(response);
    expect(mockStockService.findLogs).toHaveBeenCalledWith(
      merchantId,
      'product-1',
      'outlet-1',
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it('should parse low_stock_only and pass outlet to findInventory', async () => {
    const merchantId = 'merchant-1';
    const response = {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };

    mockStockService.findInventory.mockResolvedValue(response);

    const result = await controller.findInventory(
      merchantId,
      'outlet-1',
      'true',
      { page: 1, limit: 10 } as any,
    );

    expect(result).toEqual(response);
    expect(mockStockService.findInventory).toHaveBeenCalledWith(
      merchantId,
      'outlet-1',
      true,
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it('should pass outlet_id in adjust dto', async () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';
    const dto = {
      outlet_id: 'outlet-1',
      product_id: 'product-1',
      change_qty: 10,
      reason: 'restock',
      note: '',
    };
    const response = {
      outlet_inventory: {
        outlet_id: 'outlet-1',
        product_id: 'product-1',
        stock_qty: 10,
      },
    };

    mockStockService.adjust.mockResolvedValue(response);

    const result = await controller.adjust(dto as any, merchantId, userId);

    expect(result).toEqual(response);
    expect(mockStockService.adjust).toHaveBeenCalledWith(
      dto,
      merchantId,
      userId,
    );
  });
});
