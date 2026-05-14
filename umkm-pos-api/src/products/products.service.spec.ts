import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { CategoriesService } from './categories/categories.service';
import { PrismaService } from '../database/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let categoriesService: CategoriesService;
  let prisma: PrismaService;

  const mockPrisma = {
    products: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockCategoriesService = {
    findOne: jest.fn(),
  };

  const mockUploadsService = {
    upload: jest.fn(),
    findById: jest.fn(),
    generateSignedUrl: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    categoriesService = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';
    const baseDto: CreateProductDto = {
      slug: 'test-product',
      name: 'Test Product',
      price: 10000,
    };

    it('should create a product with valid category_id', async () => {
      const dto: CreateProductDto = {
        ...baseDto,
        category_id: 'category-1',
      };

      const mockCategory = {
        id: 'category-1',
        merchant_id: merchantId,
        name: 'Test Category',
      };

      const mockProduct = {
        id: 'product-1',
        slug: 'test-product',
        name: 'Test Product',
        merchant_id: merchantId,
        category_id: 'category-1',
        price: 10000,
        cost: 0,
        stock_qty: 0,
        min_stock: 0,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      };

      mockPrisma.products.findFirst.mockResolvedValue(null);
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);
      mockPrisma.products.create.mockResolvedValue(mockProduct);

      const result = await service.create(dto, merchantId, userId);

      expect(mockCategoriesService.findOne).toHaveBeenCalledWith('category-1', merchantId);
      expect(mockPrisma.products.create).toHaveBeenCalled();
      expect(result.category_id).toBe('category-1');
    });

    it('should create a product without category_id', async () => {
      const dto: CreateProductDto = baseDto;

      const mockProduct = {
        id: 'product-1',
        slug: 'test-product',
        name: 'Test Product',
        merchant_id: merchantId,
        category_id: null,
        price: 10000,
        cost: 0,
        stock_qty: 0,
        min_stock: 0,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      };

      mockPrisma.products.findFirst.mockResolvedValue(null);
      mockPrisma.products.create.mockResolvedValue(mockProduct);

      const result = await service.create(dto, merchantId, userId);

      expect(mockCategoriesService.findOne).not.toHaveBeenCalled();
      expect(mockPrisma.products.create).toHaveBeenCalled();
      expect(result.category_id).toBeNull();
    });

    it('should reject invalid category_id', async () => {
      const dto: CreateProductDto = {
        ...baseDto,
        category_id: 'invalid-category',
      };

      mockPrisma.products.findFirst.mockResolvedValue(null);
      mockCategoriesService.findOne.mockRejectedValue(
        new NotFoundException('Category not found'),
      );

      await expect(service.create(dto, merchantId, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(dto, merchantId, userId)).rejects.toThrow(
        'Invalid category_id: category does not exist or belongs to another merchant',
      );
    });

    it('should reject category_id from different merchant', async () => {
      const dto: CreateProductDto = {
        ...baseDto,
        category_id: 'category-1',
      };

      mockPrisma.products.findFirst.mockResolvedValue(null);
      mockCategoriesService.findOne.mockRejectedValue(
        new NotFoundException('Category not found'),
      );

      await expect(service.create(dto, merchantId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow null category_id', async () => {
      const dto: CreateProductDto = {
        ...baseDto,
        category_id: null,
      };

      const mockProduct = {
        id: 'product-1',
        slug: 'test-product',
        name: 'Test Product',
        merchant_id: merchantId,
        category_id: null,
        price: 10000,
        cost: 0,
        stock_qty: 0,
        min_stock: 0,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      };

      mockPrisma.products.findFirst.mockResolvedValue(null);
      mockPrisma.products.create.mockResolvedValue(mockProduct);

      const result = await service.create(dto, merchantId, userId);

      expect(mockCategoriesService.findOne).not.toHaveBeenCalled();
      expect(result.category_id).toBeNull();
    });

    it('should set default values for optional fields', async () => {
      const dto: CreateProductDto = baseDto;

      const mockProduct = {
        id: 'product-1',
        slug: 'test-product',
        name: 'Test Product',
        merchant_id: merchantId,
        category_id: null,
        price: 10000,
        cost: 0,
        stock_qty: 0,
        min_stock: 0,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      };

      mockPrisma.products.findFirst.mockResolvedValue(null);
      mockPrisma.products.create.mockResolvedValue(mockProduct);

      await service.create(dto, merchantId, userId);

      expect(mockPrisma.products.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          cost: 0,
          stock_qty: 0,
          min_stock: 0,
          is_active: true,
          created_by: userId,
          updated_by: userId,
        }),
        include: { merchants: true, product_categories: true, upload: true },
      });
    });
  });

  describe('update', () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';
    const productId = 'product-1';

    it('should update product with valid category_id', async () => {
      const mockExistingProduct = {
        id: productId,
        slug: 'test-product',
        name: 'Test Product',
        merchant_id: merchantId,
        category_id: null,
        price: 10000,
        cost: 0,
        stock_qty: 0,
        min_stock: 0,
        is_active: true,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        merchants: { id: merchantId },
      };

      const updateDto = {
        category_id: 'category-1',
      };

      const mockCategory = {
        id: 'category-1',
        merchant_id: merchantId,
        name: 'Test Category',
      };

      const updatedProduct = {
        ...mockExistingProduct,
        category_id: 'category-1',
      };

      mockPrisma.products.findFirst.mockResolvedValue(mockExistingProduct);
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);
      mockPrisma.products.update.mockResolvedValue(updatedProduct);

      const result = await service.update(productId, updateDto, merchantId, userId);

      expect(mockCategoriesService.findOne).toHaveBeenCalledWith('category-1', merchantId);
      expect(mockPrisma.products.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: expect.objectContaining({
          category_id: 'category-1',
          updated_by: userId,
        }),
        include: { merchants: true, product_categories: true, upload: true },
      });
      expect(result.category_id).toBe('category-1');
    });

    it('should allow clearing category_id by setting to null', async () => {
      const productWithCategory = {
        id: productId,
        slug: 'test-product',
        name: 'Test Product',
        merchant_id: merchantId,
        category_id: 'category-1',
        price: 10000,
        cost: 0,
        stock_qty: 0,
        min_stock: 0,
        is_active: true,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        merchants: { id: merchantId },
      };

      const updateDto = {
        category_id: null,
      };

      const updatedProduct = {
        ...productWithCategory,
        category_id: null,
      };

      mockPrisma.products.findFirst.mockResolvedValue(productWithCategory);
      mockPrisma.products.update.mockResolvedValue(updatedProduct);

      const result = await service.update(productId, updateDto, merchantId, userId);

      expect(mockCategoriesService.findOne).not.toHaveBeenCalled();
      expect(mockPrisma.products.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: expect.objectContaining({
          category_id: null,
          updated_by: userId,
        }),
        include: { merchants: true, product_categories: true, upload: true },
      });
      expect(result.category_id).toBeNull();
    });

    it('should reject invalid category_id on update', async () => {
      const mockExistingProduct = {
        id: productId,
        slug: 'test-product',
        name: 'Test Product',
        merchant_id: merchantId,
        category_id: null,
        price: 10000,
        cost: 0,
        stock_qty: 0,
        min_stock: 0,
        is_active: true,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        merchants: { id: merchantId },
      };

      const updateDto = {
        category_id: 'invalid-category',
      };

      mockPrisma.products.findFirst.mockResolvedValue(mockExistingProduct);
      mockCategoriesService.findOne.mockRejectedValue(
        new NotFoundException('Category not found'),
      );

      await expect(service.update(productId, updateDto, merchantId, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(productId, updateDto, merchantId, userId)).rejects.toThrow(
        'Invalid category_id: category does not exist or belongs to another merchant',
      );
    });

    it('should reject category_id from different merchant on update', async () => {
      const mockExistingProduct = {
        id: productId,
        slug: 'test-product',
        name: 'Test Product',
        merchant_id: merchantId,
        category_id: null,
        price: 10000,
        cost: 0,
        stock_qty: 0,
        min_stock: 0,
        is_active: true,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        merchants: { id: merchantId },
      };

      const updateDto = {
        category_id: 'category-from-other-merchant',
      };

      mockPrisma.products.findFirst.mockResolvedValue(mockExistingProduct);
      mockCategoriesService.findOne.mockRejectedValue(
        new NotFoundException('Category not found'),
      );

      await expect(service.update(productId, updateDto, merchantId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not validate category_id if not provided in update', async () => {
      const mockExistingProduct = {
        id: productId,
        slug: 'test-product',
        name: 'Test Product',
        merchant_id: merchantId,
        category_id: null,
        price: 10000,
        cost: 0,
        stock_qty: 0,
        min_stock: 0,
        is_active: true,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        merchants: { id: merchantId },
      };

      const updateDto = {
        name: 'Updated Product Name',
      };

      const updatedProduct = {
        ...mockExistingProduct,
        name: 'Updated Product Name',
      };

      mockPrisma.products.findFirst.mockResolvedValue(mockExistingProduct);
      mockPrisma.products.update.mockResolvedValue(updatedProduct);

      const result = await service.update(productId, updateDto, merchantId, userId);

      expect(mockCategoriesService.findOne).not.toHaveBeenCalled();
      expect(mockPrisma.products.update).toHaveBeenCalled();
      expect(result.name).toBe('Updated Product Name');
    });

    it('should update category_id from one category to another', async () => {
      const productWithCategory = {
        id: productId,
        slug: 'test-product',
        name: 'Test Product',
        merchant_id: merchantId,
        category_id: 'category-1',
        price: 10000,
        cost: 0,
        stock_qty: 0,
        min_stock: 0,
        is_active: true,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        merchants: { id: merchantId },
      };

      const updateDto = {
        category_id: 'category-2',
      };

      const mockNewCategory = {
        id: 'category-2',
        merchant_id: merchantId,
        name: 'New Category',
      };

      const updatedProduct = {
        ...productWithCategory,
        category_id: 'category-2',
      };

      mockPrisma.products.findFirst.mockResolvedValue(productWithCategory);
      mockCategoriesService.findOne.mockResolvedValue(mockNewCategory);
      mockPrisma.products.update.mockResolvedValue(updatedProduct);

      const result = await service.update(productId, updateDto, merchantId, userId);

      expect(mockCategoriesService.findOne).toHaveBeenCalledWith('category-2', merchantId);
      expect(result.category_id).toBe('category-2');
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      mockPrisma.products.findFirst.mockResolvedValue(null);

      await expect(service.update(productId, updateDto, merchantId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if product belongs to different merchant', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      mockPrisma.products.findFirst.mockResolvedValue(null);

      await expect(service.update(productId, updateDto, 'different-merchant', userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
