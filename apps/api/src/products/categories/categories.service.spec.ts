import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaService;

  const mockPrisma = {
    product_categories: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    products: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated categories for a merchant', async () => {
      const merchantId = 'merchant-1';
      const pagination = new PaginationDto();
      pagination.page = 1;
      pagination.limit = 10;

      const mockCategories = [
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
        {
          id: 'cat-2',
          merchant_id: merchantId,
          name: 'Clothing',
          description: 'Clothing items',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 'user-1',
          updated_by: null,
        },
      ];

      mockPrisma.product_categories.findMany.mockResolvedValue(mockCategories);
      mockPrisma.product_categories.count.mockResolvedValue(2);

      const result = await service.findAll(merchantId, pagination);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Electronics');
      expect(result.data[1].name).toBe('Clothing');
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter categories by merchant_id', async () => {
      const merchantId = 'merchant-1';
      const pagination = new PaginationDto();

      mockPrisma.product_categories.findMany.mockResolvedValue([]);
      mockPrisma.product_categories.count.mockResolvedValue(0);

      await service.findAll(merchantId, pagination);

      expect(mockPrisma.product_categories.findMany).toHaveBeenCalledWith({
        where: { merchant_id: merchantId },
        skip: 0,
        take: 10,
        orderBy: { created_at: 'desc' },
      });
    });

    it('should handle pagination with custom page and limit', async () => {
      const merchantId = 'merchant-1';
      const pagination = new PaginationDto();
      pagination.page = 2;
      pagination.limit = 5;

      const mockCategories = [
        {
          id: 'cat-6',
          merchant_id: merchantId,
          name: 'Category 6',
          description: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 'user-1',
          updated_by: null,
        },
      ];

      mockPrisma.product_categories.findMany.mockResolvedValue(mockCategories);
      mockPrisma.product_categories.count.mockResolvedValue(6);

      const result = await service.findAll(merchantId, pagination);

      expect(mockPrisma.product_categories.findMany).toHaveBeenCalledWith({
        where: { merchant_id: merchantId },
        skip: 5, // (2 - 1) * 5
        take: 5,
        orderBy: { created_at: 'desc' },
      });
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.totalPages).toBe(2);
    });

    it('should return empty list when no categories exist for merchant', async () => {
      const merchantId = 'merchant-1';
      const pagination = new PaginationDto();

      mockPrisma.product_categories.findMany.mockResolvedValue([]);
      mockPrisma.product_categories.count.mockResolvedValue(0);

      const result = await service.findAll(merchantId, pagination);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should calculate correct totalPages', async () => {
      const merchantId = 'merchant-1';
      const pagination = new PaginationDto();
      pagination.page = 1;
      pagination.limit = 10;

      mockPrisma.product_categories.findMany.mockResolvedValue([]);
      mockPrisma.product_categories.count.mockResolvedValue(25);

      const result = await service.findAll(merchantId, pagination);

      expect(result.meta.totalPages).toBe(3); // Math.ceil(25 / 10)
    });

    it('should use default pagination values when not provided', async () => {
      const merchantId = 'merchant-1';
      const pagination = new PaginationDto();

      mockPrisma.product_categories.findMany.mockResolvedValue([]);
      mockPrisma.product_categories.count.mockResolvedValue(0);

      await service.findAll(merchantId, pagination);

      expect(mockPrisma.product_categories.findMany).toHaveBeenCalledWith({
        where: { merchant_id: merchantId },
        skip: 0,
        take: 10,
        orderBy: { created_at: 'desc' },
      });
    });

    it('should order results by created_at in descending order', async () => {
      const merchantId = 'merchant-1';
      const pagination = new PaginationDto();

      const mockCategories = [
        {
          id: 'cat-2',
          merchant_id: merchantId,
          name: 'Category 2',
          description: null,
          is_active: true,
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
          created_by: 'user-1',
          updated_by: null,
        },
        {
          id: 'cat-1',
          merchant_id: merchantId,
          name: 'Category 1',
          description: null,
          is_active: true,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 'user-1',
          updated_by: null,
        },
      ];

      mockPrisma.product_categories.findMany.mockResolvedValue(mockCategories);
      mockPrisma.product_categories.count.mockResolvedValue(2);

      const result = await service.findAll(merchantId, pagination);

      expect(mockPrisma.product_categories.findMany).toHaveBeenCalledWith({
        where: { merchant_id: merchantId },
        skip: 0,
        take: 10,
        orderBy: { created_at: 'desc' },
      });
      expect(result.data[0].id).toBe('cat-2');
      expect(result.data[1].id).toBe('cat-1');
    });

    it('should handle large page numbers correctly', async () => {
      const merchantId = 'merchant-1';
      const pagination = new PaginationDto();
      pagination.page = 100;
      pagination.limit = 10;

      mockPrisma.product_categories.findMany.mockResolvedValue([]);
      mockPrisma.product_categories.count.mockResolvedValue(5);

      const result = await service.findAll(merchantId, pagination);

      expect(mockPrisma.product_categories.findMany).toHaveBeenCalledWith({
        where: { merchant_id: merchantId },
        skip: 990, // (100 - 1) * 10
        take: 10,
        orderBy: { created_at: 'desc' },
      });
      expect(result.meta.page).toBe(100);
    });

    it('should include all category fields in response', async () => {
      const merchantId = 'merchant-1';
      const pagination = new PaginationDto();

      const mockCategory = {
        id: 'cat-1',
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
        created_by: 'user-1',
        updated_by: 'user-2',
      };

      mockPrisma.product_categories.findMany.mockResolvedValue([mockCategory]);
      mockPrisma.product_categories.count.mockResolvedValue(1);

      const result = await service.findAll(merchantId, pagination);

      expect(result.data[0]).toEqual(mockCategory);
      expect(result.data[0].id).toBe('cat-1');
      expect(result.data[0].merchant_id).toBe(merchantId);
      expect(result.data[0].name).toBe('Electronics');
      expect(result.data[0].description).toBe('Electronic products');
      expect(result.data[0].is_active).toBe(true);
      expect(result.data[0].created_by).toBe('user-1');
      expect(result.data[0].updated_by).toBe('user-2');
    });
  });

  describe('Audit Fields - Create', () => {
    it('should set created_by on category creation', async () => {
      const merchantId = 'merchant-1';
      const userId = 'user-1';
      const dto = new CreateCategoryDto();
      dto.name = 'Electronics';
      dto.description = 'Electronic products';

      const mockCreatedCategory = {
        id: 'cat-1',
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date('2024-01-01T10:00:00Z'),
        updated_at: new Date('2024-01-01T10:00:00Z'),
        created_by: userId,
        updated_by: userId,
      };

      mockPrisma.product_categories.findFirst.mockResolvedValue(null);
      mockPrisma.product_categories.create.mockResolvedValue(mockCreatedCategory);

      const result = await service.create(dto, merchantId, userId);

      expect(result.created_by).toBe(userId);
      expect(mockPrisma.product_categories.create).toHaveBeenCalledWith({
        data: {
          merchant_id: merchantId,
          name: 'Electronics',
          description: 'Electronic products',
          is_active: true,
          created_by: userId,
          updated_by: userId,
        },
      });
    });

    it('should set created_at on category creation', async () => {
      const merchantId = 'merchant-1';
      const userId = 'user-1';
      const dto = new CreateCategoryDto();
      dto.name = 'Electronics';

      const createdAtTime = new Date('2024-01-01T10:00:00Z');
      const mockCreatedCategory = {
        id: 'cat-1',
        merchant_id: merchantId,
        name: 'Electronics',
        description: null,
        is_active: true,
        created_at: createdAtTime,
        updated_at: createdAtTime,
        created_by: userId,
        updated_by: userId,
      };

      mockPrisma.product_categories.findFirst.mockResolvedValue(null);
      mockPrisma.product_categories.create.mockResolvedValue(mockCreatedCategory);

      const result = await service.create(dto, merchantId, userId);

      expect(result.created_at).toEqual(createdAtTime);
    });

    it('should set updated_by to same as created_by on creation', async () => {
      const merchantId = 'merchant-1';
      const userId = 'user-1';
      const dto = new CreateCategoryDto();
      dto.name = 'Electronics';

      const mockCreatedCategory = {
        id: 'cat-1',
        merchant_id: merchantId,
        name: 'Electronics',
        description: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: userId,
        updated_by: userId,
      };

      mockPrisma.product_categories.findFirst.mockResolvedValue(null);
      mockPrisma.product_categories.create.mockResolvedValue(mockCreatedCategory);

      const result = await service.create(dto, merchantId, userId);

      expect(result.updated_by).toBe(userId);
      expect(result.created_by).toBe(result.updated_by);
    });
  });

  describe('Audit Fields - Update', () => {
    it('should set updated_by on category update', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';
      const userId = 'user-2';
      const dto = new UpdateCategoryDto();
      dto.name = 'Updated Electronics';

      const existingCategory = {
        id: categoryId,
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date('2024-01-01T10:00:00Z'),
        updated_at: new Date('2024-01-01T10:00:00Z'),
        created_by: 'user-1',
        updated_by: 'user-1',
      };

      const updatedCategory = {
        ...existingCategory,
        name: 'Updated Electronics',
        updated_at: new Date('2024-01-02T15:00:00Z'),
        updated_by: userId,
      };

      mockPrisma.product_categories.findFirst
        .mockResolvedValueOnce(existingCategory) // First call: findOne
        .mockResolvedValueOnce(null); // Second call: check for duplicate name
      mockPrisma.product_categories.update.mockResolvedValue(updatedCategory);

      const result = await service.update(categoryId, dto, merchantId, userId);

      expect(result.updated_by).toBe(userId);
      expect(mockPrisma.product_categories.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: expect.objectContaining({
          updated_by: userId,
        }),
      });
    });

    it('should set updated_at on category update', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';
      const userId = 'user-2';
      const dto = new UpdateCategoryDto();
      dto.name = 'Updated Electronics';

      const existingCategory = {
        id: categoryId,
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date('2024-01-01T10:00:00Z'),
        updated_at: new Date('2024-01-01T10:00:00Z'),
        created_by: 'user-1',
        updated_by: 'user-1',
      };

      const updatedAtTime = new Date('2024-01-02T15:00:00Z');
      const updatedCategory = {
        ...existingCategory,
        name: 'Updated Electronics',
        updated_at: updatedAtTime,
        updated_by: userId,
      };

      mockPrisma.product_categories.findFirst
        .mockResolvedValueOnce(existingCategory) // First call: findOne
        .mockResolvedValueOnce(null); // Second call: check for duplicate name
      mockPrisma.product_categories.update.mockResolvedValue(updatedCategory);

      const result = await service.update(categoryId, dto, merchantId, userId);

      expect(result.updated_at).toEqual(updatedAtTime);
      expect(mockPrisma.product_categories.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: expect.objectContaining({
          updated_at: expect.any(Date),
        }),
      });
    });

    it('should preserve created_by and created_at on update', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';
      const originalUserId = 'user-1';
      const updatingUserId = 'user-2';
      const dto = new UpdateCategoryDto();
      dto.name = 'Updated Electronics';

      const createdAtTime = new Date('2024-01-01T10:00:00Z');
      const existingCategory = {
        id: categoryId,
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: createdAtTime,
        updated_at: new Date('2024-01-01T10:00:00Z'),
        created_by: originalUserId,
        updated_by: originalUserId,
      };

      const updatedCategory = {
        ...existingCategory,
        name: 'Updated Electronics',
        updated_at: new Date('2024-01-02T15:00:00Z'),
        updated_by: updatingUserId,
      };

      mockPrisma.product_categories.findFirst
        .mockResolvedValueOnce(existingCategory) // First call: findOne
        .mockResolvedValueOnce(null); // Second call: check for duplicate name
      mockPrisma.product_categories.update.mockResolvedValue(updatedCategory);

      const result = await service.update(categoryId, dto, merchantId, updatingUserId);

      expect(result.created_by).toBe(originalUserId);
      expect(result.created_at).toEqual(createdAtTime);
      expect(result.updated_by).toBe(updatingUserId);
    });
  });;

  describe('findOne', () => {
    it('should return category if it belongs to merchant', async () => {
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

      mockPrisma.product_categories.findFirst.mockResolvedValue(mockCategory);

      const result = await service.findOne(categoryId, merchantId);

      expect(result).toEqual(mockCategory);
      expect(mockPrisma.product_categories.findFirst).toHaveBeenCalledWith({
        where: { id: categoryId, merchant_id: merchantId },
      });
    });

    it('should throw NotFoundException for non-existent category', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';

      mockPrisma.product_categories.findFirst.mockResolvedValue(null);

      await expect(service.findOne(categoryId, merchantId)).rejects.toThrow(
        'Category not found',
      );
    });

    it('should throw NotFoundException for other merchant\'s category', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';

      mockPrisma.product_categories.findFirst.mockResolvedValue(null);

      await expect(service.findOne(categoryId, merchantId)).rejects.toThrow(
        'Category not found',
      );
    });
  });

  describe('create', () => {
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

      mockPrisma.product_categories.findFirst.mockResolvedValue(null);
      mockPrisma.product_categories.create.mockResolvedValue(mockCreatedCategory);

      const result = await service.create(dto, merchantId, userId);

      expect(result).toEqual(mockCreatedCategory);
      expect(mockPrisma.product_categories.create).toHaveBeenCalledWith({
        data: {
          merchant_id: merchantId,
          name: 'Electronics',
          description: 'Electronic products',
          is_active: true,
          created_by: userId,
          updated_by: userId,
        },
      });
    });

    it('should reject duplicate category names per merchant', async () => {
      const merchantId = 'merchant-1';
      const userId = 'user-1';
      const dto = new CreateCategoryDto();
      dto.name = 'Electronics';

      const existingCategory = {
        id: 'cat-1',
        merchant_id: merchantId,
        name: 'Electronics',
        description: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'user-1',
        updated_by: null,
      };

      mockPrisma.product_categories.findFirst.mockResolvedValue(existingCategory);

      await expect(service.create(dto, merchantId, userId)).rejects.toThrow(
        'Category with this name already exists for your merchant',
      );
    });

    it('should default is_active to true', async () => {
      const merchantId = 'merchant-1';
      const userId = 'user-1';
      const dto = new CreateCategoryDto();
      dto.name = 'Electronics';
      // is_active not set

      const mockCreatedCategory = {
        id: 'cat-1',
        merchant_id: merchantId,
        name: 'Electronics',
        description: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: userId,
        updated_by: userId,
      };

      mockPrisma.product_categories.findFirst.mockResolvedValue(null);
      mockPrisma.product_categories.create.mockResolvedValue(mockCreatedCategory);

      const result = await service.create(dto, merchantId, userId);

      expect(result.is_active).toBe(true);
      expect(mockPrisma.product_categories.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          is_active: true,
        }),
      });
    });
  });

  describe('update', () => {
    it('should update category fields', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';
      const userId = 'user-2';
      const dto = new UpdateCategoryDto();
      dto.name = 'Updated Electronics';

      const existingCategory = {
        id: categoryId,
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'user-1',
        updated_by: 'user-1',
      };

      const updatedCategory = {
        ...existingCategory,
        name: 'Updated Electronics',
        updated_at: new Date(),
        updated_by: userId,
      };

      mockPrisma.product_categories.findFirst
        .mockResolvedValueOnce(existingCategory)
        .mockResolvedValueOnce(null);
      mockPrisma.product_categories.update.mockResolvedValue(updatedCategory);

      const result = await service.update(categoryId, dto, merchantId, userId);

      expect(result.name).toBe('Updated Electronics');
      expect(result.updated_by).toBe(userId);
    });

    it('should reject duplicate names within merchant', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';
      const userId = 'user-2';
      const dto = new UpdateCategoryDto();
      dto.name = 'Clothing';

      const existingCategory = {
        id: categoryId,
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'user-1',
        updated_by: 'user-1',
      };

      const duplicateCategory = {
        id: 'cat-2',
        merchant_id: merchantId,
        name: 'Clothing',
        description: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'user-1',
        updated_by: null,
      };

      mockPrisma.product_categories.findFirst
        .mockResolvedValueOnce(existingCategory)
        .mockResolvedValueOnce(duplicateCategory);

      await expect(service.update(categoryId, dto, merchantId, userId)).rejects.toThrow(
        'Category with this name already exists for your merchant',
      );
    });
  });

  describe('remove', () => {
    it('should delete category', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';

      const existingCategory = {
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

      mockPrisma.product_categories.findFirst.mockResolvedValue(existingCategory);
      mockPrisma.products.updateMany.mockResolvedValue({ count: 5 });
      mockPrisma.product_categories.delete.mockResolvedValue(existingCategory);

      const result = await service.remove(categoryId, merchantId);

      expect(result).toEqual(existingCategory);
      expect(mockPrisma.products.updateMany).toHaveBeenCalledWith({
        where: { category_id: categoryId },
        data: { category_id: null },
      });
      expect(mockPrisma.product_categories.delete).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
    });

    it('should set category_id to NULL for related products', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';

      const existingCategory = {
        id: categoryId,
        merchant_id: merchantId,
        name: 'Electronics',
        description: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'user-1',
        updated_by: null,
      };

      mockPrisma.product_categories.findFirst.mockResolvedValue(existingCategory);
      mockPrisma.products.updateMany.mockResolvedValue({ count: 3 });
      mockPrisma.product_categories.delete.mockResolvedValue(existingCategory);

      await service.remove(categoryId, merchantId);

      expect(mockPrisma.products.updateMany).toHaveBeenCalledWith({
        where: { category_id: categoryId },
        data: { category_id: null },
      });
    });
  });

  describe('findActiveCategories', () => {
    it('should return only active categories', async () => {
      const merchantId = 'merchant-1';

      const mockActiveCategories = [
        { id: 'cat-1', name: 'Clothing' },
        { id: 'cat-2', name: 'Electronics' },
      ];

      mockPrisma.product_categories.findMany.mockResolvedValue(mockActiveCategories);

      const result = await service.findActiveCategories(merchantId);

      expect(result).toEqual(mockActiveCategories);
      expect(mockPrisma.product_categories.findMany).toHaveBeenCalledWith({
        where: {
          merchant_id: merchantId,
          is_active: true,
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('should return sorted by name', async () => {
      const merchantId = 'merchant-1';

      const mockActiveCategories = [
        { id: 'cat-1', name: 'Clothing' },
        { id: 'cat-2', name: 'Electronics' },
        { id: 'cat-3', name: 'Food' },
      ];

      mockPrisma.product_categories.findMany.mockResolvedValue(mockActiveCategories);

      const result = await service.findActiveCategories(merchantId);

      expect(result[0].name).toBe('Clothing');
      expect(result[1].name).toBe('Electronics');
      expect(result[2].name).toBe('Food');
    });

    it('should return only id and name fields', async () => {
      const merchantId = 'merchant-1';

      const mockActiveCategories = [
        { id: 'cat-1', name: 'Electronics' },
      ];

      mockPrisma.product_categories.findMany.mockResolvedValue(mockActiveCategories);

      const result = await service.findActiveCategories(merchantId);

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(Object.keys(result[0])).toHaveLength(2);
    });
  });

  describe('Audit Fields - API Response', () => {
    it('should include all audit fields in findAll response', async () => {
      const merchantId = 'merchant-1';
      const pagination = new PaginationDto();

      const mockCategory = {
        id: 'cat-1',
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date('2024-01-01T10:00:00Z'),
        updated_at: new Date('2024-01-02T15:00:00Z'),
        created_by: 'user-1',
        updated_by: 'user-2',
      };

      mockPrisma.product_categories.findMany.mockResolvedValue([mockCategory]);
      mockPrisma.product_categories.count.mockResolvedValue(1);

      const result = await service.findAll(merchantId, pagination);

      expect(result.data[0]).toHaveProperty('created_by');
      expect(result.data[0]).toHaveProperty('created_at');
      expect(result.data[0]).toHaveProperty('updated_by');
      expect(result.data[0]).toHaveProperty('updated_at');
      expect(result.data[0].created_by).toBe('user-1');
      expect(result.data[0].updated_by).toBe('user-2');
    });

    it('should include all audit fields in findOne response', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';

      const mockCategory = {
        id: categoryId,
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date('2024-01-01T10:00:00Z'),
        updated_at: new Date('2024-01-02T15:00:00Z'),
        created_by: 'user-1',
        updated_by: 'user-2',
      };

      mockPrisma.product_categories.findFirst.mockResolvedValue(mockCategory);

      const result = await service.findOne(categoryId, merchantId);

      expect(result).toHaveProperty('created_by');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_by');
      expect(result).toHaveProperty('updated_at');
      expect(result.created_by).toBe('user-1');
      expect(result.updated_by).toBe('user-2');
    });

    it('should include all audit fields in create response', async () => {
      const merchantId = 'merchant-1';
      const userId = 'user-1';
      const dto = new CreateCategoryDto();
      dto.name = 'Electronics';

      const mockCreatedCategory = {
        id: 'cat-1',
        merchant_id: merchantId,
        name: 'Electronics',
        description: null,
        is_active: true,
        created_at: new Date('2024-01-01T10:00:00Z'),
        updated_at: new Date('2024-01-01T10:00:00Z'),
        created_by: userId,
        updated_by: userId,
      };

      mockPrisma.product_categories.findFirst.mockResolvedValue(null);
      mockPrisma.product_categories.create.mockResolvedValue(mockCreatedCategory);

      const result = await service.create(dto, merchantId, userId);

      expect(result).toHaveProperty('created_by');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_by');
      expect(result).toHaveProperty('updated_at');
    });

    it('should include all audit fields in update response', async () => {
      const categoryId = 'cat-1';
      const merchantId = 'merchant-1';
      const userId = 'user-2';
      const dto = new UpdateCategoryDto();
      dto.name = 'Updated Electronics';

      const existingCategory = {
        id: categoryId,
        merchant_id: merchantId,
        name: 'Electronics',
        description: 'Electronic products',
        is_active: true,
        created_at: new Date('2024-01-01T10:00:00Z'),
        updated_at: new Date('2024-01-01T10:00:00Z'),
        created_by: 'user-1',
        updated_by: 'user-1',
      };

      const updatedCategory = {
        ...existingCategory,
        name: 'Updated Electronics',
        updated_at: new Date('2024-01-02T15:00:00Z'),
        updated_by: userId,
      };

      mockPrisma.product_categories.findFirst
        .mockResolvedValueOnce(existingCategory) // First call: findOne
        .mockResolvedValueOnce(null); // Second call: check for duplicate name
      mockPrisma.product_categories.update.mockResolvedValue(updatedCategory);

      const result = await service.update(categoryId, dto, merchantId, userId);

      expect(result).toHaveProperty('created_by');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_by');
      expect(result).toHaveProperty('updated_at');
    });
  });
});
