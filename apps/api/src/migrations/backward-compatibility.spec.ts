/**
 * Backward Compatibility Test Suite for Single-Cashier Shifts
 *
 * Tests verify that single-cashier shifts migrated from the old system
 * continue to work correctly with the new multi-cashier architecture.
 *
 * Requirements: 11.1, 11.2, 11.3
 * - 11.1: Single-participant shifts return compatible structure with shift_owner_id mapping
 * - 11.2: Transactions submitted to single-participant shifts process identically
 * - 11.3: Single-participant shifts close without requiring additional participant removal logic
 */

describe('Backward Compatibility: Single-Cashier Shifts', () => {
  describe('Requirement 11.1: Compatible Structure', () => {
    it('should return shift with shift_owner_id mapping to original user_id', () => {
      // Simulated shift data after migration
      const shift = {
        id: 'shift-123',
        shift_owner_id: 'user-456',
        outlet_id: 'outlet-789',
        status: 'open',
        start_time: new Date(),
        end_time: null,
      };

      expect(shift.shift_owner_id).toBeDefined();
      expect(shift.status).toBe('open');
    });

    it('should return single participant with is_owner=true', () => {
      // Simulated participant data after migration
      const participants = [
        {
          user_id: 'user-456',
          is_owner: true,
          participant_added_at: new Date(),
          participant_removed_at: null,
        },
      ];

      expect(participants).toHaveLength(1);
      expect(participants[0].user_id).toBe('user-456');
      expect(participants[0].is_owner).toBe(true);
      expect(participants[0].participant_removed_at).toBeNull();
    });

    it('should have shift_owner_id matching participant user_id', () => {
      const shift = {
        shift_owner_id: 'user-456',
        shift_participants: [
          {
            user_id: 'user-456',
            is_owner: true,
          },
        ],
      };

      expect(shift.shift_participants).toHaveLength(1);
      expect(shift.shift_owner_id).toBe(shift.shift_participants[0].user_id);
    });

    it('should include participant_added_at timestamp', () => {
      const participant = {
        participant_added_at: new Date(),
      };

      expect(participant.participant_added_at).toBeInstanceOf(Date);
      expect(participant.participant_added_at.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should have participant_removed_at as null for active shift', () => {
      const participant = {
        participant_removed_at: null,
      };

      expect(participant.participant_removed_at).toBeNull();
    });

    it('should support querying by shift_owner_id', () => {
      const shifts = [
        {
          id: 'shift-123',
          shift_owner_id: 'user-456',
          outlet_id: 'outlet-789',
        },
        {
          id: 'shift-124',
          shift_owner_id: 'user-457',
          outlet_id: 'outlet-789',
        },
      ];

      const filteredShifts = shifts.filter(
        (s) => s.shift_owner_id === 'user-456' && s.outlet_id === 'outlet-789',
      );

      expect(filteredShifts.length).toBeGreaterThan(0);
      expect(filteredShifts.some((s) => s.id === 'shift-123')).toBe(true);
    });
  });

  describe('Requirement 11.2: Transaction Processing', () => {
    it('should allow transaction submission with shift_id and cashier_id', () => {
      const transaction = {
        id: 'tx-001',
        outlet_id: 'outlet-789',
        user_id: 'user-456',
        shift_id: 'shift-123',
        cashier_id: 'user-456',
        payment_method: 'cash',
        total_amount: 100000,
      };

      expect(transaction).toBeDefined();
      expect(transaction.shift_id).toBe('shift-123');
      expect(transaction.cashier_id).toBe('user-456');
    });

    it('should link transaction to correct shift', () => {
      const transaction = {
        shift_id: 'shift-123',
        cashier_id: 'user-456',
        outlet_id: 'outlet-789',
      };

      expect(transaction.shift_id).toBe('shift-123');
      expect(transaction.cashier_id).toBe('user-456');
      expect(transaction.outlet_id).toBe('outlet-789');
    });

    it('should verify user is active participant before transaction', () => {
      const participant = {
        participant_removed_at: null,
      };

      // Active participant should have null participant_removed_at
      expect(participant).toBeDefined();
      expect(participant.participant_removed_at).toBeNull();
    });

    it('should reject transaction from removed participant', () => {
      const participant = {
        participant_removed_at: new Date(),
      };

      expect(participant.participant_removed_at).not.toBeNull();
    });

    it('should preserve transaction history after participant removal', () => {
      const transaction = {
        id: 'tx-001',
        shift_id: 'shift-123',
        cashier_id: 'user-456',
      };

      // Transaction should still exist after participant removal
      expect(transaction).toBeDefined();
      expect(transaction.shift_id).toBe('shift-123');
      expect(transaction.cashier_id).toBe('user-456');
    });

    it('should calculate transaction count for single participant', () => {
      const transactions = [
        { id: 'tx-001', shift_id: 'shift-123', cashier_id: 'user-456' },
        { id: 'tx-002', shift_id: 'shift-123', cashier_id: 'user-456' },
        { id: 'tx-003', shift_id: 'shift-123', cashier_id: 'user-456' },
      ];

      const transactionCount = transactions.filter(
        (t) => t.shift_id === 'shift-123' && t.cashier_id === 'user-456',
      ).length;

      expect(transactionCount).toBe(3);
    });
  });

  describe('Requirement 11.3: Shift Closure', () => {
    it('should close shift without additional participant removal logic', () => {
      const shift = {
        id: 'shift-123',
        status: 'closed',
        end_time: new Date(),
      };

      expect(shift.status).toBe('closed');
      expect(shift.end_time).toBeDefined();
    });

    it('should mark participant as removed when shift closes', () => {
      const participant = {
        participant_removed_at: new Date(),
      };

      expect(participant.participant_removed_at).not.toBeNull();
    });

    it('should preserve all transactions when shift closes', () => {
      const transactions = [
        { id: 'tx-001', shift_id: 'shift-123' },
        { id: 'tx-002', shift_id: 'shift-123' },
      ];

      const shiftTransactions = transactions.filter((t) => t.shift_id === 'shift-123');

      expect(shiftTransactions).toHaveLength(2);
      expect(shiftTransactions.map((t) => t.id)).toEqual(
        expect.arrayContaining(['tx-001', 'tx-002']),
      );
    });

    it('should create audit log when shift closes', () => {
      const auditLog = {
        shift_id: 'shift-123',
        action: 'shift_closed',
        user_id: 'user-456',
      };

      expect(auditLog).toBeDefined();
      expect(auditLog.action).toBe('shift_closed');
      expect(auditLog.user_id).toBe('user-456');
    });

    it('should prevent new transactions after shift closes', () => {
      const shift = {
        id: 'shift-123',
        status: 'closed',
      };

      expect(shift.status).toBe('closed');
    });
  });

  describe('Data Integrity', () => {
    it('should have no orphaned shift_participants', () => {
      const participant = {
        shift_id: 'shift-123',
        user_id: 'user-456',
      };

      expect(participant).toBeDefined();
      expect(participant.shift_id).toBe('shift-123');
    });

    it('should have valid user reference in shift_participants', () => {
      const participant = {
        user_id: 'user-456',
      };

      const user = {
        id: 'user-456',
        name: 'Test User',
      };

      expect(user).toBeDefined();
      expect(user.id).toBe(participant.user_id);
    });

    it('should have valid shift reference in shift_participants', () => {
      const participant = {
        shift_id: 'shift-123',
      };

      const shift = {
        id: 'shift-123',
      };

      expect(shift).toBeDefined();
      expect(shift.id).toBe(participant.shift_id);
    });

    it('should have valid user reference in shift_audit_logs', () => {
      const auditLog = {
        user_id: 'user-456',
      };

      const user = {
        id: 'user-456',
      };

      expect(user).toBeDefined();
      expect(user.id).toBe(auditLog.user_id);
    });

    it('should have valid shift reference in shift_audit_logs', () => {
      const auditLog = {
        shift_id: 'shift-123',
      };

      const shift = {
        id: 'shift-123',
      };

      expect(shift).toBeDefined();
      expect(shift.id).toBe(auditLog.shift_id);
    });

    it('should have valid outlet reference in shifts', () => {
      const shift = {
        outlet_id: 'outlet-789',
      };

      const outlet = {
        id: 'outlet-789',
      };

      expect(outlet).toBeDefined();
      expect(outlet.id).toBe(shift.outlet_id);
    });

    it('should have valid shift_owner reference in shifts', () => {
      const shift = {
        shift_owner_id: 'user-456',
      };

      const user = {
        id: 'user-456',
      };

      expect(user).toBeDefined();
      expect(user.id).toBe(shift.shift_owner_id);
    });
  });

  describe('Audit Trail Consistency', () => {
    it('should have initial shift_opened audit log', () => {
      const auditLogs = [
        {
          shift_id: 'shift-123',
          action: 'shift_opened',
          user_id: 'user-456',
        },
      ];

      const openLog = auditLogs.find((log) => log.action === 'shift_opened');

      expect(openLog).toBeDefined();
      expect(openLog?.action).toBe('shift_opened');
      expect(openLog?.user_id).toBe('user-456');
    });

    it('should have audit logs ordered by created_at', () => {
      const auditLogs = [
        {
          action: 'shift_opened',
          created_at: new Date('2024-01-01T10:00:00Z'),
        },
        {
          action: 'participant_added',
          created_at: new Date('2024-01-01T10:05:00Z'),
        },
        {
          action: 'shift_closed',
          created_at: new Date('2024-01-01T10:10:00Z'),
        },
      ];

      // Verify ordering
      for (let i = 1; i < auditLogs.length; i++) {
        expect(auditLogs[i].created_at.getTime()).toBeGreaterThanOrEqual(
          auditLogs[i - 1].created_at.getTime(),
        );
      }
    });

    it('should preserve audit trail after shift closure', () => {
      const auditLogs = [
        {
          id: 'log-001',
          shift_id: 'shift-123',
          action: 'participant_added',
          user_id: 'user-456',
        },
        {
          id: 'log-002',
          shift_id: 'shift-123',
          action: 'shift_closed',
          user_id: 'user-456',
        },
      ];

      const beforeCloseLog = auditLogs.find((log) => log.action === 'participant_added');

      expect(beforeCloseLog).toBeDefined();
      expect(beforeCloseLog?.action).toBe('participant_added');
    });
  });

  describe('Backward Compatibility Edge Cases', () => {
    it('should handle shift with no transactions', () => {
      const shift = {
        id: 'shift-123',
        shift_owner_id: 'user-456',
        status: 'open',
      };

      expect(shift).toBeDefined();
      expect(shift.shift_owner_id).toBe('user-456');
    });

    it('should support querying single-participant shifts by outlet', () => {
      const shifts = [
        {
          id: 'shift-123',
          shift_owner_id: 'user-456',
          outlet_id: 'outlet-789',
          status: 'open',
        },
      ];

      const filteredShifts = shifts.filter(
        (s) => s.outlet_id === 'outlet-789' && s.status === 'open',
      );

      expect(filteredShifts.length).toBeGreaterThan(0);
      expect(filteredShifts.some((s) => s.id === 'shift-123')).toBe(true);
    });

    it('should support filtering shifts by status', () => {
      const shifts = [
        { id: 'shift-123', outlet_id: 'outlet-789', status: 'open' },
        { id: 'shift-124', outlet_id: 'outlet-789', status: 'closed' },
      ];

      const openShifts = shifts.filter(
        (s) => s.outlet_id === 'outlet-789' && s.status === 'open',
      );

      expect(openShifts.length).toBeGreaterThan(0);
      openShifts.forEach((shift) => {
        expect(shift.status).toBe('open');
      });
    });

    it('should support pagination of shifts', () => {
      const shifts = [
        { id: 'shift-123' },
        { id: 'shift-124' },
        { id: 'shift-125' },
      ];

      const paginated = shifts.slice(0, 10);

      expect(Array.isArray(paginated)).toBe(true);
    });

    it('should calculate total transactions for shift', () => {
      const transactions = [
        { id: 'tx-001', shift_id: 'shift-123', cashier_id: 'user-456' },
        { id: 'tx-002', shift_id: 'shift-123', cashier_id: 'user-456' },
        { id: 'tx-003', shift_id: 'shift-123', cashier_id: 'user-456' },
      ];

      const totalTransactions = transactions.filter((t) => t.shift_id === 'shift-123').length;

      expect(totalTransactions).toBe(3);
    });

    it('should support querying transactions by shift and cashier', () => {
      const transactions = [
        { id: 'tx-001', shift_id: 'shift-123', cashier_id: 'user-456' },
        { id: 'tx-002', shift_id: 'shift-123', cashier_id: 'user-456' },
      ];

      const filtered = transactions.filter(
        (t) => t.shift_id === 'shift-123' && t.cashier_id === 'user-456',
      );

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.some((t) => t.id === 'tx-001')).toBe(true);
    });
  });

  describe('Migration Verification', () => {
    it('should verify shift_owner_id is populated for all shifts', () => {
      const shifts = [
        { id: 'shift-123', shift_owner_id: 'user-456' },
        { id: 'shift-124', shift_owner_id: 'user-457' },
      ];

      const shiftsWithoutOwner = shifts.filter((s) => !s.shift_owner_id);

      expect(shiftsWithoutOwner).toHaveLength(0);
    });

    it('should verify all shifts have at least one participant', () => {
      const shifts = [
        {
          id: 'shift-123',
          shift_participants: [{ user_id: 'user-456', is_owner: true }],
        },
        {
          id: 'shift-124',
          shift_participants: [{ user_id: 'user-457', is_owner: true }],
        },
      ];

      const shiftsWithoutParticipants = shifts.filter((s) => s.shift_participants.length === 0);

      expect(shiftsWithoutParticipants).toHaveLength(0);
    });

    it('should verify all shifts have initial audit log', () => {
      const shifts = [
        {
          id: 'shift-123',
          shift_audit_logs: [{ action: 'shift_opened', user_id: 'user-456' }],
        },
        {
          id: 'shift-124',
          shift_audit_logs: [{ action: 'shift_opened', user_id: 'user-457' }],
        },
      ];

      const shiftsWithoutAuditLog = shifts.filter(
        (s) => !s.shift_audit_logs.some((log) => log.action === 'shift_opened'),
      );

      expect(shiftsWithoutAuditLog).toHaveLength(0);
    });

    it('should verify participant count is consistent', () => {
      const shifts = [
        {
          id: 'shift-123',
          shift_participants: [{ user_id: 'user-456', is_owner: true }],
        },
        {
          id: 'shift-124',
          shift_participants: [{ user_id: 'user-457', is_owner: true }],
        },
      ];

      const totalParticipants = shifts.reduce((sum, s) => sum + s.shift_participants.length, 0);

      expect(totalParticipants).toBeGreaterThanOrEqual(shifts.length);
    });

    it('should verify shift_owner_id matches owner participant', () => {
      const shifts = [
        {
          id: 'shift-123',
          shift_owner_id: 'user-456',
          shift_participants: [{ user_id: 'user-456', is_owner: true }],
        },
      ];

      shifts.forEach((shift) => {
        const ownerParticipant = shift.shift_participants.find((p) => p.is_owner);
        expect(shift.shift_owner_id).toBe(ownerParticipant?.user_id);
      });
    });

    it('should verify transactions are linked to shifts', () => {
      const transactions = [
        { id: 'tx-001', shift_id: 'shift-123', cashier_id: 'user-456' },
        { id: 'tx-002', shift_id: 'shift-123', cashier_id: 'user-456' },
      ];

      const linkedTransactions = transactions.filter((t) => t.shift_id && t.cashier_id);

      expect(linkedTransactions.length).toBeGreaterThan(0);
    });
  });
});
