import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PermissionGuard } from '../../common/guards/permission.guard';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findActiveCategories: jest.fn(),
  };

  const mockPermissionGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    })
      .overrideGuard(PermissionGuard)
      .useValue(mockPermissionGuard)
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);

    jest.clearAllMocks();
  });

  describe('POST /products/categories', () => {
    it('should create a category with valid data', async () => {
      const merchantId = 'merchant-1';
      const userId = 'user-1';
      const dto = new CreateCategoryDto();
      dto.name = 'Electronics';
      dto.description = 'Electronic products';
      dto.is_active = true;

      const mockCreatedCategory = {
        id: 'cat-1',
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: userId,
        updated_by: userId,
      };

      mockCategoriesService.create.mockResolvedValue(mockCreatedCategory);

      const result = await controller.create(dto, merchantId, userId);

      expect(result).toEqual(mockCreatedCategory);
      expect(mockCategoriesService.create).toHaveBeenCalledWith(dto, merchantId, userId);
    });

    it('should return 409 for duplicate category names', async () => {
      const merchantId = 'merchant-1';
      const userId = 'user-1';
      const dto = new CreateCategoryDto();
      dto.name = 'Electronics';

      mockCategoriesService.create.mockRejectedValue(
        new ConflictException('Category with this name already exists for your merchant'),
      );

      await expect(controller.create(dto, merchantId, userId)).rejects.toThrow(ConflictException);
    });
  });

  describe('GET /products/categories', () => {
    it('should return paginated categories', async () => {
      const merchantId = 'merchant-1';
      const pagination = new PaginationDto();
      pagination.page = 1;
      pagination.limit = 10;

      const mockResponse = {
        data: [
          {
            id: 'cat-1',
            merchant_id: merchantId,
            name: 'Electronics',
            description: 'Electronic products',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 'user-1',
            updated_by: null,
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockCategoriesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(merchantId, pagination);

      expect(result).toEqual(mockResponse);
      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(merchantId, pagination);
    });

    it('should scope results to current merchant', async () => {
      const merchantId = 'merchant-1';
      const pagination = new PaginationDto();

      mockCategoriesService.findAll.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      await controller.findAll(merchantId, pagination);

      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(merchantId, pagination);
    });
  });

  describe('GET /products/categories/:id', () => {
    it('should return category if accessible', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';

      const mockCategory = {
        id: categoryId,
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'user-1',
        updated_by: null,
      };

      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(categoryId, merchantId);

      expect(result).toEqual(mockCategory);
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(categoryId, merchantId);
    });

    it('should return 404 if not found or not accessible', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';

      mockCategoriesService.findOne.mockRejectedValue(new NotFoundException('Category not found'));

      await expect(controller.findOne(categoryId, merchantId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH /products/categories/:id', () => {
    it('should update category', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';
      const userId = 'user-2';
      const dto = new UpdateCategoryDto();
      dto.name = 'Updated Electronics';

      const mockUpdatedCategory = {
        id: categoryId,
        merchant_id: merchantId,
        name: 'Updated Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'user-1',
        updated_by: userId,
      };

      mockCategoriesService.update.mockResolvedValue(mockUpdatedCategory);

      const result = await controller.update(categoryId, dto, merchantId, userId);

      expect(result).toEqual(mockUpdatedCategory);
      expect(mockCategoriesService.update).toHaveBeenCalledWith(categoryId, dto, merchantId, userId);
    });

    it('should return 404 if not found', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';
      const userId = 'user-2';
      const dto = new UpdateCategoryDto();

      mockCategoriesService.update.mockRejectedValue(new NotFoundException('Category not found'));

      await expect(controller.update(categoryId, dto, merchantId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('DELETE /products/categories/:id', () => {
    it('should delete category', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';

      const mockDeletedCategory = {
        id: categoryId,
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'user-1',
        updated_by: null,
      };

      mockCategoriesService.remove.mockResolvedValue(mockDeletedCategory);

      const result = await controller.remove(categoryId, merchantId);

      expect(result).toEqual(mockDeletedCategory);
      expect(mockCategoriesService.remove).toHaveBeenCalledWith(categoryId, merchantId);
    });

    it('should return 404 if not found', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';

      mockCategoriesService.remove.mockRejectedValue(new NotFoundException('Category not found'));

      await expect(controller.remove(categoryId, merchantId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /products/categories/active/list', () => {
    it('should return active categories sorted by name', async () => {
      const merchantId = 'merchant-1';

      const mockActiveCategories = [
        { id: 'cat-1', name: 'Clothing' },
        { id: 'cat-2', name: 'Electronics' },
      ];

      mockCategoriesService.findActiveCategories.mockResolvedValue(mockActiveCategories);

      const result = await controller.findActiveCategories(merchantId);

      expect(result).toEqual(mockActiveCategories);
      expect(mockCategoriesService.findActiveCategories).toHaveBeenCalledWith(merchantId);
    });

    it('should return only id and name fields', async () => {
      const merchantId = 'merchant-1';

      const mockActiveCategories = [
        { id: 'cat-1', name: 'Electronics' },
      ];

      mockCategoriesService.findActiveCategories.mockResolvedValue(mockActiveCategories);

      const result = await controller.findActiveCategories(merchantId);

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(Object.keys(result[0])).toHaveLength(2);
    });
  });
});
