import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../database/prisma.service';
import { ShiftsService } from '../shifts/shifts.service';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockPrisma = {
    outlets: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    products: {
      findMany: jest.fn(),
    },
    outlet_product_inventory: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    transactions: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user_roles: {
      findMany: jest.fn(),
    },
    transaction_items: {
      createMany: jest.fn(),
    },
    inventory_movements: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockShiftsService = {
    validateShiftOpen: jest.fn(),
    isActiveParticipant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: ShiftsService,
          useValue: mockShiftsService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
    mockPrisma.user_roles.findMany.mockResolvedValue([
      {
        user_id: 'user-1',
        outlet_id: 'outlet-1',
        roles: { name: 'cashier' },
      },
    ]);
  });

  describe('create', () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';

    it('should create transaction with percentage and fixed discounts correctly', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });

      mockPrisma.products.findMany.mockResolvedValue([
        {
          id: 'product-1',
          merchant_id: merchantId,
          name: 'Product 1',
          price: 10000,
          stock_qty: 100,
          is_active: true,
        },
        {
          id: 'product-2',
          merchant_id: merchantId,
          name: 'Product 2',
          price: 20000,
          stock_qty: 100,
          is_active: true,
        },
      ]);

      mockPrisma.outlet_product_inventory.findMany.mockResolvedValue([
        {
          id: 'inv-1',
          merchant_id: merchantId,
          outlet_id: 'outlet-1',
          product_id: 'product-1',
          stock_qty: 10,
          is_active: true,
        },
        {
          id: 'inv-2',
          merchant_id: merchantId,
          outlet_id: 'outlet-1',
          product_id: 'product-2',
          stock_qty: 10,
          is_active: true,
        },
      ]);

      const txContext = {
        transactions: {
          create: jest
            .fn()
            .mockResolvedValue({ id: 'tx-1', outlet_id: 'outlet-1' }),
        },
        transaction_items: {
          createMany: jest.fn().mockResolvedValue({ count: 2 }),
        },
        outlet_product_inventory: {
          update: jest.fn().mockResolvedValue({ stock_qty: 8 }),
        },
        inventory_movements: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(txContext);
      });

      mockPrisma.transactions.findFirst.mockResolvedValue({
        id: 'tx-1',
        outlet_id: 'outlet-1',
        total_amount: 25000,
      });

      const dto = {
        outlet_id: 'outlet-1',
        payment_method: 'cash',
        items: [
          {
            product_id: 'product-1',
            qty: 2, // gross: 20000, 10% disc = 2000, subtotal = 18000
            discount_type: 'percentage' as const,
            discount_value: 10,
          },
          {
            product_id: 'product-2',
            qty: 1, // gross: 20000, fixed 13000 disc, subtotal = 7000
            discount_type: 'fixed' as const,
            discount_value: 13000,
          },
        ],
        cash_received: 30000,
        change_amount: 5000, // 30000 - (18000 + 7000 = 25000) = 5000
      };

      const result = await service.create(dto as any, merchantId, userId);
      expect(result).toBeDefined();
      expect(txContext.transactions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            total_amount: 25000,
          }),
        }),
      );
      expect(txContext.transaction_items.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            product_id: 'product-1',
            discount_type: 'percentage',
            discount_value: 10,
            discount_amount: 2000,
            subtotal: 18000,
          }),
          expect.objectContaining({
            product_id: 'product-2',
            discount_type: 'fixed',
            discount_value: 13000,
            discount_amount: 13000,
            subtotal: 7000,
          }),
        ],
      });
    });

    it('should reject invalid discount values', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });
      mockPrisma.products.findMany.mockResolvedValue([
        {
          id: 'product-1',
          merchant_id: merchantId,
          name: 'Product 1',
          price: 10000,
          stock_qty: 100,
          is_active: true,
        },
      ]);
      mockPrisma.outlet_product_inventory.findMany.mockResolvedValue([
        {
          id: 'inv-1',
          merchant_id: merchantId,
          outlet_id: 'outlet-1',
          product_id: 'product-1',
          stock_qty: 10,
          is_active: true,
        },
      ]);

      const invalidPctDto = {
        outlet_id: 'outlet-1',
        payment_method: 'cash',
        items: [
          {
            product_id: 'product-1',
            qty: 1,
            discount_type: 'percentage' as const,
            discount_value: 150, // > 100%
          },
        ],
        cash_received: 10000,
        change_amount: 0,
      };

      await expect(
        service.create(invalidPctDto as any, merchantId, userId),
      ).rejects.toThrow(BadRequestException);

      const invalidFixedDto = {
        outlet_id: 'outlet-1',
        payment_method: 'cash',
        items: [
          {
            product_id: 'product-1',
            qty: 1, // gross: 10000
            discount_type: 'fixed' as const,
            discount_value: 15000, // > 10000
          },
        ],
        cash_received: 10000,
        change_amount: 0,
      };

      await expect(
        service.create(invalidFixedDto as any, merchantId, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject sale when outlet inventory is insufficient even if legacy product stock is high', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });

      mockPrisma.products.findMany.mockResolvedValue([
        {
          id: 'product-1',
          merchant_id: merchantId,
          name: 'Product 1',
          price: 10000,
          stock_qty: 100,
          is_active: true,
        },
      ]);

      mockPrisma.outlet_product_inventory.findMany.mockResolvedValue([
        {
          id: 'inv-1',
          merchant_id: merchantId,
          outlet_id: 'outlet-1',
          product_id: 'product-1',
          stock_qty: 1,
          is_active: true,
        },
      ]);

      await expect(
        service.create(
          {
            outlet_id: 'outlet-1',
            payment_method: 'cash',
            cash_received: 50000,
            change_amount: 30000,
            items: [{ product_id: 'product-1', qty: 2 }],
          },
          merchantId,
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should perform outlet stock decrement and write inventory movement on successful sale', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });

      mockPrisma.products.findMany.mockResolvedValue([
        {
          id: 'product-1',
          merchant_id: merchantId,
          name: 'Product 1',
          price: 10000,
          stock_qty: 100,
          is_active: true,
        },
      ]);

      mockPrisma.outlet_product_inventory.findMany.mockResolvedValue([
        {
          id: 'inv-1',
          merchant_id: merchantId,
          outlet_id: 'outlet-1',
          product_id: 'product-1',
          stock_qty: 10,
          is_active: true,
        },
      ]);

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          transactions: {
            create: jest.fn().mockResolvedValue({ id: 'tx-1' }),
          },
          transaction_items: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          outlet_product_inventory: {
            update: jest.fn().mockResolvedValue({}),
          },
          inventory_movements: {
            create: jest.fn().mockResolvedValue({}),
          },
        };

        const result = await callback(tx);

        expect(tx.outlet_product_inventory.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              outlet_id_product_id: {
                outlet_id: 'outlet-1',
                product_id: 'product-1',
              },
            },
          }),
        );
        expect(tx.inventory_movements.create).toHaveBeenCalled();

        return result;
      });

      mockPrisma.transactions.findFirst.mockResolvedValue({
        id: 'tx-1',
        transaction_items: [],
      });

      const result = await service.create(
        {
          outlet_id: 'outlet-1',
          payment_method: 'cash',
          cash_received: 50000,
          change_amount: 40000,
          items: [{ product_id: 'product-1', qty: 1 }],
        },
        merchantId,
        userId,
      );

      expect(result).toBeDefined();
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel', () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';

    it('should restore stock only to transaction outlet and write inventory movement', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.transactions.findFirst.mockResolvedValue({
        id: 'tx-1',
        outlet_id: 'outlet-1',
        is_cancelled: false,
        transaction_items: [
          {
            product_id: 'product-1',
            qty: 2,
          },
        ],
      });

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          transactions: {
            update: jest.fn().mockResolvedValue({ id: 'tx-1' }),
          },
          outlet_product_inventory: {
            update: jest.fn().mockResolvedValue({}),
          },
          inventory_movements: {
            create: jest.fn().mockResolvedValue({}),
          },
        };

        const result = await callback(tx);

        expect(tx.outlet_product_inventory.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              outlet_id_product_id: {
                outlet_id: 'outlet-1',
                product_id: 'product-1',
              },
            },
          }),
        );
        expect(tx.inventory_movements.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              outlet_id: 'outlet-1',
              reason: 'sale_cancel',
              ref_type: 'transaction_cancel',
              ref_id: 'tx-1',
            }),
          }),
        );

        return result;
      });

      mockPrisma.transactions.findFirst.mockResolvedValueOnce({
        id: 'tx-1',
        outlet_id: 'outlet-1',
        is_cancelled: false,
        transaction_items: [
          {
            product_id: 'product-1',
            qty: 2,
          },
        ],
      });
      mockPrisma.transactions.findFirst.mockResolvedValueOnce({
        id: 'tx-1',
        outlet_id: 'outlet-1',
        is_cancelled: true,
        transaction_items: [
          {
            product_id: 'product-1',
            qty: 2,
          },
        ],
      });

      const result = await service.cancel('tx-1', merchantId, userId);
      expect(result).toBeDefined();
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Access Control', () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';

    describe('getAllowedOutletIds', () => {
      it('should return all outlets for owner role', async () => {
        mockPrisma.user_roles.findMany.mockResolvedValue([
          {
            user_id: userId,
            outlet_id: 'outlet-1',
            roles: { name: 'owner' },
          },
        ]);
        mockPrisma.outlets.findMany.mockResolvedValue([
          { id: 'outlet-1' },
          { id: 'outlet-2' },
        ]);

        const result = await service.getAllowedOutletIds(userId, merchantId);
        expect(result).toEqual(['outlet-1', 'outlet-2']);
        expect(mockPrisma.outlets.findMany).toHaveBeenCalledWith({
          where: { merchant_id: merchantId },
          select: { id: true },
        });
      });

      it('should return only assigned outlets for cashier role', async () => {
        mockPrisma.user_roles.findMany.mockResolvedValue([
          {
            user_id: userId,
            outlet_id: 'outlet-1',
            roles: { name: 'cashier' },
          },
        ]);

        const result = await service.getAllowedOutletIds(userId, merchantId);
        expect(result).toEqual(['outlet-1']);
      });
    });

    describe('findAll', () => {
      it('should filter by assigned outlets when outlet_id query is not provided', async () => {
        mockPrisma.user_roles.findMany.mockResolvedValue([
          {
            user_id: userId,
            outlet_id: 'outlet-1',
            roles: { name: 'cashier' },
          },
        ]);
        mockPrisma.$transaction.mockResolvedValue([[], 0]);

        await service.findAll(merchantId, userId);

        expect(mockPrisma.transactions.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              outlet_id: { in: ['outlet-1'] },
            }),
          }),
        );
      });

      it('should allow querying assigned outlet for non-owner', async () => {
        mockPrisma.user_roles.findMany.mockResolvedValue([
          {
            user_id: userId,
            outlet_id: 'outlet-1',
            roles: { name: 'cashier' },
          },
        ]);
        mockPrisma.outlets.findFirst.mockResolvedValue({
          id: 'outlet-1',
          merchant_id: merchantId,
        });
        mockPrisma.$transaction.mockResolvedValue([[], 0]);

        await service.findAll(merchantId, userId, 'outlet-1');

        expect(mockPrisma.transactions.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              outlet_id: 'outlet-1',
            }),
          }),
        );
      });

      it('should throw ForbiddenException when non-owner queries non-assigned outlet', async () => {
        mockPrisma.user_roles.findMany.mockResolvedValue([
          {
            user_id: userId,
            outlet_id: 'outlet-1',
            roles: { name: 'cashier' },
          },
        ]);
        mockPrisma.outlets.findFirst.mockResolvedValue({
          id: 'outlet-2',
          merchant_id: merchantId,
        });

        await expect(
          service.findAll(merchantId, userId, 'outlet-2'),
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('findOne', () => {
      it('should return transaction if it belongs to allowed outlet', async () => {
        mockPrisma.user_roles.findMany.mockResolvedValue([
          {
            user_id: userId,
            outlet_id: 'outlet-1',
            roles: { name: 'cashier' },
          },
        ]);
        mockPrisma.transactions.findFirst.mockResolvedValue({
          id: 'tx-1',
          outlet_id: 'outlet-1',
        });

        const result = await service.findOne('tx-1', merchantId, userId);
        expect(result).toBeDefined();
        expect(mockPrisma.transactions.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              id: 'tx-1',
              outlet_id: { in: ['outlet-1'] },
            }),
          }),
        );
      });

      it('should throw NotFoundException if transaction does not belong to allowed outlet', async () => {
        mockPrisma.user_roles.findMany.mockResolvedValue([
          {
            user_id: userId,
            outlet_id: 'outlet-1',
            roles: { name: 'cashier' },
          },
        ]);
        mockPrisma.transactions.findFirst.mockResolvedValue(null);

        await expect(
          service.findOne('tx-1', merchantId, userId),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });
});
