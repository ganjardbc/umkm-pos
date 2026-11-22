import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CustomersService, normalizePhone } from './customers.service';
import { PrismaService } from '../database/prisma.service';

describe('normalizePhone', () => {
  it.each([
    ['0812-3456-7890', '6281234567890'],
    ['+62 812 3456 7890', '6281234567890'],
    ['81234567890', '6281234567890'],
    ['6281234567890', '6281234567890'],
  ])('%s -> %s', (raw, expected) => {
    expect(normalizePhone(raw)).toBe(expected);
  });

  it('treats blank as no phone and rejects junk', () => {
    expect(normalizePhone(undefined)).toBeNull();
    expect(normalizePhone('  ')).toBeNull();
    expect(() => normalizePhone('12345')).toThrow(BadRequestException);
    expect(() => normalizePhone('abc')).toThrow(BadRequestException);
  });
});

describe('CustomersService', () => {
  let service: CustomersService;
  const merchantId = 'merchant-1';
  const userId = 'user-1';
  const mockPrisma = {
    customers: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transactions: { aggregate: jest.fn(), findMany: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(CustomersService);
    jest.resetAllMocks();
  });

  it('creates a customer with a normalised phone', async () => {
    mockPrisma.customers.findFirst.mockResolvedValue(null);
    mockPrisma.customers.create.mockResolvedValue({ id: 'c-1' });
    await service.create(
      { name: ' Bu Sari ', phone: '0812-3456-7890', note: '  ' },
      merchantId,
      userId,
    );
    expect(mockPrisma.customers.create.mock.calls[0][0].data).toMatchObject({
      merchant_id: merchantId,
      name: 'Bu Sari',
      phone: '6281234567890',
      note: null,
    });
  });

  it('rejects a phone that already belongs to another customer', async () => {
    mockPrisma.customers.findFirst.mockResolvedValue({
      id: 'c-9',
      name: 'Pak Budi',
    });
    await expect(
      service.create(
        { name: 'X', phone: '0812-3456-7890' },
        merchantId,
        userId,
      ),
    ).rejects.toThrow(ConflictException);
    expect(mockPrisma.customers.create).not.toHaveBeenCalled();
  });

  it('lets a customer keep their own phone on update', async () => {
    mockPrisma.customers.findFirst
      .mockResolvedValueOnce({ id: 'c-1' }) // findOne
      .mockResolvedValueOnce({ id: 'c-1', name: 'Bu Sari' }); // phone clash is itself
    mockPrisma.transactions.aggregate.mockResolvedValue({
      _count: { _all: 0 },
      _sum: {},
      _max: {},
    });
    mockPrisma.transactions.findMany.mockResolvedValue([]);
    mockPrisma.customers.update.mockResolvedValue({ id: 'c-1' });
    await service.update(
      'c-1',
      { phone: '0812-3456-7890' },
      merchantId,
      userId,
    );
    expect(mockPrisma.customers.update).toHaveBeenCalled();
  });

  it('returns lifetime stats and recent visits', async () => {
    mockPrisma.customers.findFirst.mockResolvedValue({
      id: 'c-1',
      name: 'Bu Sari',
    });
    mockPrisma.transactions.aggregate.mockResolvedValue({
      _count: { _all: 3 },
      _sum: { total_amount: '120000' },
      _max: { created_at: new Date('2026-11-01') },
    });
    mockPrisma.transactions.findMany.mockResolvedValue([{ id: 't-1' }]);
    const result = await service.findOne('c-1', merchantId);
    expect(result.stats).toEqual({
      transaction_count: 3,
      total_spent: '120000',
      last_visit: new Date('2026-11-01'),
    });
    expect(result.recent_transactions).toHaveLength(1);
    // cancelled sales do not count towards lifetime spend
    expect(mockPrisma.transactions.aggregate.mock.calls[0][0].where).toEqual({
      customer_id: 'c-1',
      is_cancelled: false,
    });
  });

  it("is merchant-scoped: another merchant's customer is not found", async () => {
    mockPrisma.customers.findFirst.mockResolvedValue(null);
    await expect(service.findOne('c-1', merchantId)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPrisma.customers.findFirst.mock.calls[0][0].where).toEqual({
      id: 'c-1',
      merchant_id: merchantId,
    });
  });
});
