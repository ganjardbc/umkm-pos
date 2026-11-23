import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsService } from './shifts.service';
import { PrismaService } from '../database/prisma.service';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { CreateShiftDto } from './dto/create-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { AddCashEntryDto } from './dto/add-cash-entry.dto';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

describe('ShiftsService', () => {
  let service: ShiftsService;
  let prisma: PrismaService;

  const mockPrisma = {
    outlets: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    shifts: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    shift_participants: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    shift_audit_logs: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    shift_cash_entries: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    transactions: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    users: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((callback) => {
      if (typeof callback === 'function') {
        return callback(mockPrisma);
      }
      return Promise.resolve(callback);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ShiftsService>(ShiftsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
    mockPrisma.shift_cash_entries.findMany.mockResolvedValue([]);
  });

  describe('openShift', () => {
    it('should open a new shift with owner and initial participant', async () => {
      const outletId = 'outlet-1';
      const userId = 'user-1';
      const merchantId = 'merchant-1';

      mockPrisma.outlets.findFirst.mockResolvedValue({ id: outletId });
      mockPrisma.shifts.findFirst.mockResolvedValue(null);

      // Mock the transaction to return the created shift
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const result = await callback(mockPrisma);
        return result;
      });

      const createdShift = {
        id: 'shift-1',
        outlet_id: outletId,
        shift_owner_id: userId,
        status: 'open',
        start_time: new Date(),
        end_time: null,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: userId,
        updated_by: userId,
      };

      mockPrisma.shifts.create.mockResolvedValue(createdShift);
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: outletId }]);

      // Mock findFirst to return the created shift when called from getShift
      mockPrisma.shifts.findFirst.mockImplementation(async (args) => {
        if (args.where.id === 'shift-1') {
          return {
            ...createdShift,
            outlets: { id: outletId, name: 'Outlet 1', slug: 'outlet-1' },
            shift_owner: {
              id: userId,
              name: 'Test User',
              username: 'testuser',
            },
          };
        }
        return null;
      });

      mockPrisma.shift_participants.findMany.mockResolvedValue([
        {
          id: 'participant-1',
          shift_id: 'shift-1',
          user_id: userId,
          is_owner: true,
          participant_added_at: new Date(),
          participant_removed_at: null,
          users: { id: userId, name: 'Test User', username: 'testuser' },
        },
      ]);
      mockPrisma.transactions.count.mockResolvedValue(0);

      const result = await service.openShift(
        outletId,
        userId,
        merchantId,
        50000,
      );

      expect(result).toBeDefined();
      expect(result.shift_owner_id).toBe(userId);
      expect(result.participants).toHaveLength(1);
      expect(result.participants[0].is_owner).toBe(true);
    });

    it('should throw NotFoundException if outlet not found', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue(null);

      await expect(
        service.openShift('invalid-outlet', 'user-1', 'merchant-1', 0),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user already has open shift', async () => {
      const outletId = 'outlet-1';
      const userId = 'user-1';
      const merchantId = 'merchant-1';

      mockPrisma.outlets.findFirst.mockResolvedValue({ id: outletId });
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'existing-shift',
        outlet_id: outletId,
        shift_owner_id: userId,
        status: 'open',
      });

      await expect(
        service.openShift(outletId, userId, merchantId, 0),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('shift_required setting', () => {
    it('openShift rejects with 400 when setting is off and creates nothing (AC-19)', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        shift_required: false,
      });

      const promise = service.openShift('outlet-1', 'user-1', 'merchant-1', 0);

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow(/buka\/tutup kasir/i);
      expect(mockPrisma.shifts.create).not.toHaveBeenCalled();
    });

    it('isShiftRequired returns the outlet value scoped by merchant', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({ shift_required: false });

      await expect(
        service.isShiftRequired('outlet-1', 'merchant-1'),
      ).resolves.toBe(false);
      expect(mockPrisma.outlets.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'outlet-1', merchant_id: 'merchant-1' },
        }),
      );
    });

    it('isShiftRequired rejects an outlet of another merchant', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue(null);

      await expect(
        service.isShiftRequired('outlet-1', 'merchant-2'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getShift', () => {
    it('should return shift with participants and transaction counts', async () => {
      const shiftId = 'shift-1';
      const merchantId = 'merchant-1';

      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: shiftId,
        outlet_id: 'outlet-1',
        shift_owner_id: 'user-1',
        status: 'open',
        start_time: new Date(),
        end_time: null,
        outlets: { id: 'outlet-1', name: 'Outlet 1', slug: 'outlet-1' },
        shift_owner: { id: 'user-1', name: 'User 1', username: 'user1' },
      });
      mockPrisma.shift_participants.findMany.mockResolvedValue([
        {
          id: 'participant-1',
          shift_id: shiftId,
          user_id: 'user-1',
          is_owner: true,
          participant_added_at: new Date(),
          participant_removed_at: null,
          users: { id: 'user-1', name: 'User 1', username: 'user1' },
        },
      ]);
      mockPrisma.transactions.count.mockResolvedValue(5);

      const result = await service.getShift(shiftId, merchantId);

      expect(result).toBeDefined();
      expect(result.id).toBe(shiftId);
      expect(result.participants).toHaveLength(1);
      expect(result.total_transactions).toBe(5);
    });

    it('should throw NotFoundException if shift not found', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue(null);

      await expect(
        service.getShift('invalid-shift', 'merchant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('closeShift', () => {
    it('should close shift and mark all participants as removed', async () => {
      const shiftId = 'shift-1';
      const userId = 'user-1';
      const merchantId = 'merchant-1';

      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: shiftId,
        outlet_id: 'outlet-1',
        shift_owner_id: userId,
        status: 'open',
      });

      mockPrisma.transactions.aggregate.mockResolvedValue({
        _sum: { total_amount: null },
      });

      await service.closeShift(shiftId, userId, merchantId, 0);

      expect(mockPrisma.shifts.update).toHaveBeenCalled();
      expect(mockPrisma.shift_participants.updateMany).toHaveBeenCalled();
      expect(mockPrisma.shift_audit_logs.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if shift already closed', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
        status: 'closed',
      });

      await expect(
        service.closeShift('shift-1', 'user-1', 'merchant-1', 0),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if shift not found', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue(null);

      await expect(
        service.closeShift('invalid-shift', 'user-1', 'merchant-1', 0),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should find all shifts with merchant scoping and optional search', async () => {
      const merchantId = 'merchant-1';
      mockPrisma.outlets.findMany.mockResolvedValue([
        { id: 'outlet-1' },
        { id: 'outlet-2' },
      ]);

      const shiftsData = [
        {
          id: 'shift-1',
          outlet_id: 'outlet-1',
          shift_owner_id: 'user-1',
          status: 'open',
          start_time: new Date(),
          end_time: null,
          outlets: { id: 'outlet-1', name: 'Outlet 1', slug: 'outlet-1' },
          shift_owner: { id: 'user-1', name: 'Budi', username: 'budi' },
        },
      ];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        if (Array.isArray(callback)) {
          return Promise.all(callback);
        }
        return callback(mockPrisma);
      });

      mockPrisma.shifts.findMany.mockResolvedValue(shiftsData);
      mockPrisma.shifts.count.mockResolvedValue(1);

      const result = await service.findAll(
        merchantId,
        undefined,
        undefined,
        'Budi',
      );

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockPrisma.shifts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            shift_owner: {
              name: {
                contains: 'Budi',
              },
            },
          }),
        }),
      );
    });
  });

  describe('queryShifts', () => {
    it('should query shifts with filters and pagination', async () => {
      const merchantId = 'merchant-1';

      mockPrisma.outlets.findMany.mockResolvedValue([
        { id: 'outlet-1' },
        { id: 'outlet-2' },
      ]);

      const shiftsData = [
        {
          id: 'shift-1',
          outlet_id: 'outlet-1',
          shift_owner_id: 'user-1',
          status: 'open',
          start_time: new Date(),
          end_time: null,
          outlets: { id: 'outlet-1', name: 'Outlet 1', slug: 'outlet-1' },
          shift_owner: { id: 'user-1', name: 'User 1', username: 'user1' },
        },
      ];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        if (Array.isArray(callback)) {
          // Handle array of promises
          return Promise.all(callback);
        }
        return callback(mockPrisma);
      });

      mockPrisma.shifts.findMany.mockResolvedValue(shiftsData);
      mockPrisma.shifts.count.mockResolvedValue(1);
      mockPrisma.shift_participants.count.mockResolvedValue(1);
      mockPrisma.transactions.count.mockResolvedValue(3);

      const result = await service.queryShifts(merchantId, {
        limit: 10,
        offset: 0,
      });

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply search relation filter when search parameter is provided', async () => {
      const merchantId = 'merchant-1';

      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        if (Array.isArray(callback)) {
          return Promise.all(callback);
        }
        return callback(mockPrisma);
      });

      mockPrisma.shifts.findMany.mockResolvedValue([]);
      mockPrisma.shifts.count.mockResolvedValue(0);

      await service.queryShifts(merchantId, {
        search: 'Budi',
      });

      expect(mockPrisma.shifts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            shift_owner: {
              name: {
                contains: 'Budi',
              },
            },
          }),
        }),
      );
    });

    it('should throw NotFoundException if outlet filter is invalid', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue(null);

      await expect(
        service.queryShifts('merchant-1', { outlet_id: 'invalid-outlet' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getShiftParticipants', () => {
    it('should return participants ordered by added_at', async () => {
      const shiftId = 'shift-1';
      const merchantId = 'merchant-1';

      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: shiftId,
        outlet_id: 'outlet-1',
      });
      mockPrisma.shift_participants.findMany.mockResolvedValue([
        {
          id: 'participant-1',
          shift_id: shiftId,
          user_id: 'user-1',
          is_owner: true,
          participant_added_at: new Date('2024-01-01'),
          participant_removed_at: null,
          users: { id: 'user-1', name: 'User 1', username: 'user1' },
        },
        {
          id: 'participant-2',
          shift_id: shiftId,
          user_id: 'user-2',
          is_owner: false,
          participant_added_at: new Date('2024-01-02'),
          participant_removed_at: null,
          users: { id: 'user-2', name: 'User 2', username: 'user2' },
        },
      ]);
      mockPrisma.transactions.count.mockResolvedValue(2);

      const result = await service.getShiftParticipants(shiftId, merchantId);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.data[0].user_id).toBe('user-1');
      expect(result.data[1].user_id).toBe('user-2');
    });

    it('should throw NotFoundException if shift not found', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue(null);

      await expect(
        service.getShiftParticipants('invalid-shift', 'merchant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addParticipant', () => {
    it('should add a participant to an open shift', async () => {
      const shiftId = 'shift-1';
      const userId = 'user-2';
      const merchantId = 'merchant-1';

      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: shiftId,
        outlet_id: 'outlet-1',
        status: 'open',
      });
      mockPrisma.users.findFirst.mockResolvedValue({
        id: userId,
        merchant_id: merchantId,
        name: 'User 2',
      });

      // Mock shift_participants.findFirst to return null first (checking if exists), then return the participant
      let callCount = 0;
      mockPrisma.shift_participants.findFirst.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          // First call checks if participant exists
          return null;
        }
        // Second call retrieves the created participant
        return {
          id: 'participant-2',
          shift_id: shiftId,
          user_id: userId,
          is_owner: false,
          participant_added_at: new Date(),
          participant_removed_at: null,
          users: { id: userId, name: 'User 2', username: 'user2' },
        };
      });

      mockPrisma.transactions.count.mockResolvedValue(0);

      const result = await service.addParticipant(shiftId, userId, merchantId);

      expect(result).toBeDefined();
      expect(result.user_id).toBe(userId);
      expect(result.is_owner).toBe(false);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if shift is closed', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
        status: 'closed',
      });

      await expect(
        service.addParticipant('shift-1', 'user-2', 'merchant-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user already a participant', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
        status: 'open',
      });
      mockPrisma.users.findFirst.mockResolvedValue({
        id: 'user-2',
        merchant_id: 'merchant-1',
      });
      mockPrisma.shift_participants.findFirst.mockResolvedValue({
        id: 'participant-2',
        shift_id: 'shift-1',
        user_id: 'user-2',
      });

      await expect(
        service.addParticipant('shift-1', 'user-2', 'merchant-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('removeParticipant', () => {
    it('should remove a participant from a shift', async () => {
      const shiftId = 'shift-1';
      const userId = 'user-2';
      const merchantId = 'merchant-1';

      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: shiftId,
        outlet_id: 'outlet-1',
      });
      mockPrisma.shift_participants.findFirst.mockResolvedValue({
        id: 'participant-2',
        shift_id: shiftId,
        user_id: userId,
      });
      mockPrisma.shift_participants.count.mockResolvedValue(2);

      const result = await service.removeParticipant(
        shiftId,
        userId,
        merchantId,
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if last participant', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
      });
      mockPrisma.shift_participants.findFirst.mockResolvedValue({
        id: 'participant-1',
        shift_id: 'shift-1',
        user_id: 'user-1',
      });
      mockPrisma.shift_participants.count.mockResolvedValue(1);

      await expect(
        service.removeParticipant('shift-1', 'user-1', 'merchant-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if participant not found', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
      });
      mockPrisma.shift_participants.findFirst.mockResolvedValue(null);

      await expect(
        service.removeParticipant('shift-1', 'user-2', 'merchant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('handoffShift', () => {
    it('should handoff shift to another participant', async () => {
      const shiftId = 'shift-1';
      const targetUserId = 'user-2';
      const merchantId = 'merchant-1';

      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: shiftId,
        outlet_id: 'outlet-1',
        shift_owner_id: 'user-1',
        status: 'open',
      });
      mockPrisma.shift_participants.findFirst.mockResolvedValue({
        id: 'participant-2',
        shift_id: shiftId,
        user_id: targetUserId,
        participant_removed_at: null,
      });

      await service.handoffShift(shiftId, targetUserId, false, merchantId);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if target not participant', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
        status: 'open',
      });
      mockPrisma.shift_participants.findFirst.mockResolvedValue(null);

      await expect(
        service.handoffShift('shift-1', 'user-3', false, 'merchant-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if shift is closed', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
        status: 'closed',
      });

      await expect(
        service.handoffShift('shift-1', 'user-2', false, 'merchant-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cash (kas awal / kas akhir)', () => {
    const pipe = new ValidationPipe();
    const OUTLET = '550e8400-e29b-41d4-a716-446655440021';
    const validate = (cls: any, body: any) =>
      pipe.transform(body, { type: 'body', metatype: cls });

    // AC-1
    it('stores opening_cash when opening a shift', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue({ id: 'outlet-1' });
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));
      const created = {
        id: 'shift-1',
        outlet_id: 'outlet-1',
        opening_cash: 50000,
        closing_cash: null,
        expected_cash: null,
        cash_difference: null,
      };
      mockPrisma.shifts.create.mockResolvedValue(created);
      mockPrisma.shifts.findFirst.mockImplementation(async (args) =>
        args.where.id === 'shift-1' ? { ...created, status: 'open' } : null,
      );
      mockPrisma.shift_participants.findMany.mockResolvedValue([]);
      mockPrisma.transactions.count.mockResolvedValue(0);

      const result = await service.openShift(
        'outlet-1',
        'user-1',
        'm-1',
        50000,
      );

      expect(mockPrisma.shifts.create.mock.calls[0][0].data.opening_cash).toBe(
        50000,
      );
      expect(result.opening_cash).toBe(50000);
      expect(result.expected_cash).toBeNull();
    });

    it('accepts opening_cash 0', async () => {
      await expect(
        validate(CreateShiftDto, { outlet_id: OUTLET, opening_cash: 0 }),
      ).resolves.toBeDefined();
    });

    // AC-2
    it.each([-1, 'abc', 1.234, null])(
      'rejects invalid opening_cash %p with 400',
      async (v) => {
        await expect(
          validate(CreateShiftDto, { outlet_id: OUTLET, opening_cash: v }),
        ).rejects.toThrow(BadRequestException);
        expect(mockPrisma.shifts.create).not.toHaveBeenCalled();
      },
    );

    // AC-3
    it('rejects missing opening_cash with 400', async () => {
      await expect(
        validate(CreateShiftDto, { outlet_id: OUTLET }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.shifts.create).not.toHaveBeenCalled();
    });

    // AC-5
    it.each([undefined, -5, 'x'])(
      'rejects invalid closing_cash %p with 400',
      async (v) => {
        await expect(
          validate(CloseShiftDto, { closing_cash: v }),
        ).rejects.toThrow(BadRequestException);
        expect(mockPrisma.shifts.update).not.toHaveBeenCalled();
      },
    );

    const setupClose = (opening: number | null, cashSum: number | null) => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
        status: 'open',
        opening_cash: opening,
        outlets: {},
        shift_owner: {},
      });
      mockPrisma.transactions.aggregate.mockResolvedValue({
        _sum: { total_amount: cashSum },
      });
      mockPrisma.shift_participants.findMany.mockResolvedValue([]);
      mockPrisma.transactions.count.mockResolvedValue(0);
    };

    // AC-4, AC-10
    it.each([
      [150000, 10000, 40000, 50000, 0],
      [150000, 10000, 40000, 40000, -10000],
      [150000, 10000, 40000, 60000, 10000],
    ])(
      'closes shift: expected and difference snapshot (%#)',
      async (_e, opening, sales, closing, diff) => {
        setupClose(opening, sales);

        await service.closeShift('shift-1', 'user-1', 'm-1', closing);

        const calls = mockPrisma.shifts.update.mock.calls.map((c) => c[0].data);
        expect(calls[0].status).toBe('closed');
        const snap = calls[1];
        expect(snap.closing_cash).toBe(closing);
        expect(Number(snap.expected_cash)).toBe(opening + sales);
        expect(Number(snap.cash_difference)).toBe(diff);
        expect(
          mockPrisma.transactions.aggregate.mock.calls[0][0].where,
        ).toEqual({
          paid_shift_id: 'shift-1',
          payment_method: 'cash',
          is_cancelled: false,
        });
      },
    );

    // AC-11
    it('does not change cash when closing an already closed shift', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
        status: 'closed',
      });

      await expect(
        service.closeShift('shift-1', 'user-1', 'm-1', 1),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.shifts.update).not.toHaveBeenCalled();
    });
  });

  describe('cash entries (kas masuk/keluar)', () => {
    const pipe = new ValidationPipe();
    const validate = (body: any) =>
      pipe.transform(body, { type: 'body', metatype: AddCashEntryDto });
    const dto = { type: 'out', amount: 25000, reason: 'Beli es' } as const;

    const setup = (
      over: {
        status?: string;
        shiftRequired?: boolean;
        participant?: boolean;
        found?: boolean;
      } = {},
    ) => {
      const {
        status = 'open',
        shiftRequired = true,
        participant = true,
      } = over;
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue(
        over.found === false
          ? null
          : { id: 'shift-1', outlet_id: 'outlet-1', status },
      );
      mockPrisma.outlets.findFirst.mockResolvedValue({
        shift_required: shiftRequired,
      });
      mockPrisma.shift_participants.findFirst.mockResolvedValue(
        participant ? { id: 'p1' } : null,
      );
      mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));
      mockPrisma.shift_cash_entries.create.mockResolvedValue({
        id: 'e1',
        shift_id: 'shift-1',
        type: 'out',
        amount: 25000,
        reason: 'Beli es',
        created_by: 'user-1',
        created_at: new Date(),
        users: { name: 'Kasir' },
      });
    };

    it('AC-1 records in/out entry for active participant', async () => {
      setup();
      const r = await service.addCashEntry('shift-1', 'user-1', 'm-1', dto);
      expect(
        mockPrisma.shift_cash_entries.create.mock.calls[0][0].data,
      ).toEqual({
        shift_id: 'shift-1',
        type: 'out',
        amount: 25000,
        reason: 'Beli es',
        reason_code: null,
        created_by: 'user-1',
      });
      expect(r.created_by_name).toBe('Kasir');
      await service.addCashEntry('shift-1', 'user-1', 'm-1', {
        ...dto,
        type: 'in',
      });
      expect(
        mockPrisma.shift_cash_entries.create.mock.calls[1][0].data.type,
      ).toBe('in');
    });

    it.each([
      [{ ...dto, amount: 0 }],
      [{ ...dto, amount: -1 }],
      [{ ...dto, amount: 'abc' }],
      [{ ...dto, amount: 1.234 }],
      [{ ...dto, amount: 1000000000000 }],
      [{ ...dto, reason: '' }],
      [{ ...dto, reason: '   ' }],
      [{ ...dto, reason: 'x'.repeat(256) }],
      [{ ...dto, type: 'other' }],
    ])('AC-2 rejects invalid amount/reason via DTO %#', async (body) => {
      await expect(validate(body)).rejects.toThrow(BadRequestException);
      expect(mockPrisma.shift_cash_entries.create).not.toHaveBeenCalled();
    });

    it('AC-2 accepts valid body and trims reason', async () => {
      const r: any = await validate({ ...dto, reason: '  Beli es  ' });
      expect(r.reason).toBe('Beli es');
    });

    it('AC-3 rejects closed shift', async () => {
      setup({ status: 'closed' });
      await expect(
        service.addCashEntry('shift-1', 'user-1', 'm-1', dto),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.shift_cash_entries.create).not.toHaveBeenCalled();
    });

    it('AC-4 rejects non-participant (403, no create)', async () => {
      setup({ participant: false });
      await expect(
        service.addCashEntry('shift-1', 'user-1', 'm-1', dto),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.shift_cash_entries.create).not.toHaveBeenCalled();
    });

    it('AC-7 rejects when shift_required is false', async () => {
      setup({ shiftRequired: false });
      await expect(
        service.addCashEntry('shift-1', 'user-1', 'm-1', dto),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.shift_cash_entries.create).not.toHaveBeenCalled();
    });

    it('AC-8 404 for shift of other merchant', async () => {
      setup({ found: false });
      mockPrisma.outlets.findMany.mockResolvedValue([]);
      await expect(
        service.addCashEntry('shift-1', 'user-1', 'm-2', dto),
      ).rejects.toThrow(NotFoundException);
      await expect(service.getShift('shift-1', 'm-2')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.shift_cash_entries.create).not.toHaveBeenCalled();
    });

    it('AC-9 entry and audit log created in one $transaction; no entry when audit write fails', async () => {
      setup();
      await service.addCashEntry('shift-1', 'user-1', 'm-1', dto);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrisma.shift_audit_logs.create.mock.calls[0][0].data).toEqual({
        shift_id: 'shift-1',
        action: 'cash_entry_added',
        user_id: 'user-1',
        action_details: { entry_id: 'e1', type: 'out', amount: 25000 },
      });

      // The mock tx has no rollback: a rejected $transaction callback is what
      // Prisma rolls back, so assert the failure propagates out of it.
      mockPrisma.shift_audit_logs.create.mockRejectedValueOnce(new Error('db'));
      await expect(
        service.addCashEntry('shift-1', 'user-1', 'm-1', dto),
      ).rejects.toThrow('db');
    });

    const detailSetup = (entries: any[]) => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
        status: 'open',
        outlets: {},
        shift_owner: {},
      });
      mockPrisma.shift_participants.findMany.mockResolvedValue([]);
      mockPrisma.transactions.count.mockResolvedValue(0);
      mockPrisma.shift_cash_entries.findMany.mockResolvedValue(entries);
    };

    it('AC-10 getShift returns cash_entries and totals', async () => {
      const e = (type: string, amount: number) => ({
        id: type + amount,
        type,
        amount,
        reason: 'r',
        created_by: 'u',
        created_at: new Date(),
        users: { name: 'K' },
      });
      detailSetup([e('in', 10000.1), e('in', 0.2), e('out', 5000)]);
      const r = await service.getShift('shift-1', 'm-1');
      expect(r.cash_entries).toHaveLength(3);
      expect(r.total_cash_in).toBe(10000.3);
      expect(r.total_cash_out).toBe(5000);
    });

    it('AC-10 getShift returns 0 and [] when no entries', async () => {
      detailSetup([]);
      const r = await service.getShift('shift-1', 'm-1');
      expect(r.cash_entries).toEqual([]);
      expect(r.total_cash_in).toBe(0);
      expect(r.total_cash_out).toBe(0);
    });

    it('AC-6 closeShift without entries equals B-1 expected/difference', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
        status: 'open',
        opening_cash: 150000,
        outlets: {},
        shift_owner: {},
      });
      mockPrisma.transactions.aggregate.mockResolvedValue({
        _sum: { total_amount: 40000 },
      });
      mockPrisma.shift_participants.findMany.mockResolvedValue([]);
      mockPrisma.transactions.count.mockResolvedValue(0);
      mockPrisma.shift_cash_entries.findMany.mockResolvedValue([]);

      await service.closeShift('shift-1', 'user-1', 'm-1', 180000);

      const snap = mockPrisma.shifts.update.mock.calls[1][0].data;
      expect(Number(snap.expected_cash)).toBe(190000);
      expect(Number(snap.cash_difference)).toBe(-10000);
    });
  });
});
