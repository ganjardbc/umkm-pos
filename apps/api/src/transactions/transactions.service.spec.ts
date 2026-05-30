import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
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
  });

  describe('create', () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';

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
});
