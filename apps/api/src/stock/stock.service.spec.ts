import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StockService } from './stock.service';
import { PrismaService } from '../database/prisma.service';

describe('StockService', () => {
  let service: StockService;

  const mockPrisma = {
    products: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    outlets: {
      findFirst: jest.fn(),
    },
    outlet_product_inventory: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    inventory_movements: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    jest.clearAllMocks();
  });

  describe('findLogs', () => {
    const merchantId = 'merchant-1';

    it('should return paginated movements without filters', async () => {
      const movements = [
        {
          id: 'movement-1',
          merchant_id: merchantId,
          outlet_id: 'outlet-1',
          product_id: 'product-1',
          change_qty: 5,
          reason: 'restock',
        },
      ];
      mockPrisma.$transaction.mockResolvedValue([movements, 1]);

      const result = await service.findLogs(merchantId);

      expect(mockPrisma.inventory_movements.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            merchant_id: merchantId,
          },
          skip: 0,
          take: 10,
        }),
      );
      expect(mockPrisma.inventory_movements.count).toHaveBeenCalledWith({
        where: {
          merchant_id: merchantId,
        },
      });
      expect(result.data).toEqual(movements);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by search on product name and reason', async () => {
      const movements = [
        {
          id: 'movement-1',
          merchant_id: merchantId,
          reason: 'kopi adjustment',
          products: { name: 'Kopi Susu' },
        },
      ];
      mockPrisma.$transaction.mockResolvedValue([movements, 1]);

      const result = await service.findLogs(
        merchantId,
        undefined,
        undefined,
        { page: 1, limit: 10, skip: 0 } as any,
        'kopi',
      );

      const expectedWhere = {
        merchant_id: merchantId,
        OR: [
          { products: { name: { contains: 'kopi' } } },
          { reason: { contains: 'kopi' } },
        ],
      };

      expect(mockPrisma.inventory_movements.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        }),
      );
      expect(mockPrisma.inventory_movements.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(result.data).toEqual(movements);
    });

    it('should validate product belongs to merchant when productId provided', async () => {
      mockPrisma.products.findFirst.mockResolvedValue(null);

      await expect(
        service.findLogs(merchantId, 'non-existent-product'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate outlet belongs to merchant when outletId provided', async () => {
      mockPrisma.products.findFirst.mockResolvedValue({ id: 'product-1' });
      mockPrisma.outlets.findFirst.mockResolvedValue(null);

      await expect(
        service.findLogs(merchantId, 'product-1', 'non-existent-outlet'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('opname', () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';
    const outlet_id = '550e8400-e29b-41d4-a716-446655440021';
    const A = '550e8400-e29b-41d4-a716-4466554400a1';
    const B = '550e8400-e29b-41d4-a716-4466554400b2';
    const C = '550e8400-e29b-41d4-a716-4466554400c3';

    const setup = (stock: Record<string, number | undefined>) => {
      mockPrisma.outlets.findFirst.mockResolvedValue({ id: outlet_id });
      mockPrisma.products.findMany.mockResolvedValue(
        [A, B, C].map((id) => ({
          id,
          name: `P-${id.slice(-2)}`,
          min_stock: 2,
        })),
      );
      const tx = {
        outlet_product_inventory: {
          findFirst: jest.fn(async ({ where }: any) =>
            stock[where.product_id] === undefined
              ? null
              : { stock_qty: stock[where.product_id] },
          ),
          update: jest.fn(),
          create: jest.fn(),
        },
        inventory_movements: { create: jest.fn() },
      };
      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));
      return tx;
    };

    it('sets stock to the count, logs only real differences and links them by ref_id', async () => {
      const tx = setup({ [A]: 10, [B]: 5, [C]: undefined });
      const result = await service.opname(
        {
          outlet_id,
          note: 'akhir bulan',
          counts: [
            { product_id: A, counted_qty: 7 }, // -3
            { product_id: B, counted_qty: 5 }, // unchanged
            { product_id: C, counted_qty: 4 }, // no inventory row yet, +4
          ],
        },
        merchantId,
        userId,
      );

      expect(result).toMatchObject({ counted: 3, adjusted: 2 });
      expect(result.items.map((i) => i.diff)).toEqual([-3, 0, 4]);
      expect(tx.outlet_product_inventory.update).toHaveBeenCalledTimes(1);
      expect(tx.outlet_product_inventory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          product_id: C,
          stock_qty: 4,
          min_stock: 2,
        }),
      });
      const movements = tx.inventory_movements.create.mock.calls.map(
        (c: any) => c[0].data,
      );
      expect(movements).toHaveLength(2);
      expect(movements[0]).toMatchObject({
        product_id: A,
        change_qty: -3,
        stock_after: 7,
        reason: 'opname_adjustment',
        ref_type: 'stock_opname',
        note: 'akhir bulan',
      });
      expect(movements[0].ref_id).toBe(result.opname_id);
      expect(movements[1].ref_id).toBe(result.opname_id);
    });

    it('rejects a product listed twice', async () => {
      setup({});
      await expect(
        service.opname(
          {
            outlet_id,
            counts: [
              { product_id: A, counted_qty: 1 },
              { product_id: A, counted_qty: 2 },
            ],
          },
          merchantId,
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("rejects a product that is not the merchant's", async () => {
      setup({});
      mockPrisma.products.findMany.mockResolvedValue([]);
      await expect(
        service.opname(
          { outlet_id, counts: [{ product_id: A, counted_qty: 1 }] },
          merchantId,
          userId,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects an outlet of another merchant', async () => {
      setup({});
      mockPrisma.outlets.findFirst.mockResolvedValue(null);
      await expect(
        service.opname(
          { outlet_id, counts: [{ product_id: A, counted_qty: 1 }] },
          merchantId,
          userId,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('adjust', () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';

    it('should reject adjustment when inventory row does not exist for outlet-product', async () => {
      mockPrisma.products.findFirst.mockResolvedValue({
        id: 'product-1',
        merchant_id: merchantId,
        stock_qty: 10,
      });
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });
      mockPrisma.outlet_product_inventory.findFirst.mockResolvedValue(null);

      await expect(
        service.adjust(
          {
            outlet_id: 'outlet-1',
            product_id: 'product-1',
            change_qty: -1,
            reason: 'damage',
          },
          merchantId,
          userId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create inventory row when missing and change_qty is positive', async () => {
      mockPrisma.products.findFirst.mockResolvedValue({
        id: 'product-1',
        merchant_id: merchantId,
        stock_qty: 100,
        min_stock: 2,
      });
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });
      mockPrisma.outlet_product_inventory.findFirst.mockResolvedValue(null);

      const updatedInventory = {
        outlet_id: 'outlet-1',
        product_id: 'product-1',
        stock_qty: 10,
      };
      const movement = { id: 'movement-1' };

      mockPrisma.$transaction.mockResolvedValue([updatedInventory, movement]);

      const result = await service.adjust(
        {
          outlet_id: 'outlet-1',
          product_id: 'product-1',
          change_qty: 10,
          reason: 'restock',
        },
        merchantId,
        userId,
      );

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result.outlet_inventory.stock_qty).toBe(10);
      expect(result.movement).toEqual(movement);
    });

    it('should update outlet inventory and movement log on successful adjustment', async () => {
      mockPrisma.products.findFirst.mockResolvedValue({
        id: 'product-1',
        merchant_id: merchantId,
        stock_qty: 100,
      });
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });
      mockPrisma.outlet_product_inventory.findFirst.mockResolvedValue({
        id: 'inv-1',
        merchant_id: merchantId,
        outlet_id: 'outlet-1',
        product_id: 'product-1',
        stock_qty: 5,
      });

      const updatedInventory = {
        outlet_id: 'outlet-1',
        product_id: 'product-1',
        stock_qty: 8,
      };
      const movement = { id: 'movement-1' };

      mockPrisma.$transaction.mockResolvedValue([updatedInventory, movement]);

      const result = await service.adjust(
        {
          outlet_id: 'outlet-1',
          product_id: 'product-1',
          change_qty: 3,
          reason: 'restock',
          note: 'supplier arrival',
        },
        merchantId,
        userId,
      );

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result.outlet_inventory.stock_qty).toBe(8);
      expect(result.movement).toEqual(movement);
    });

    it('should reject when outlet stock would go below zero', async () => {
      mockPrisma.products.findFirst.mockResolvedValue({
        id: 'product-1',
        merchant_id: merchantId,
        stock_qty: 100,
      });
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });
      mockPrisma.outlet_product_inventory.findFirst.mockResolvedValue({
        id: 'inv-1',
        merchant_id: merchantId,
        outlet_id: 'outlet-1',
        product_id: 'product-1',
        stock_qty: 1,
      });

      await expect(
        service.adjust(
          {
            outlet_id: 'outlet-1',
            product_id: 'product-1',
            change_qty: -5,
            reason: 'damage',
          },
          merchantId,
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid reason for positive change_qty', async () => {
      await expect(
        service.adjust(
          {
            outlet_id: 'outlet-1',
            product_id: 'product-1',
            change_qty: 5,
            reason: 'damage',
          } as any,
          merchantId,
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid reason for negative change_qty', async () => {
      await expect(
        service.adjust(
          {
            outlet_id: 'outlet-1',
            product_id: 'product-1',
            change_qty: -5,
            reason: 'restock',
          } as any,
          merchantId,
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
