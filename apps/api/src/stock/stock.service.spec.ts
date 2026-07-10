import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StockService } from './stock.service';
import { PrismaService } from '../database/prisma.service';

describe('StockService', () => {
  let service: StockService;

  const mockPrisma = {
    products: {
      findFirst: jest.fn(),
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
