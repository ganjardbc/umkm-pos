import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsService } from './shifts.service';
import { PrismaService } from '../database/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
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
    transactions: {
      count: jest.fn(),
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
            shift_owner: { id: userId, name: 'Test User', username: 'testuser' },
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

      const result = await service.openShift(outletId, userId, merchantId);

      expect(result).toBeDefined();
      expect(result.shift_owner_id).toBe(userId);
      expect(result.participants).toHaveLength(1);
      expect(result.participants[0].is_owner).toBe(true);
    });

    it('should throw NotFoundException if outlet not found', async () => {
      mockPrisma.outlets.findFirst.mockResolvedValue(null);

      await expect(
        service.openShift('invalid-outlet', 'user-1', 'merchant-1'),
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
        service.openShift(outletId, userId, merchantId),
      ).rejects.toThrow(ConflictException);
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

      await service.closeShift(shiftId, userId, merchantId);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if shift already closed', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
        status: 'closed',
      });

      await expect(
        service.closeShift('shift-1', 'user-1', 'merchant-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if shift not found', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue(null);

      await expect(
        service.closeShift('invalid-shift', 'user-1', 'merchant-1'),
      ).rejects.toThrow(NotFoundException);
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
});
