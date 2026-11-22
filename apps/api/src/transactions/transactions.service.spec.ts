import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../database/prisma.service';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { PayTransactionDto } from './dto/pay-transaction.dto';
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
    role_permissions: {
      count: jest.fn(),
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
    isShiftRequired: jest.fn(),
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
    mockShiftsService.isShiftRequired.mockResolvedValue(true);
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

    beforeEach(() => {
      // these tests cover inventory, not shifts
      mockShiftsService.isShiftRequired.mockResolvedValue(false);
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

        expect(tx.transactions.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              is_cancelled: true,
              cancel_reason: 'salah input',
            }),
          }),
        );
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

      const result = await service.cancel(
        'tx-1',
        merchantId,
        userId,
        '  salah input ',
      );
      expect(result).toBeDefined();
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('discount', () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';

    const setup = (canDiscount = true) => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });
      mockPrisma.products.findMany.mockResolvedValue([
        { id: 'product-1', name: 'P', price: 10000, is_active: true },
      ]);
      mockPrisma.outlet_product_inventory.findMany.mockResolvedValue([
        { outlet_id: 'outlet-1', product_id: 'product-1', stock_qty: 10 },
      ]);
      mockShiftsService.isShiftRequired.mockResolvedValue(false);
      mockPrisma.role_permissions.count.mockResolvedValue(canDiscount ? 1 : 0);
      const created: any[] = [];
      mockPrisma.$transaction.mockImplementation(async (cb: any) =>
        cb({
          transactions: {
            create: jest.fn(async ({ data }) => {
              created.push(data);
              return { id: 'tx-1' };
            }),
          },
          transaction_items: { createMany: jest.fn() },
          outlet_product_inventory: { update: jest.fn() },
          inventory_movements: { create: jest.fn() },
        }),
      );
      mockPrisma.transactions.findFirst.mockResolvedValue({ id: 'tx-1' });
      return created;
    };

    const create = (extra: any) =>
      service.create(
        {
          outlet_id: 'outlet-1',
          payment_method: 'cash',
          cash_received: 9000,
          change_amount: 0,
          items: [{ product_id: 'product-1', qty: 1 }],
          ...extra,
        } as any,
        merchantId,
        userId,
      );

    it('stores a percent discount and charges the net total', async () => {
      const created = setup();
      await create({ discount_type: 'percent', discount_value: 10 });
      expect(created[0]).toMatchObject({
        total_amount: 9000,
        discount_type: 'percent',
        discount_value: 10,
        discount_amount: 1000,
      });
    });

    it('stores a fixed amount discount', async () => {
      const created = setup();
      await create({ discount_type: 'amount', discount_value: 1000 });
      expect(created[0]).toMatchObject({
        total_amount: 9000,
        discount_amount: 1000,
      });
    });

    it('rejects cash that only covers the pre-discount shortfall', async () => {
      setup();
      await expect(
        create({
          discount_type: 'amount',
          discount_value: 1000,
          cash_received: 8000,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a discount larger than the subtotal', async () => {
      setup();
      await expect(
        create({ discount_type: 'amount', discount_value: 10001 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a percent above 100', async () => {
      setup();
      await expect(
        create({ discount_type: 'percent', discount_value: 101 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a type without a value', async () => {
      setup();
      await expect(create({ discount_type: 'percent' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects a discount from a role without transaction.discount', async () => {
      setup(false);
      await expect(
        create({ discount_type: 'percent', discount_value: 10 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects a discount on a pay-later order', async () => {
      setup();
      await expect(
        create({
          pay_now: false,
          discount_type: 'percent',
          discount_value: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('no discount keeps the old behaviour and skips the permission check', async () => {
      const created = setup(false);
      await create({ cash_received: 10000 });
      expect(created[0]).toMatchObject({
        total_amount: 10000,
        discount_type: null,
        discount_amount: 0,
      });
      expect(mockPrisma.role_permissions.count).not.toHaveBeenCalled();
    });
  });

  describe('shift cash tracking (paid_shift_id)', () => {
    const merchantId = 'merchant-1';
    const userId = 'user-1';

    const setup = (shiftOk = true, participant = true) => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: merchantId,
      });
      mockPrisma.products.findMany.mockResolvedValue([
        {
          id: 'product-1',
          merchant_id: merchantId,
          name: 'P',
          price: 10000,
          stock_qty: 100,
          is_active: true,
        },
      ]);
      mockPrisma.outlet_product_inventory.findMany.mockResolvedValue([
        {
          outlet_id: 'outlet-1',
          product_id: 'product-1',
          stock_qty: 10,
          is_active: true,
        },
      ]);
      if (shiftOk)
        mockShiftsService.validateShiftOpen.mockResolvedValue(undefined);
      else
        mockShiftsService.validateShiftOpen.mockRejectedValue(
          new BadRequestException('Shift is not available for transactions'),
        );
      mockShiftsService.isActiveParticipant.mockResolvedValue(participant);
      const created: any[] = [];
      const updated: any[] = [];
      mockPrisma.$transaction.mockImplementation(async (cb: any) =>
        cb({
          transactions: {
            create: jest.fn(async ({ data }) => {
              created.push(data);
              return { id: 'tx-1' };
            }),
            update: jest.fn(async ({ data }) => {
              updated.push(data);
              return { id: 'tx-1' };
            }),
          },
          transaction_items: { createMany: jest.fn() },
          outlet_product_inventory: { update: jest.fn() },
          inventory_movements: { create: jest.fn() },
        }),
      );
      mockPrisma.transactions.findFirst.mockResolvedValue({
        id: 'tx-1',
        outlet_id: 'outlet-1',
        is_cancelled: false,
        payment_method: 'pending',
        shift_id: 'shift-A',
        transaction_items: [{ product_id: 'product-1', qty: 1 }],
      });
      return { created, updated };
    };

    const create = (pay_now: boolean) =>
      service.create(
        {
          outlet_id: 'outlet-1',
          shift_id: 'shift-A',
          payment_method: 'cash',
          pay_now,
          cash_received: 10000,
          change_amount: 0,
          items: [{ product_id: 'product-1', qty: 1 }],
        } as any,
        merchantId,
        userId,
      );

    const pay = (dto: any) =>
      service.payTransaction(
        'tx-1',
        { cash_received: 10000, change_amount: 0, ...dto },
        merchantId,
        userId,
      );

    // AC-6, AC-7
    it('direct payment sets paid_shift_id to the creating shift', async () => {
      const { created } = setup();
      await create(true);
      expect(created[0].shift_id).toBe('shift-A');
      expect(created[0].paid_shift_id).toBe('shift-A');
    });

    it('pay-later order leaves paid_shift_id empty', async () => {
      const { created } = setup();
      await create(false);
      expect(created[0].shift_id).toBe('shift-A');
      expect(created[0].paid_shift_id).toBeNull();
    });

    // AC-7
    it('pay-later created in shift A paid cash in shift B goes to paid_shift_id B only', async () => {
      const { updated } = setup();
      await pay({ payment_method: 'cash', shift_id: 'shift-B' });
      expect(mockShiftsService.validateShiftOpen).toHaveBeenCalledWith(
        'shift-B',
      );
      expect(updated[0].paid_shift_id).toBe('shift-B');
      expect(updated[0]).not.toHaveProperty('shift_id');
    });

    // AC-8
    it('non-cash payment without shift_id is allowed and sets no paid shift', async () => {
      const { updated } = setup();
      await service.payTransaction(
        'tx-1',
        { payment_method: 'qris' },
        merchantId,
        userId,
      );
      expect(updated[0].payment_method).toBe('qris');
      expect(updated[0].paid_shift_id).toBeNull();
    });

    // AC-9
    it('rejects cash payment without shift_id', async () => {
      const { updated } = setup();
      await expect(pay({ payment_method: 'cash' })).rejects.toThrow(
        BadRequestException,
      );
      expect(updated).toHaveLength(0);
    });

    it('rejects cash payment when shift is not open', async () => {
      const { updated } = setup(false);
      await expect(
        pay({ payment_method: 'cash', shift_id: 'shift-B' }),
      ).rejects.toThrow(BadRequestException);
      expect(updated).toHaveLength(0);
    });

    it('rejects cash payment by a non-participant', async () => {
      const { updated } = setup(true, false);
      await expect(
        pay({ payment_method: 'cash', shift_id: 'shift-B' }),
      ).rejects.toThrow(ForbiddenException);
      expect(updated).toHaveLength(0);
    });

    // AC-5, AC-14
    it('shift off: POS sale without shift_id is saved with null shift and stock decremented', async () => {
      const { created } = setup();
      mockShiftsService.isShiftRequired.mockResolvedValue(false);
      await service.create(
        {
          outlet_id: 'outlet-1',
          payment_method: 'cash',
          cash_received: 10000,
          change_amount: 0,
          items: [{ product_id: 'product-1', qty: 1 }],
        } as any,
        merchantId,
        userId,
      );
      expect(created[0].shift_id).toBeNull();
      expect(created[0].paid_shift_id).toBeNull();
      expect(mockShiftsService.validateShiftOpen).not.toHaveBeenCalled();
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('shift off: a client-sent shift_id is ignored and stored null', async () => {
      const { created } = setup();
      mockShiftsService.isShiftRequired.mockResolvedValue(false);
      await create(true);
      expect(created[0].shift_id).toBeNull();
      expect(created[0].paid_shift_id).toBeNull();
      expect(mockShiftsService.validateShiftOpen).not.toHaveBeenCalled();
    });

    // AC-6
    it('shift on: POS sale without shift_id is rejected with 400, no transaction, no stock change', async () => {
      const { created } = setup();
      await expect(
        service.create(
          {
            outlet_id: 'outlet-1',
            payment_method: 'cash',
            cash_received: 10000,
            change_amount: 0,
            items: [{ product_id: 'product-1', qty: 1 }],
          } as any,
          merchantId,
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(created).toHaveLength(0);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    // AC-7
    it('shift off: pay-later cash payment without shift is accepted with empty paid_shift_id', async () => {
      const { updated } = setup();
      mockShiftsService.isShiftRequired.mockResolvedValue(false);
      await pay({ payment_method: 'cash' });
      expect(updated[0].payment_method).toBe('cash');
      expect(updated[0].paid_shift_id).toBeNull();
      expect(mockShiftsService.validateShiftOpen).not.toHaveBeenCalled();
    });

    it('DTO requires a UUID shift_id when present (presence for cash is enforced by the service)', async () => {
      const pipe = new ValidationPipe();
      const v = (b: any) =>
        pipe.transform(b, { type: 'body', metatype: PayTransactionDto });
      await expect(
        v({ payment_method: 'cash', shift_id: 'not-a-uuid' }),
      ).rejects.toThrow(BadRequestException);
      await expect(v({ payment_method: 'qris' })).resolves.toBeDefined();
      await expect(
        v({
          payment_method: 'cash',
          shift_id: '550e8400-e29b-41d4-a716-446655440021',
        }),
      ).resolves.toBeDefined();
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

      it('should include search OR condition when search parameter is provided', async () => {
        mockPrisma.user_roles.findMany.mockResolvedValue([
          {
            user_id: userId,
            outlet_id: 'outlet-1',
            roles: { name: 'owner' },
          },
        ]);
        mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
        mockPrisma.$transaction.mockResolvedValue([[], 0]);

        await service.findAll(
          merchantId,
          userId,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          'TRX-123',
        );

        expect(mockPrisma.transactions.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: [
                { id: { contains: 'TRX-123' } },
                { customer_name_snapshot: { contains: 'TRX-123' } },
              ],
            }),
          }),
        );
        expect(mockPrisma.transactions.count).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: [
                { id: { contains: 'TRX-123' } },
                { customer_name_snapshot: { contains: 'TRX-123' } },
              ],
            }),
          }),
        );
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
