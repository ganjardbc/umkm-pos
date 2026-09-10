import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PermissionGuard } from '../common/guards/permission.guard';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    setAvatar: jest.fn(),
    removeAvatar: jest.fn(),
  };

  const mockPermissionGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(PermissionGuard)
      .useValue(mockPermissionGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should pass query through findAll', async () => {
    const merchantId = 'merchant-1';
    const query = { page: 1, limit: 10, search: 'alice' };
    const response = {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };

    mockUsersService.findAll.mockResolvedValue(response);

    const result = await controller.findAll(merchantId, query as any);

    expect(result).toEqual(response);
    expect(mockUsersService.findAll).toHaveBeenCalledWith(merchantId, query);
  });

  it('should pass findOne through with id and merchantId', async () => {
    const merchantId = 'merchant-1';
    const response = { id: 'user-1', name: 'Alice' };

    mockUsersService.findOne.mockResolvedValue(response);

    const result = await controller.findOne('user-1', merchantId);

    expect(result).toEqual(response);
    expect(mockUsersService.findOne).toHaveBeenCalledWith('user-1', merchantId);
  });
});
