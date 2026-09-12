import { Test, TestingModule } from '@nestjs/testing';
import { OutletsController } from './outlets.controller';
import { OutletsService } from './outlets.service';
import { PermissionGuard } from '../common/guards/permission.guard';
import { OutletsQueryDto } from './dto/outlets-query.dto';

describe('OutletsController', () => {
  let controller: OutletsController;

  const mockOutletsService = {
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
      controllers: [OutletsController],
      providers: [
        {
          provide: OutletsService,
          useValue: mockOutletsService,
        },
      ],
    })
      .overrideGuard(PermissionGuard)
      .useValue(mockPermissionGuard)
      .compile();

    controller = module.get<OutletsController>(OutletsController);
    jest.clearAllMocks();
  });

  it('should pass OutletsQueryDto through findAll', async () => {
    const merchantId = 'merchant-1';
    const query: OutletsQueryDto = { page: 1, limit: 10, search: 'kopi' };
    const response = {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };

    mockOutletsService.findAll.mockResolvedValue(response);

    const result = await controller.findAll(merchantId, query);

    expect(result).toEqual(response);
    expect(mockOutletsService.findAll).toHaveBeenCalledWith(merchantId, query);
  });
});
