# Technical Design: Multi-Cashier Shift Support

## Overview

This design extends the UMKM POS system to support multiple concurrent cashiers operating within a single shift. The current single-cashier model is replaced with a flexible participant-based architecture that maintains backward compatibility while enabling advanced shift management capabilities.

### Key Design Principles

1. **Participant-Based Architecture**: Shifts contain multiple participants tracked via a junction table
2. **Immutable Audit Trail**: All shift operations are logged for compliance and debugging
3. **Atomic Transactions**: Database-level constraints ensure data consistency
4. **Merchant Scoping**: All operations are scoped to merchant ownership
5. **Backward Compatibility**: Existing single-cashier shifts continue functioning unchanged

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (NestJS)                      │
├─────────────────────────────────────────────────────────────┤
│  ShiftsController  │  TransactionsController  │  AuditController
└──────────┬──────────────────────┬──────────────────────┬────┘
           │                      │                      │
┌──────────▼──────────────────────▼──────────────────────▼────┐
│                    Service Layer                            │
├──────────────────────────────────────────────────────────────┤
│  ShiftsService  │  TransactionsService  │  AuditLogsService │
│  MetricsService │  AuthorizationService                     │
└──────────┬──────────────────────┬──────────────────────┬────┘
           │                      │                      │
┌──────────▼──────────────────────▼──────────────────────▼────┐
│                  Data Access Layer (Prisma)                 │
├──────────────────────────────────────────────────────────────┤
│  shifts  │  shift_participants  │  shift_audit_logs  │  ...  │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Shift Opening**: User → API → ShiftsService → Prisma → DB (atomic transaction)
2. **Participant Management**: User → API → ShiftsService → Prisma → DB
3. **Transaction Submission**: Cashier → API → TransactionsService → Validation → DB
4. **Audit Logging**: All operations → AuditLogsService → Immutable DB records

---

## Components and Interfaces

### 1. Database Schema

#### shifts Table (Modified)

```sql
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES outlets(id),
  shift_owner_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'transferred')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_user_open_shift_per_outlet UNIQUE (outlet_id, shift_owner_id, status) 
    WHERE status = 'open',
  CONSTRAINT end_time_after_start CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE INDEX idx_shifts_outlet_id ON shifts(outlet_id);
CREATE INDEX idx_shifts_shift_owner_id ON shifts(shift_owner_id);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_start_time ON shifts(start_time DESC);
```

#### shift_participants Table (New)

```sql
CREATE TABLE shift_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  participant_added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  participant_removed_at TIMESTAMP WITH TIME ZONE,
  is_owner BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_participant_per_shift UNIQUE (shift_id, user_id),
  CONSTRAINT removed_after_added CHECK (participant_removed_at IS NULL OR participant_removed_at >= participant_added_at)
);

CREATE INDEX idx_shift_participants_shift_id ON shift_participants(shift_id);
CREATE INDEX idx_shift_participants_user_id ON shift_participants(user_id);
CREATE INDEX idx_shift_participants_active ON shift_participants(shift_id, participant_removed_at) 
  WHERE participant_removed_at IS NULL;
```

#### shift_audit_logs Table (New)

```sql
CREATE TABLE shift_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN (
    'shift_opened', 'participant_added', 'participant_removed', 
    'shift_handoff', 'shift_closed'
  )),
  user_id UUID NOT NULL REFERENCES users(id),
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT immutable_audit_log CHECK (created_at = created_at)
);

CREATE INDEX idx_shift_audit_logs_shift_id ON shift_audit_logs(shift_id);
CREATE INDEX idx_shift_audit_logs_user_id ON shift_audit_logs(user_id);
CREATE INDEX idx_shift_audit_logs_created_at ON shift_audit_logs(created_at DESC);
```

#### transactions Table (Modified)

