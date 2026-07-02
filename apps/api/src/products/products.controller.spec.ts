import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PermissionGuard } from '../common/guards/permission.guard';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    setImage: jest.fn(),
    removeImage: jest.fn(),
  };

  const mockPermissionGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(PermissionGuard)
      .useValue(mockPermissionGuard)
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    jest.clearAllMocks();
  });

  it('should pass outlet_id query through findAll', async () => {
    const merchantId = 'merchant-1';
    const query = { page: 1, limit: 10, outlet_id: 'outlet-1' };
    const response = {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };

    mockProductsService.findAll.mockResolvedValue(response);

    const result = await controller.findAll(merchantId, query as any);

    expect(result).toEqual(response);
    expect(mockProductsService.findAll).toHaveBeenCalledWith(merchantId, query);
  });

  it('should pass optional outlet_id query through findOne', async () => {
    const merchantId = 'merchant-1';
    const response = { id: 'product-1', stock_qty: 5, min_stock: 1 };

    mockProductsService.findOne.mockResolvedValue(response);

    const result = await controller.findOne(
      'product-1',
      merchantId,
      'outlet-1',
    );

    expect(result).toEqual(response);
    expect(mockProductsService.findOne).toHaveBeenCalledWith(
      'product-1',
      merchantId,
      'outlet-1',
    );
  });
});
