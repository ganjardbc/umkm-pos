import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CustomerCatalogService } from './customer-catalog.service';
import { PrismaService } from '../database/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('CustomerCatalogService', () => {
  let service: CustomerCatalogService;

  const mockPrisma = {
    outlets: { findFirst: jest.fn() },
    shifts: { findFirst: jest.fn() },
    customer_sessions: { findFirst: jest.fn() },
    transactions: { findFirst: jest.fn() },
    products: { findMany: jest.fn(), count: jest.fn() },
    $transaction: jest.fn((queries: Promise<unknown>[]) =>
      Promise.all(queries),
    ),
  };
  const mockTransactions = {
    createCatalogOrder: jest.fn(),
    addItemsToCatalogOrder: jest.fn(),
  };
  const mockNotifications = { notifyOutletUsers: jest.fn() };

  const session = {
    id: 'sess-1',
    outlet_id: 'outlet-1',
    merchant_id: 'merchant-1',
    customer_name: 'Budi',
    customer_phone: null,
    status: 'active',
    expires_at: new Date(Date.now() + 3600_000),
  };
  const dto = { outlet_id: 'outlet-1', items: [] } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerCatalogService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TransactionsService, useValue: mockTransactions },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();
    service = module.get(CustomerCatalogService);
    jest.clearAllMocks();
    mockPrisma.customer_sessions.findFirst.mockResolvedValue(session);
    mockPrisma.transactions.findFirst.mockResolvedValue(null);
    mockTransactions.createCatalogOrder.mockResolvedValue({
      id: 'tx-1',
      store_tables: null,
    });
  });

  // AC-8
  it('shift off + active outlet: order is created without a shift', async () => {
    mockPrisma.outlets.findFirst.mockResolvedValue({
      id: 'outlet-1',
      shift_required: false,
    });

    await service.createOrder('token', { ...dto, shift_id: 'client-shift' });

    expect(mockPrisma.shifts.findFirst).not.toHaveBeenCalled();
    const arg = mockTransactions.createCatalogOrder.mock.calls[0][0];
    expect(arg.shift_id ?? null).toBeNull();
  });

  // AC-9
  it('shift off + inactive outlet: order is rejected', async () => {
    mockPrisma.outlets.findFirst.mockResolvedValue(null);

    await expect(service.createOrder('token', dto)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPrisma.outlets.findFirst).toHaveBeenCalledWith({
      where: { id: 'outlet-1', is_active: true },
    });
    expect(mockTransactions.createCatalogOrder).not.toHaveBeenCalled();
  });

  // AC-10
  it('shift on + no open shift: order is rejected as before', async () => {
    mockPrisma.outlets.findFirst.mockResolvedValue({
      id: 'outlet-1',
      shift_required: true,
    });
    mockPrisma.shifts.findFirst.mockResolvedValue(null);

    await expect(service.createOrder('token', dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockTransactions.createCatalogOrder).not.toHaveBeenCalled();
  });

  it('shift on + open shift: order carries the shift id', async () => {
    mockPrisma.outlets.findFirst.mockResolvedValue({
      id: 'outlet-1',
      shift_required: true,
    });
    mockPrisma.shifts.findFirst.mockResolvedValue({ id: 'shift-1' });

    await service.createOrder('token', dto);

    expect(mockTransactions.createCatalogOrder.mock.calls[0][0].shift_id).toBe(
      'shift-1',
    );
  });

  it('getShiftStatus includes shift_required', async () => {
    mockPrisma.outlets.findFirst.mockResolvedValue({
      id: 'outlet-1',
      shift_required: false,
    });
    mockPrisma.shifts.findFirst.mockResolvedValue(null);

    await expect(service.getShiftStatus('outlet-1')).resolves.toEqual({
      shift_required: false,
      is_open: false,
      shift_id: null,
      status: 'closed',
    });
  });

  it("listProducts returns each product's option groups with the outlet stock", async () => {
    mockPrisma.outlets.findFirst.mockResolvedValue({
      id: 'outlet-1',
      merchant_id: 'merchant-1',
      shift_required: false,
    });
    const groups = [
      {
        id: 'g-1',
        name: 'Ukuran',
        is_required: true,
        product_options: [{ id: 'o-1', name: 'Large', price_delta: '5000.00' }],
      },
    ];
    mockPrisma.products.findMany.mockResolvedValue([
      {
        id: 'p-1',
        name: 'Kopi',
        outlet_product_inventory: [{ stock_qty: 4, min_stock: 1 }],
        product_option_groups: groups,
      },
      {
        id: 'p-2',
        name: 'Habis',
        outlet_product_inventory: [],
        product_option_groups: [],
      },
    ]);
    mockPrisma.products.count.mockResolvedValue(2);

    const result = await service.listProducts({ outlet_id: 'outlet-1' } as any);

    expect(
      mockPrisma.products.findMany.mock.calls[0][0].include,
    ).toHaveProperty('product_option_groups');
    // out-of-stock products stay hidden; the rest carry their groups for the dialog
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'p-1',
      stock_qty: 4,
      product_option_groups: groups,
    });
  });
});
