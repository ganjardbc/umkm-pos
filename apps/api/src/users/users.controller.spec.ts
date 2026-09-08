import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PermissionGuard } from '../common/guards/permission.guard';
import { PERMISSION_KEY } from '../common/decorators/require-permission.decorator';

describe('UsersController', () => {
  let controller: UsersController;
  let reflector: Reflector;

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
    reflector = new Reflector();
    jest.clearAllMocks();
  });

  it('should require user.read permission on findAll (GET /users)', () => {
    const permission = reflector.get(PERMISSION_KEY, controller.findAll);
    expect(permission).toBe('user.read');
  });

  it('should delegate findAll to service with merchant scope', async () => {
    const merchantId = 'merchant-1';
    const query = { page: 1, limit: 10 };
    const response = {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };

    mockUsersService.findAll.mockResolvedValue(response);

    const result = await controller.findAll(merchantId, query as any);

    expect(result).toEqual(response);
    expect(mockUsersService.findAll).toHaveBeenCalledWith(merchantId, query);
  });
});