```sql
ALTER TABLE transactions ADD COLUMN shift_id UUID REFERENCES shifts(id);
ALTER TABLE transactions ADD COLUMN cashier_id UUID REFERENCES users(id);

CREATE INDEX idx_transactions_shift_id ON transactions(shift_id);
CREATE INDEX idx_transactions_cashier_id ON transactions(cashier_id);
```

### 2. DTOs and Request/Response Models

#### OpenShiftDto

```typescript
export class OpenShiftDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440021' })
  @IsNotEmpty()
  @IsUUID()
  outlet_id: string;
}

export class ShiftResponseDto {
  id: string;
  outlet_id: string;
  shift_owner_id: string;
  status: 'open' | 'closed' | 'transferred';
  start_time: Date;
  end_time?: Date;
  participants: ParticipantDto[];
  participant_count: number;
  total_transactions: number;
}

export class ParticipantDto {
  user_id: string;
  user_name: string;
  participant_added_at: Date;
  participant_removed_at?: Date;
  is_owner: boolean;
  transaction_count: number;
}
```

#### AddParticipantDto

```typescript
export class AddParticipantDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440021' })
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}

export class RemoveParticipantDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440021' })
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
```

#### HandoffShiftDto

```typescript
export class HandoffShiftDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440021' })
  @IsNotEmpty()
  @IsUUID()
  target_user_id: string;

  @ApiProperty({ example: false, description: 'Remove previous owner from participants' })
  @IsBoolean()
  @IsOptional()
  remove_previous_owner?: boolean = false;
}
```

#### AuditLogDto

```typescript
export class AuditLogDto {
  id: string;
  shift_id: string;
  action: 'shift_opened' | 'participant_added' | 'participant_removed' | 'shift_handoff' | 'shift_closed';
  user_id: string;
  user_name: string;
  action_details: Record<string, any>;
  created_at: Date;
}
```

#### MetricsDto

```typescript
export class ParticipantMetricsDto {
  user_id: string;
  user_name: string;
  transaction_count: number;
  total_amount: number;
  average_transaction_amount: number;
  participation_duration_minutes: number;
  participant_added_at: Date;
  participant_removed_at?: Date;
}
```

### 3. API Endpoints

#### Shift Management Endpoints

**POST /shifts** - Open a new shift
- Request: `OpenShiftDto`
- Response: `ShiftResponseDto`
- Errors: 403 (no permission), 404 (outlet not found), 409 (user has open shift)
- Authorization: User must have access to outlet

**GET /shifts/:id** - Get shift details with participants
- Response: `ShiftResponseDto`
- Errors: 404 (shift not found), 403 (no permission)
- Authorization: User must have access to shift's merchant

**PATCH /shifts/:id/close** - Close a shift
- Request: Empty body
- Response: `ShiftResponseDto`
- Errors: 400 (already closed), 403 (no permission)
- Authorization: Shift owner or manager

**GET /shifts** - Query shifts with filtering
- Query params: `outlet_id`, `status`, `start_date`, `end_date`, `user_id`, `limit`, `offset`
- Response: `{ data: ShiftResponseDto[], total: number, limit: number, offset: number }`
- Errors: 400 (invalid params), 403 (no permission)
- Authorization: Merchant only

#### Participant Management Endpoints

**POST /shifts/:id/participants** - Add cashier to shift
- Request: `AddParticipantDto`
- Response: `ParticipantDto`
- Errors: 400 (shift closed), 404 (user/shift not found), 409 (already participant), 403 (no permission)
- Authorization: Shift owner or manager

**DELETE /shifts/:id/participants/:user_id** - Remove cashier from shift
- Response: `{ success: boolean }`
- Errors: 400 (last participant), 404 (participant not found), 403 (no permission)
- Authorization: Shift owner or manager

**GET /shifts/:id/participants** - List shift participants
- Response: `{ data: ParticipantDto[], total: number }`
- Errors: 404 (shift not found), 403 (no permission)
- Authorization: User with access to shift

**POST /shifts/:id/handoff** - Transfer shift ownership
- Request: `HandoffShiftDto`
- Response: `ShiftResponseDto`
- Errors: 400 (target not participant, shift closed), 403 (not owner)
- Authorization: Current shift owner

