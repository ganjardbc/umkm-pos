import { BadRequestException } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ShiftsAutoCloseService } from './shifts-auto-close.service';

const makePrisma = () => ({
  outlets: { findFirst: jest.fn(), findMany: jest.fn() },
  shifts: { findMany: jest.fn(), findFirst: jest.fn() },
  shift_cash_entries: { findMany: jest.fn() },
  transactions: { aggregate: jest.fn(), count: jest.fn() },
  shift_participants: { findMany: jest.fn() },
  role_permissions: { count: jest.fn() },
});

describe('cash-out daily limit', () => {
  const call = (prisma: any, amount: number) =>
    (new ShiftsService(prisma) as any).assertWithinCashOutLimit('o1', amount);

  it('does nothing without a limit', async () => {
    const prisma = makePrisma();
    prisma.outlets.findFirst.mockResolvedValue({ cash_out_daily_limit: null });
    await expect(call(prisma, 1e9)).resolves.toBeUndefined();
    expect(prisma.shift_cash_entries.findMany).not.toHaveBeenCalled();
  });

  it('rejects when today total + amount exceeds the limit, and excludes refunds in the query', async () => {
    const prisma = makePrisma();
    prisma.outlets.findFirst.mockResolvedValue({
      cash_out_daily_limit: '100000',
    });
    prisma.shift_cash_entries.findMany.mockResolvedValue([{ amount: '60000' }]);
    await expect(call(prisma, 40000)).resolves.toBeUndefined();
    await expect(call(prisma, 40001)).rejects.toThrow(BadRequestException);
    const where = prisma.shift_cash_entries.findMany.mock.calls[0][0].where;
    expect(where.NOT.reason.startsWith).toBe('Refund #');
  });
});

describe('daily report (blind count)', () => {
  it('hides expected cash and sales of open shifts and totals only closed ones', async () => {
    const prisma = makePrisma();
    prisma.outlets.findFirst.mockResolvedValue({ id: 'o1', name: 'Outlet' });
    const base = {
      shift_owner: { id: 'u', name: 'A' },
      start_time: new Date(),
      end_time: null,
      closed_by_system: false,
    };
    prisma.shifts.findMany.mockResolvedValue([
      {
        ...base,
        id: 's1',
        status: 'closed',
        opening_cash: '100000',
        closing_cash: '150000',
        expected_cash: '150000',
        cash_difference: '0',
      },
      {
        ...base,
        id: 's2',
        status: 'open',
        opening_cash: '50000',
        closing_cash: null,
        expected_cash: null,
        cash_difference: null,
      },
    ]);
    prisma.shift_cash_entries.findMany.mockResolvedValue([]);
    prisma.transactions.aggregate.mockResolvedValue({
      _sum: { total_amount: '50000' },
    });
    prisma.transactions.count.mockResolvedValue(2);

    const r = await new ShiftsService(prisma as any).getDailyReport(
      'o1',
      'm1',
      '2026-11-24',
    );
    const open = r.shifts.find((x) => x.id === 's2')!;
    expect(open.expected_cash).toBeNull();
    expect(open.cash_sales).toBeNull();
    expect(r.open_shifts).toBe(1);
    expect(r.totals.opening_cash).toBe(100000);
    expect(r.totals.cash_sales).toBe(50000);
    expect(prisma.transactions.aggregate).toHaveBeenCalledTimes(1);
  });

  it('rejects a bad date', async () => {
    await expect(
      new ShiftsService(makePrisma() as any).getDailyReport(
        'o1',
        'm1',
        '24-11-2026',
      ),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('auto close', () => {
  it('lastOccurrence picks today after the time and yesterday before it', () => {
    const now = new Date(2026, 10, 24, 12, 0);
    expect(ShiftsAutoCloseService.lastOccurrence('10:30', now)).toEqual(
      new Date(2026, 10, 24, 10, 30),
    );
    expect(ShiftsAutoCloseService.lastOccurrence('23:00', now)).toEqual(
      new Date(2026, 10, 23, 23, 0),
    );
  });

  it('closes open shifts as the system with no counted cash', async () => {
    const prisma = makePrisma();
    prisma.outlets.findMany.mockResolvedValue([
      { id: 'o1', merchant_id: 'm1', auto_close_time: '10:00' },
    ]);
    prisma.shifts.findMany.mockResolvedValue([
      { id: 's1', shift_owner_id: 'u1' },
    ]);
    const closeShift = jest.fn().mockResolvedValue({});
    await new ShiftsAutoCloseService(prisma as any, { closeShift } as any).run(
      new Date(2026, 10, 24, 12, 0),
    );
    expect(closeShift).toHaveBeenCalledWith('s1', 'u1', 'm1', null, true);
    expect(prisma.shifts.findMany.mock.calls[0][0].where.start_time.lt).toEqual(
      new Date(2026, 10, 24, 10, 0),
    );
  });
});

describe('expected cash while open (owner view)', () => {
  const openShift = {
    id: 's1',
    outlet_id: 'o1',
    status: 'open',
    opening_cash: '200000',
    closing_cash: null,
    expected_cash: null,
    cash_difference: null,
    closed_by_system: false,
    outlets: { id: 'o1', name: 'Outlet', slug: 'outlet' },
    shift_owner: { id: 'u1', name: 'A', username: 'a' },
  };

  const setup = (shift: any, canView: boolean) => {
    const prisma: any = makePrisma();
    prisma.outlets.findMany.mockResolvedValue([{ id: 'o1' }]);
    prisma.shifts.findFirst.mockResolvedValue(shift);
    prisma.shift_participants.findMany.mockResolvedValue([]);
    prisma.transactions.count.mockResolvedValue(0);
    prisma.transactions.aggregate.mockResolvedValue({
      _sum: { total_amount: '1180000' },
    });
    prisma.shift_cash_entries.findMany.mockResolvedValue([
      { type: 'in', amount: '50000' },
      { type: 'out', amount: '53000' },
    ]);
    prisma.role_permissions.count.mockResolvedValue(canView ? 1 : 0);
    return prisma;
  };

  it('returns the live value for a holder of shift.view_expected, and keeps expected_cash null', async () => {
    const prisma = setup(openShift, true);
    const r: any = await new ShiftsService(prisma).getShift('s1', 'm1', 'u1');
    expect(r.expected_cash_live).toBe(1377000);
    expect(r.expected_cash).toBeNull();
    const where = prisma.role_permissions.count.mock.calls[0][0].where;
    expect(where.permissions.code).toBe('shift.view_expected');
    expect(where.roles.user_roles.some).toEqual({
      user_id: 'u1',
      outlet_id: 'o1',
    });
  });

  it('hides it from a user without the permission', async () => {
    const prisma = setup(openShift, false);
    const r: any = await new ShiftsService(prisma).getShift('s1', 'm1', 'u2');
    expect(r.expected_cash_live).toBeNull();
    expect(prisma.transactions.aggregate).not.toHaveBeenCalled();
  });

  it('returns null without a viewer id, and for a closed shift', async () => {
    const noViewer = setup(openShift, true);
    expect(
      ((await new ShiftsService(noViewer).getShift('s1', 'm1')) as any)
        .expected_cash_live,
    ).toBeNull();
    const closed = setup({ ...openShift, status: 'closed' }, true);
    expect(
      ((await new ShiftsService(closed).getShift('s1', 'm1', 'u1')) as any)
        .expected_cash_live,
    ).toBeNull();
  });
});
