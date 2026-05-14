import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from './audit-logs.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let prisma: PrismaService;

  const mockPrisma = {
    outlets: {
      findMany: jest.fn(),
    },
    shifts: {
      findFirst: jest.fn(),
    },
    shift_audit_logs: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) => {
      if (typeof callback === 'function') {
        return callback(mockPrisma);
      }
      if (Array.isArray(callback)) {
        return Promise.all(callback);
      }
      return Promise.resolve(callback);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createAuditLog', () => {
    it('should create an audit log entry', async () => {
      const shiftId = 'shift-1';
      const userId = 'user-1';
      const action = 'shift_opened';
      const actionDetails = { outlet_id: 'outlet-1' };

      mockPrisma.shift_audit_logs.create.mockResolvedValue({
        id: 'log-1',
        shift_id: shiftId,
        action,
        user_id: userId,
        action_details: actionDetails,
        created_at: new Date(),
      });

      const result = await service.createAuditLog(
        shiftId,
        action,
        userId,
        actionDetails,
      );

      expect(result).toBeDefined();
      expect(result.action).toBe(action);
      expect(mockPrisma.shift_audit_logs.create).toHaveBeenCalledWith({
        data: {
          shift_id: shiftId,
          action,
          user_id: userId,
          action_details: actionDetails,
          created_at: expect.any(Date),
        },
      });
    });

    it('should create audit log with empty action details if not provided', async () => {
      mockPrisma.shift_audit_logs.create.mockResolvedValue({
        id: 'log-1',
        shift_id: 'shift-1',
        action: 'shift_opened',
        user_id: 'user-1',
        action_details: {},
        created_at: new Date(),
      });

      await service.createAuditLog('shift-1', 'shift_opened', 'user-1');

      expect(mockPrisma.shift_audit_logs.create).toHaveBeenCalledWith({
        data: {
          shift_id: 'shift-1',
          action: 'shift_opened',
          user_id: 'user-1',
          action_details: {},
          created_at: expect.any(Date),
        },
      });
    });
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs', async () => {
      const shiftId = 'shift-1';
      const merchantId = 'merchant-1';

      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: shiftId,
        outlet_id: 'outlet-1',
      });
      mockPrisma.shift_audit_logs.findMany.mockResolvedValue([
        {
          id: 'log-1',
          shift_id: shiftId,
          action: 'shift_opened',
          user_id: 'user-1',
          action_details: {},
          created_at: new Date(),
          users: { id: 'user-1', name: 'User 1', username: 'user1' },
        },
      ]);
      mockPrisma.shift_audit_logs.count.mockResolvedValue(1);

      const result = await service.getAuditLogs(shiftId, merchantId, 10, 0);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should throw NotFoundException if shift not found', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue(null);

      await expect(
        service.getAuditLogs('invalid-shift', 'merchant-1', 10, 0),
      ).rejects.toThrow(NotFoundException);
    });

    it('should support custom limit and offset', async () => {
      mockPrisma.outlets.findMany.mockResolvedValue([{ id: 'outlet-1' }]);
      mockPrisma.shifts.findFirst.mockResolvedValue({
        id: 'shift-1',
        outlet_id: 'outlet-1',
      });
      mockPrisma.shift_audit_logs.findMany.mockResolvedValue([]);
      mockPrisma.shift_audit_logs.count.mockResolvedValue(0);

      await service.getAuditLogs('shift-1', 'merchant-1', 20, 5);

      expect(mockPrisma.shift_audit_logs.findMany).toHaveBeenCalledWith({
        where: { shift_id: 'shift-1' },
        include: {
          users: { select: { id: true, name: true, username: true } },
        },
        orderBy: { created_at: 'asc' },
        skip: 5,
        take: 20,
      });
    });
  });

  describe('validateAuditTrail', () => {
    it('should reconstruct shift state from audit logs', async () => {
      mockPrisma.shift_audit_logs.findMany.mockResolvedValue([
        {
          id: 'log-1',
          shift_id: 'shift-1',
          action: 'shift_opened',
          user_id: 'user-1',
          action_details: {},
          created_at: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: 'log-2',
          shift_id: 'shift-1',
          action: 'participant_added',
          user_id: 'user-1',
          action_details: { user_id: 'user-2' },
          created_at: new Date('2024-01-01T10:05:00Z'),
        },
      ]);

      const result = await service.validateAuditTrail('shift-1');

      expect(result).toBeDefined();
      expect(result.reconstructed_owner).toBe('user-1');
      expect(result.reconstructed_participants).toContain('user-1');
      expect(result.reconstructed_participants).toContain('user-2');
      expect(result.reconstructed_status).toBe('open');
    });

    it('should handle participant removal in audit trail', async () => {
      mockPrisma.shift_audit_logs.findMany.mockResolvedValue([
        {
          id: 'log-1',
          shift_id: 'shift-1',
          action: 'shift_opened',
          user_id: 'user-1',
          action_details: {},
          created_at: new Date(),
        },
        {
          id: 'log-2',
          shift_id: 'shift-1',
          action: 'participant_added',
          user_id: 'user-1',
          action_details: { user_id: 'user-2' },
          created_at: new Date(),
        },
        {
          id: 'log-3',
          shift_id: 'shift-1',
          action: 'participant_removed',
          user_id: 'user-1',
          action_details: { user_id: 'user-2' },
          created_at: new Date(),
        },
      ]);

      const result = await service.validateAuditTrail('shift-1');

      expect(result.reconstructed_participants).toContain('user-1');
      expect(result.reconstructed_participants).not.toContain('user-2');
    });

    it('should handle shift closure in audit trail', async () => {
      mockPrisma.shift_audit_logs.findMany.mockResolvedValue([
        {
          id: 'log-1',
          shift_id: 'shift-1',
          action: 'shift_opened',
          user_id: 'user-1',
          action_details: {},
          created_at: new Date(),
        },
        {
          id: 'log-2',
          shift_id: 'shift-1',
          action: 'shift_closed',
          user_id: 'user-1',
          action_details: { closed_by: 'user-1' },
          created_at: new Date(),
        },
      ]);

      const result = await service.validateAuditTrail('shift-1');

      expect(result.reconstructed_status).toBe('closed');
      expect(result.reconstructed_participants).toHaveLength(0);
    });

    it('should handle shift handoff in audit trail', async () => {
      mockPrisma.shift_audit_logs.findMany.mockResolvedValue([
        {
          id: 'log-1',
          shift_id: 'shift-1',
          action: 'shift_opened',
          user_id: 'user-1',
          action_details: {},
          created_at: new Date(),
        },
        {
          id: 'log-2',
          shift_id: 'shift-1',
          action: 'shift_handoff',
          user_id: 'user-1',
          action_details: { from_user_id: 'user-1', to_user_id: 'user-2' },
          created_at: new Date(),
        },
      ]);

      const result = await service.validateAuditTrail('shift-1');

      expect(result.reconstructed_owner).toBe('user-2');
    });
  });
});