#### Audit and Metrics Endpoints

**GET /shifts/:id/audit-log** - Retrieve audit trail
- Query params: `limit`, `offset`
- Response: `{ data: AuditLogDto[], total: number }`
- Errors: 404 (shift not found), 403 (no permission)
- Authorization: User with access to shift

**GET /shifts/:id/participants/:user_id/metrics** - Get participant performance metrics
- Response: `ParticipantMetricsDto`
- Errors: 404 (participant not found), 403 (no permission)
- Authorization: User with access to shift

---

## Data Models

### Shift State Machine

```
┌─────────┐
│  OPEN   │◄─────────────────────────────────┐
└────┬────┘                                  │
     │                                       │
     ├──► CLOSED (via close endpoint)        │
     │                                       │
     └──► TRANSFERRED (via handoff endpoint) │
          │                                  │
          └──────────────────────────────────┘
```

### Participant Lifecycle

```
ADDED ──► ACTIVE ──► REMOVED
  │        │          │
  └────────┴──────────┘
   (participant_added_at)
            │
   (participant_removed_at = null)
            │
   (participant_removed_at = timestamp)
```

### Transaction Validation Flow

```
Transaction Submission
    │
    ├─► Verify shift exists
    │
    ├─► Verify shift is OPEN
    │
    ├─► Verify user is participant
    │
    ├─► Verify participant_removed_at IS NULL
    │
    ├─► Verify products exist & stock available
    │
    └─► Create transaction with cashier_id & shift_id
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Shift Opening Creates Owner and Initial Participant

*For any* valid outlet, when a shift is opened by a user, that user must be set as both the shift_owner_id and appear as a participant with is_owner=true.

**Validates: Requirements 1.2**

### Property 2: Participant Addition Maintains Consistency

*For any* open shift and valid user, adding that user as a participant must result in the user appearing in the participants list with participant_removed_at=null.

**Validates: Requirements 2.1, 2.2**

### Property 3: Removed Participants Cannot Submit Transactions

*For any* shift and user who was a participant but has been removed (participant_removed_at is not null), attempting to submit a transaction must fail with a 403 error.

**Validates: Requirements 5.8, 12.2**

### Property 4: Audit Trail Reconstruction

*For any* shift, replaying all audit log entries in chronological order must reconstruct the exact current shift state (participants, status, owner).

**Validates: Requirements 10.1, 10.3**

### Property 5: Transaction Count Consistency

*For any* shift, the sum of transaction_count across all participants must equal the total number of transactions linked to that shift.

**Validates: Requirements 8.3, 14.3**

### Property 6: Closed Shift Immutability

*For any* closed shift, attempting to add participants, remove participants, or submit transactions must fail with appropriate error codes.

**Validates: Requirements 6.8, 15.4**

### Property 7: Participant Ordering

*For any* shift, when participants are listed, they must be ordered by participant_added_at in ascending order.

**Validates: Requirements 4.3**

### Property 8: Shift Ownership Transfer

*For any* shift, after a handoff to a new owner, the shift_owner_id must be updated to the target user and an audit log entry with action "shift_handoff" must exist.

**Validates: Requirements 7.1, 7.2, 7.3**

### Property 9: Merchant Scoping Enforcement

*For any* shift operation, if the requesting user's merchant does not own the outlet, the operation must fail with a 403 error.

**Validates: Requirements 13.1, 13.4**

### Property 10: Single Participant Minimum

*For any* open shift, attempting to remove the last remaining participant must fail with a 400 error.

**Validates: Requirements 3.4**

### Property 11: Backward Compatibility

*For any* single-participant shift migrated from the old system, querying it must return a compatible structure with shift_owner_id mapping to the original user_id.

**Validates: Requirements 11.1, 11.5**

### Property 12: Audit Log Immutability

*For any* shift, audit log entries must be created in chronological order and never modified or deleted (only appended).

**Validates: Requirements 10.1**

### Property 13: Active Participant Validation

*For any* transaction submission, the system must verify that participant_removed_at is null for the requesting user in the specified shift.

**Validates: Requirements 5.1, 12.6**

### Property 14: Metrics Calculation Accuracy

*For any* participant in a shift, the calculated transaction_count must equal the number of transactions where cashier_id matches the participant's user_id and created_at is between participant_added_at and (participant_removed_at or shift end_time).

**Validates: Requirements 14.3, 14.4**

### Property 15: Duplicate Participant Prevention

*For any* shift, attempting to add a user who is already a participant must fail with a 409 error.

**Validates: Requirements 2.5**

---

## Error Handling

### Error Response Format

```typescript
{
  "statusCode": number,
  "message": string,
  "error": string,
  "details"?: Record<string, any>
}
```

### Error Codes and Handling

| Error | Code | Message | Cause |
|-------|------|---------|-------|
| Shift not found | 404 | "Shift not found" | Invalid shift_id |
| User not found | 404 | "User not found" | Invalid user_id |
| Outlet not found | 404 | "Outlet not found" | Invalid outlet_id |
| Participant not found | 404 | "Participant not found" | User not in shift |
| No permission | 403 | "Insufficient permissions" | User lacks access |
| Shift closed | 400 | "Cannot add participants to a closed shift" | Shift status != open |
| Duplicate participant | 409 | "User is already a participant in this shift" | User already added |
| Last participant | 400 | "Cannot remove the last participant from an open shift" | Only 1 participant |
| User has open shift | 409 | "User already has an open shift at this outlet" | Duplicate open shift |
| Invalid transition | 400 | "Invalid state transition" | Disallowed state change |
| Target not participant | 400 | "Target user must be a participant in the shift" | Handoff to non-participant |
| Not shift owner | 403 | "Only the shift owner can initiate a handoff" | Non-owner handoff |
| Shift already closed | 400 | "Shift is already closed" | Double close |
| Not participant | 403 | "User is not a participant in this shift" | Transaction by non-participant |
| Shift unavailable | 400 | "Shift is not available for transactions" | Closed or invalid shift |

### Exception Handling Strategy

```typescript
// In ShiftsService
try {
  await prisma.$transaction(async (tx) => {
    // Atomic operations
  });
} catch (error) {
  if (error instanceof Prisma.UniqueConstraintFailedError) {
    throw new ConflictException('User is already a participant in this shift');
  }
  if (error instanceof Prisma.ForeignKeyConstraintFailedError) {
    throw new NotFoundException('User not found');
  }
  throw error;
}
```

---

## Testing Strategy

### Unit Testing Approach

Unit tests focus on specific examples, edge cases, and error conditions:

1. **Shift Opening**
   - Valid shift creation with owner and initial participant
   - Duplicate open shift prevention
   - Invalid outlet handling
   - Permission validation

2. **Participant Management**
   - Adding valid participants
   - Duplicate participant prevention
   - Removing participants
   - Last participant protection
   - Closed shift rejection

3. **Transaction Submission**
   - Valid transaction creation
   - Non-participant rejection
   - Removed participant rejection
   - Closed shift rejection

4. **Shift Closure**
   - Successful closure with participant removal
   - Double-close prevention
   - Transaction preservation

5. **Handoff Operations**
   - Valid ownership transfer
   - Non-participant target rejection
   - Closed shift rejection
   - Previous owner removal (optional)

6. **Audit Logging**
   - Entry creation for all operations
   - Correct action types
   - Timestamp accuracy
   - Immutability

7. **Authorization**
   - Merchant scoping
   - Permission validation
   - Cross-merchant rejection

### Property-Based Testing Approach

Property-based tests verify universal properties across randomized inputs:

**Test Configuration:**
- Minimum 100 iterations per property test
- Randomized shift data, participants, and transactions
- Tag format: `Feature: multi-cashier-shifts, Property {number}: {property_text}`

**Property Test Examples:**

```typescript
// Property 1: Shift Opening Creates Owner and Initial Participant
describe('Shift Opening Properties', () => {
  it('should create shift with owner as initial participant', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        (outletId, userId) => {
          const shift = shiftsService.openShift(outletId, userId);
          expect(shift.shift_owner_id).toBe(userId);
          expect(shift.participants).toContainEqual(
            expect.objectContaining({ user_id: userId, is_owner: true })
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Property 3: Removed Participants Cannot Submit Transactions
describe('Transaction Validation Properties', () => {
  it('should reject transactions from removed participants', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.array(fc.record({ amount: fc.integer() })),
        (shiftId, userId, items) => {
          shiftsService.removeParticipant(shiftId, userId);
          expect(() => 
            transactionsService.submitTransaction(shiftId, userId, items)
          ).toThrow('User is not a participant in this shift');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Property 5: Transaction Count Consistency
describe('Metrics Properties', () => {
  it('should maintain transaction count consistency', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(fc.uuid()),
        fc.array(fc.record({ amount: fc.integer() })),
        (shiftId, userIds, transactions) => {
          const shift = shiftsService.getShift(shiftId);
          const participantCounts = shift.participants.map(p => p.transaction_count);
          const totalFromParticipants = participantCounts.reduce((a, b) => a + b, 0);
          expect(totalFromParticipants).toBe(shift.total_transactions);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage of service methods
- **Property Tests**: All 15 correctness properties implemented
- **Integration Tests**: API endpoint workflows
- **E2E Tests**: Complete shift lifecycle scenarios

### Testing Tools

- **Unit/Property Testing**: Jest + fast-check
- **API Testing**: Supertest
- **Database Testing**: Prisma test utilities
- **Mocking**: jest.mock() for external services

---

## Migration Strategy

### Phase 1: Database Migration

```sql
-- 1. Create new tables
CREATE TABLE shift_participants (...);
CREATE TABLE shift_audit_logs (...);

-- 2. Add columns to shifts
ALTER TABLE shifts ADD COLUMN shift_owner_id UUID;
ALTER TABLE shifts ADD COLUMN status VARCHAR(20) DEFAULT 'open';

-- 3. Add columns to transactions
ALTER TABLE transactions ADD COLUMN shift_id UUID;
ALTER TABLE transactions ADD COLUMN cashier_id UUID;

-- 4. Migrate existing data
INSERT INTO shift_participants (shift_id, user_id, participant_added_at, is_owner)
SELECT id, user_id, created_at, TRUE FROM shifts;

UPDATE shifts SET shift_owner_id = user_id WHERE shift_owner_id IS NULL;

-- 5. Create initial audit logs
INSERT INTO shift_audit_logs (shift_id, action, user_id, created_at)
SELECT id, 'shift_opened', user_id, created_at FROM shifts;

-- 6. Link transactions to shifts
UPDATE transactions SET shift_id = (
  SELECT id FROM shifts WHERE shifts.id = transactions.shift_id
), cashier_id = user_id;

-- 7. Drop old user_id column from shifts (after verification)
ALTER TABLE shifts DROP COLUMN user_id;
```

### Phase 2: Code Deployment

1. Deploy new services (ShiftsService, AuditLogsService, MetricsService)
2. Deploy new API endpoints
3. Deploy transaction validation updates
4. Deploy frontend updates

### Phase 3: Verification

1. Verify all existing shifts migrated correctly
2. Test backward compatibility with single-participant shifts
3. Validate audit logs created for all operations
4. Monitor transaction submission for errors

---

## Implementation Order & Dependencies

### Phase 1: Database and Migrations (Week 1)
- [ ] Create shift_participants table
- [ ] Create shift_audit_logs table
- [ ] Modify shifts table schema
- [ ] Modify transactions table schema
- [ ] Write and test migration scripts
- [ ] Verify backward compatibility

### Phase 2: Core API Endpoints (Week 2)
- [ ] Implement ShiftsService
- [ ] Implement AuditLogsService
- [ ] Implement POST /shifts (open shift)
- [ ] Implement GET /shifts/:id (get shift details)
- [ ] Implement PATCH /shifts/:id/close (close shift)
- [ ] Implement GET /shifts (query shifts)
- [ ] Add Swagger documentation

### Phase 3: Participant Management (Week 2-3)
- [ ] Implement POST /shifts/:id/participants (add participant)
- [ ] Implement DELETE /shifts/:id/participants/:user_id (remove participant)
- [ ] Implement GET /shifts/:id/participants (list participants)
- [ ] Implement POST /shifts/:id/handoff (handoff shift)
- [ ] Add authorization checks
- [ ] Add Swagger documentation

### Phase 4: Transaction Validation (Week 3)
- [ ] Update TransactionsService for participant validation
- [ ] Implement participant status checking
- [ ] Add shift status validation
- [ ] Update transaction submission endpoints
- [ ] Add error handling

### Phase 5: Audit and Metrics (Week 3-4)
- [ ] Implement GET /shifts/:id/audit-log (audit trail)
- [ ] Implement MetricsService
- [ ] Implement GET /shifts/:id/participants/:user_id/metrics (metrics)
- [ ] Add Swagger documentation

### Phase 6: Frontend Updates (Week 4)
- [ ] Update POS page to show all participants
- [ ] Add participant management UI
- [ ] Add shift handoff UI
- [ ] Add performance metrics display
- [ ] Update state management

### Phase 7: Testing and Deployment (Week 4-5)
- [ ] Write unit tests (80%+ coverage)
- [ ] Write property-based tests (all 15 properties)
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Performance testing
- [ ] Staging deployment
- [ ] Production deployment

---

## Backward Compatibility

### Single-Cashier Shift Handling

Existing single-cashier shifts are automatically compatible:

1. **Data Structure**: shift_owner_id maps to original user_id
2. **Participant List**: Single participant with is_owner=true
3. **Transaction Submission**: Works identically to current implementation
4. **Shift Closure**: No additional logic required
5. **Queries**: Returns compatible response structure

### Migration Verification

```typescript
// Verify single-cashier shift compatibility
const oldShift = await shiftsService.getShift(shiftId);
expect(oldShift.participants).toHaveLength(1);
expect(oldShift.participants[0].is_owner).toBe(true);
expect(oldShift.shift_owner_id).toBe(oldShift.participants[0].user_id);
```

---

## Performance Considerations

### Query Optimization

1. **Participant Listing**: Use indexed active participants query
2. **Transaction Counting**: Aggregate at query time or cache
3. **Audit Log Retrieval**: Paginate for large shifts
4. **Metrics Calculation**: Use database aggregation functions

### Database Indexes

```sql
-- Active participants (for transaction validation)
CREATE INDEX idx_shift_participants_active 
  ON shift_participants(shift_id, participant_removed_at) 
  WHERE participant_removed_at IS NULL;

-- Shift queries
CREATE INDEX idx_shifts_outlet_status 
  ON shifts(outlet_id, status);

-- Audit log queries
CREATE INDEX idx_shift_audit_logs_shift_created 
  ON shift_audit_logs(shift_id, created_at DESC);
```

### Caching Strategy

- Cache participant lists (invalidate on add/remove)
- Cache shift details (invalidate on close/handoff)
- Cache metrics (recalculate on transaction submission)

---

## Security Considerations

### Authorization

- All operations verify merchant ownership
- Participant additions verify user belongs to same merchant
- Audit logs accessible only to authorized users
- Metrics visible only to shift participants and managers

### Data Integrity

- Audit logs are immutable (append-only)
- Database constraints prevent invalid states
- Atomic transactions ensure consistency
- Participant removal preserves transaction history

### Audit Trail

- All shift operations logged with user_id and timestamp
- Action details stored as JSONB for extensibility
- Audit logs never deleted (compliance requirement)
- Timestamps in UTC for consistency

