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
    outlets: {
      findFirst: jest.fn(),
    },
    outlet_product_inventory: {
      findMany: jest.fn(),
    },
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

      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(
        'category-1',
        merchantId,
      );
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
        include: expect.objectContaining({
          merchants: true,
          product_categories: true,
          upload: true,
        }),
      });
    });
  });

  describe('findAll', () => {
    const merchantId = 'merchant-1';

    it('should return paginated products with outlet inventory when outlet_id is provided', async () => {
      const pagination = Object.assign(new PaginationDto(), {
        page: 1,
        limit: 10,
        outlet_id: 'outlet-1',
      });

      const mockProducts = [
        {
          id: 'product-1',
          merchant_id: merchantId,
          name: 'Product 1',
          slug: 'product-1',
          stock_qty: 99,
          min_stock: 5,
          image_upload_id: null,
        },
      ];

      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });
      mockPrisma.$transaction.mockResolvedValue([mockProducts, 1]);
      mockPrisma.outlet_product_inventory.findMany.mockResolvedValue([
        {
          id: 'inv-1',
          outlet_id: 'outlet-1',
          product_id: 'product-1',
          stock_qty: 7,
          min_stock: 2,
          is_active: true,
        },
      ]);

      const result = await service.findAll(merchantId, pagination as any);

      expect(mockPrisma.outlets.findFirst).toHaveBeenCalledWith({
        where: { id: 'outlet-1', merchant_id: merchantId },
      });
      expect(mockPrisma.outlet_product_inventory.findMany).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].inventory).toEqual(
        expect.objectContaining({
          outlet_id: 'outlet-1',
          stock_qty: 7,
          min_stock: 2,
          is_active: true,
        }),
      );
      expect(result.meta.total).toBe(1);
    });

    it('should filter products by category_id', async () => {
      const pagination = Object.assign(new PaginationDto(), {
        page: 1,
        limit: 10,
        category_id: 'category-1',
      });

      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      await service.findAll(merchantId, pagination as any);

      expect(mockPrisma.products.findMany).toHaveBeenCalledWith({
        where: { merchant_id: merchantId, category_id: 'category-1' },
        include: expect.objectContaining({
          merchants: true,
          product_categories: true,
          upload: true,
        }),
        orderBy: { created_at: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      });
      expect(mockPrisma.products.count).toHaveBeenCalledWith({
        where: { merchant_id: merchantId, category_id: 'category-1' },
      });
    });

    it('should throw NotFoundException when outlet_id does not belong to merchant', async () => {
      const pagination = Object.assign(new PaginationDto(), {
        page: 1,
        limit: 10,
        outlet_id: 'outlet-x',
      });

      mockPrisma.outlets.findFirst.mockResolvedValue(null);

      await expect(
        service.findAll(merchantId, pagination as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    const merchantId = 'merchant-1';

    it('should return product detail with outlet inventory when outlet_id is provided', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });
      mockPrisma.products.findFirst.mockResolvedValue({
        id: 'product-1',
        merchant_id: merchantId,
        name: 'Product 1',
        slug: 'product-1',
        stock_qty: 999,
        min_stock: 9,
        image_upload_id: null,
      });
      mockPrisma.outlet_product_inventory.findMany.mockResolvedValue([]);
      (mockPrisma.outlet_product_inventory as any).findFirst = jest
        .fn()
        .mockResolvedValue({
          id: 'inv-1',
          outlet_id: 'outlet-1',
          product_id: 'product-1',
          stock_qty: 12,
          min_stock: 3,
          is_active: true,
        });

      const result = await service.findOne('product-1', merchantId, 'outlet-1');

      expect(mockPrisma.outlets.findFirst).toHaveBeenCalledWith({
        where: { id: 'outlet-1', merchant_id: merchantId },
      });
      expect(
        (mockPrisma.outlet_product_inventory as any).findFirst,
      ).toHaveBeenCalled();
      expect(result.inventory).toEqual(
        expect.objectContaining({
          outlet_id: 'outlet-1',
          stock_qty: 12,
          min_stock: 3,
          is_active: true,
        }),
      );
    });

    it('should throw NotFoundException when outlet_id does not belong to merchant', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('product-1', merchantId, 'bad-outlet'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return zero outlet stock when inventory row is missing', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });
      mockPrisma.products.findFirst.mockResolvedValue({
        id: 'product-1',
        merchant_id: merchantId,
        name: 'Product 1',
        slug: 'product-1',
        stock_qty: 500,
        min_stock: 20,
        image_upload_id: null,
      });
      (mockPrisma.outlet_product_inventory as any).findFirst = jest
        .fn()
        .mockResolvedValue(null);

      const result = await service.findOne('product-1', merchantId, 'outlet-1');
      expect(result.inventory).toBeNull();
    });
  });

  describe('importProducts', () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';
    const outlet_id = '550e8400-e29b-41d4-a716-446655440021';

    const setup = (existing: Array<{ name: string; slug: string }> = []) => {
      mockPrisma.outlets.findFirst.mockResolvedValue({ id: outlet_id });
      mockPrisma.products.findMany.mockResolvedValue(existing);
      const tx = {
        product_categories: {
          findMany: jest
            .fn()
            .mockResolvedValue([{ id: 'cat-1', name: 'Makanan' }]),
          create: jest.fn().mockResolvedValue({ id: 'cat-new' }),
        },
        products: { createMany: jest.fn() },
        outlet_product_inventory: { createMany: jest.fn() },
      };
      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));
      return tx;
    };

    it('creates products, inventory and missing categories in one transaction', async () => {
      const tx = setup([{ name: 'Lama', slug: 'keripik-singkong' }]);
      const result = await service.importProducts(
        {
          outlet_id,
          rows: [
            {
              name: 'Keripik Singkong',
              price: 15000,
              category: 'makanan',
              stock_qty: 50,
            },
            {
              name: 'Kaos Bali',
              price: 80000,
              cost: 40000,
              category: 'Fashion',
              min_stock: 3,
            },
          ],
        },
        merchantId,
        userId,
      );
      expect(result).toEqual({ created: 2, categories_created: 1 });
      expect(tx.product_categories.create).toHaveBeenCalledTimes(1);
      const products = tx.products.createMany.mock.calls[0][0].data;
      // existing slug is taken, so the new one gets a numeric suffix
      expect(products[0]).toMatchObject({
        slug: 'keripik-singkong-2',
        category_id: 'cat-1',
        cost: 0,
      });
      expect(products[1]).toMatchObject({
        slug: 'kaos-bali',
        category_id: 'cat-new',
        cost: 40000,
      });
      const inventory =
        tx.outlet_product_inventory.createMany.mock.calls[0][0].data;
      expect(
        inventory.map((i: any) => [i.product_id, i.stock_qty, i.min_stock]),
      ).toEqual([
        [products[0].id, 50, 0],
        [products[1].id, 0, 3],
      ]);
    });

    it('rejects everything and writes nothing when any row is bad', async () => {
      setup([{ name: 'Sudah Ada', slug: 'sudah-ada' }]);
      const promise = service.importProducts(
        {
          outlet_id,
          rows: [
            { name: 'Baru', price: 1 },
            { name: 'sudah ada', price: 1 },
            { name: 'BARU', price: 1 },
          ],
        },
        merchantId,
        userId,
      );
      await expect(promise).rejects.toThrow(BadRequestException);
      await promise.catch((e) => {
        expect(e.getResponse().message).toEqual([
          'Baris 3: produk "sudah ada" sudah ada',
          'Baris 4: "BARU" duplikat dengan baris 2',
        ]);
      });
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects an outlet of another merchant', async () => {
      setup();
      mockPrisma.outlets.findFirst.mockResolvedValue(null);
      await expect(
        service.importProducts(
          { outlet_id, rows: [{ name: 'A', price: 1 }] },
          merchantId,
          userId,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('option groups', () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';
    const groups = [
      {
        name: ' Ukuran ',
        is_required: true,
        options: [{ name: 'Small' }, { name: 'Large', price_delta: 5000 }],
      },
      {
        name: 'Topping',
        allow_multiple: true,
        options: [{ name: 'Boba', price_delta: 3000 }],
      },
    ];

    it('creates groups and options nested with sort order and defaults', async () => {
      mockPrisma.products.findFirst.mockResolvedValue(null);
      mockPrisma.products.create.mockResolvedValue({ id: 'p-1' });
      await service.create(
        { slug: 'kopi', name: 'Kopi', price: 10000, option_groups: groups },
        merchantId,
        userId,
      );
      const data = mockPrisma.products.create.mock.calls[0][0].data;
      expect(data.option_groups).toBeUndefined();
      expect(data.product_option_groups.create).toEqual([
        {
          name: 'Ukuran',
          is_required: true,
          allow_multiple: false,
          sort_order: 0,
          product_options: {
            create: [
              { name: 'Small', price_delta: 0, sort_order: 0 },
              { name: 'Large', price_delta: 5000, sort_order: 1 },
            ],
          },
        },
        {
          name: 'Topping',
          is_required: false,
          allow_multiple: true,
          sort_order: 1,
          product_options: {
            create: [{ name: 'Boba', price_delta: 3000, sort_order: 0 }],
          },
        },
      ]);
    });

    it('replaces all groups on update when option_groups is sent', async () => {
      mockPrisma.products.findFirst.mockResolvedValue({
        id: 'p-1',
        merchants: {},
      });
      mockPrisma.products.update.mockResolvedValue({ id: 'p-1' });
      await service.update(
        'p-1',
        { option_groups: groups },
        merchantId,
        userId,
      );
      const data = mockPrisma.products.update.mock.calls[0][0].data;
      expect(data.product_option_groups.deleteMany).toEqual({});
      expect(data.product_option_groups.create).toHaveLength(2);
    });

    it('sending an empty list removes all groups', async () => {
      mockPrisma.products.findFirst.mockResolvedValue({
        id: 'p-1',
        merchants: {},
      });
      mockPrisma.products.update.mockResolvedValue({ id: 'p-1' });
      await service.update('p-1', { option_groups: [] }, merchantId, userId);
      const data = mockPrisma.products.update.mock.calls[0][0].data;
      expect(data.product_option_groups).toEqual({
        deleteMany: {},
        create: [],
      });
    });

    it('leaves groups untouched when option_groups is omitted', async () => {
      mockPrisma.products.findFirst.mockResolvedValue({
        id: 'p-1',
        merchants: {},
      });
      mockPrisma.products.update.mockResolvedValue({ id: 'p-1' });
      await service.update('p-1', { name: 'Baru' }, merchantId, userId);
      const data = mockPrisma.products.update.mock.calls[0][0].data;
      expect(data.product_option_groups).toBeUndefined();
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

      const result = await service.update(
        productId,
        updateDto,
        merchantId,
        userId,
      );

      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(
        'category-1',
        merchantId,
      );
      expect(mockPrisma.products.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: expect.objectContaining({
          category_id: 'category-1',
          updated_by: userId,
        }),
        include: expect.objectContaining({
          merchants: true,
          product_categories: true,
          upload: true,
        }),
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

      const result = await service.update(
        productId,
        updateDto,
        merchantId,
        userId,
      );

      expect(mockCategoriesService.findOne).not.toHaveBeenCalled();
      expect(mockPrisma.products.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: expect.objectContaining({
          category_id: null,
          updated_by: userId,
        }),
        include: expect.objectContaining({
          merchants: true,
          product_categories: true,
          upload: true,
        }),
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

      await expect(
        service.update(productId, updateDto, merchantId, userId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(productId, updateDto, merchantId, userId),
      ).rejects.toThrow(
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

      await expect(
        service.update(productId, updateDto, merchantId, userId),
      ).rejects.toThrow(BadRequestException);
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

      const result = await service.update(
        productId,
        updateDto,
        merchantId,
        userId,
      );

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

      const result = await service.update(
        productId,
        updateDto,
        merchantId,
        userId,
      );

      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(
        'category-2',
        merchantId,
      );
      expect(result.category_id).toBe('category-2');
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      mockPrisma.products.findFirst.mockResolvedValue(null);

      await expect(
        service.update(productId, updateDto, merchantId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product belongs to different merchant', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      mockPrisma.products.findFirst.mockResolvedValue(null);

      await expect(
        service.update(productId, updateDto, 'different-merchant', userId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
