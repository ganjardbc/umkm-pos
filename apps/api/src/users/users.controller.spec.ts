import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersQueryDto } from './dto/users-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionGuard } from '../common/guards/permission.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    setAvatar: jest.fn(),
    removeAvatar: jest.fn(),
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
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should delegate to UsersService.findAll with query DTO', async () => {
      const merchantId = 'merchant-123';
      const query: UsersQueryDto = {
        page: 1,
        limit: 10,
        search: 'john',
        skip: 0,
      };

      const expectedResponse = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      mockUsersService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(merchantId, query);

      expect(mockUsersService.findAll).toHaveBeenCalledWith(merchantId, query);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('should delegate to UsersService.findOne', async () => {
      const merchantId = 'merchant-123';
      const userId = 'user-1';

      mockUsersService.findOne.mockResolvedValue({ id: userId, name: 'John' });

      const result = await controller.findOne(userId, merchantId);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId, merchantId);
      expect(result).toEqual({ id: userId, name: 'John' });
    });
  });

  describe('create', () => {
    it('should delegate to UsersService.create', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
      };
      const merchantId = 'merchant-123';
      const currentUserId = 'admin-1';

      mockUsersService.create.mockResolvedValue({ id: 'new-user-id', ...dto });

      const result = await controller.create(dto, merchantId, currentUserId);

      expect(mockUsersService.create).toHaveBeenCalledWith(
        dto,
        merchantId,
        currentUserId,
      );
      expect(result).toEqual({ id: 'new-user-id', ...dto });
    });
  });
});
