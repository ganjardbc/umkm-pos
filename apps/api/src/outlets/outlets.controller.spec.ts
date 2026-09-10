import { Test, TestingModule } from '@nestjs/testing';
import { OutletsController } from './outlets.controller';
import { OutletsService } from './outlets.service';
import { OutletsQueryDto } from './dto/outlets-query.dto';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { PermissionGuard } from '../common/guards/permission.guard';

describe('OutletsController', () => {
  let controller: OutletsController;
  let service: OutletsService;

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
    service = module.get<OutletsService>(OutletsService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call outletsService.findAll with merchantId and query', async () => {
      const merchantId = 'merchant-1';
      const query = new OutletsQueryDto();
      query.search = 'cabang';
      query.page = 1;
      query.limit = 10;

      const mockResponse = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      mockOutletsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(merchantId, query);

      expect(result).toEqual(mockResponse);
      expect(mockOutletsService.findAll).toHaveBeenCalledWith(
        merchantId,
        query,
      );
    });
  });

  describe('findOne', () => {
    it('should call outletsService.findOne with id and merchantId', async () => {
      const id = 'outlet-1';
      const merchantId = 'merchant-1';
      const mockOutlet = { id, name: 'Main Branch' };

      mockOutletsService.findOne.mockResolvedValue(mockOutlet);

      const result = await controller.findOne(id, merchantId);

      expect(result).toEqual(mockOutlet);
      expect(mockOutletsService.findOne).toHaveBeenCalledWith(id, merchantId);
    });
  });

  describe('create', () => {
    it('should call outletsService.create with dto, merchantId, userId', async () => {
      const merchantId = 'merchant-1';
      const userId = 'user-1';
      const dto = new CreateOutletDto();
      dto.name = 'New Outlet';
      dto.slug = 'new-outlet';

      const mockCreated = { id: 'outlet-new', ...dto };
      mockOutletsService.create.mockResolvedValue(mockCreated);

      const result = await controller.create(dto, merchantId, userId);

      expect(result).toEqual(mockCreated);
      expect(mockOutletsService.create).toHaveBeenCalledWith(
        dto,
        merchantId,
        userId,
      );
    });
  });

  describe('update', () => {
    it('should call outletsService.update with id, dto, merchantId, userId', async () => {
      const id = 'outlet-1';
      const merchantId = 'merchant-1';
      const userId = 'user-1';
      const dto = new UpdateOutletDto();
      dto.name = 'Updated Outlet';

      const mockUpdated = { id, ...dto };
      mockOutletsService.update.mockResolvedValue(mockUpdated);

      const result = await controller.update(id, dto, merchantId, userId);

      expect(result).toEqual(mockUpdated);
      expect(mockOutletsService.update).toHaveBeenCalledWith(
        id,
        dto,
        merchantId,
        userId,
      );
    });
  });

  describe('remove', () => {
    it('should call outletsService.remove with id and merchantId', async () => {
      const id = 'outlet-1';
      const merchantId = 'merchant-1';

      mockOutletsService.remove.mockResolvedValue({ id });

      const result = await controller.remove(id, merchantId);

      expect(result).toEqual({ id });
      expect(mockOutletsService.remove).toHaveBeenCalledWith(id, merchantId);
    });
  });
});
