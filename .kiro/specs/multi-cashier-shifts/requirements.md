# Requirements Document: Multi-Cashier Shift Support

## Introduction

The UMKM POS system currently supports only single cashier operations per shift. The shifts table has a direct `user_id` field that ties each shift to one user, and transactions don't validate that users are participants in shifts. This feature extends the system to enable multiple concurrent cashiers to operate within the same shift at an outlet, while maintaining individual transaction tracking, performance metrics, and proper audit trails. This enhancement allows merchants to scale their operations and manage multiple staff members during peak hours.

## Current State Analysis

**Database:** Shifts table currently has `user_id` field (single user only)  
**API:** No participant management endpoints exist  
**Transactions:** No validation that user is a shift participant  
**Frontend:** POS page shows only single cashier name  
**Audit Trail:** No logging of shift operations  

This feature requires:
- New `shift_participants` junction table for multiple users per shift
- New `shift_audit_logs` table for operation tracking
- Modified shifts table to use `shift_owner_id` instead of `user_id`
- New API endpoints for participant and audit management
- Updated transaction validation
- Enhanced POS UI for multi-cashier display

## Glossary

- **Shift**: A time-bounded operational period during which cashiers process transactions at an outlet
- **Cashier**: A user assigned to process transactions during a shift
- **Outlet**: A physical or logical location where transactions occur
- **Shift Participant**: A cashier actively assigned to a shift
- **Shift Owner**: The cashier who initially opened the shift
- **Shift Handoff**: The process of transferring shift responsibility from one cashier to another
- **Transaction**: A sales or payment record linked to a specific cashier and shift
- **Merchant**: The business entity that owns outlets and manages shifts
- **Shift Status**: The current state of a shift (open, closed, paused, transferred)
- **Concurrent Shift**: Multiple shifts operating simultaneously at the same outlet
- **Audit Trail**: A chronological record of all shift operations and state changes

## Requirements

### Requirement 1: Open Multi-Cashier Shift

**User Story:** As a shift manager, I want to open a shift that can accommodate multiple cashiers, so that my team can process transactions concurrently during operating hours.

#### Acceptance Criteria

1. WHEN a shift is opened via POST /shifts with valid outlet_id, THE Shift_Service SHALL create a new shift with status "open"
2. WHEN a shift is opened, THE Shift_Service SHALL assign the requesting user as the shift_owner_id and add them as the initial participant
3. WHEN a shift is opened, THE Shift_Service SHALL record the shift start_time in UTC timezone
4. WHEN a shift is opened, THE Shift_Service SHALL create an audit log entry with action "shift_opened"
5. WHEN a shift is opened at an outlet that already has an open shift, THE Shift_Service SHALL allow the new shift to be created (supporting concurrent shifts per outlet)
6. WHEN a shift is opened, THE Shift_Service SHALL prevent the same user from having multiple open shifts at the same outlet (existing constraint maintained)
7. IF the requesting user lacks permission for the outlet, THEN THE Shift_Service SHALL return a 403 Forbidden error
8. IF the outlet_id does not exist or belongs to a different merchant, THEN THE Shift_Service SHALL return a 404 Not Found error

### Requirement 2: Add Cashier to Active Shift

**User Story:** As a shift manager, I want to add additional cashiers to an active shift, so that more team members can process transactions concurrently.

#### Acceptance Criteria

1. WHEN a POST request is made to /shifts/:id/participants with a valid user_id, THE Shift_Service SHALL add the user as a shift participant
2. WHEN a cashier is added to a shift, THE Shift_Service SHALL record the participant_added_at timestamp
3. WHEN a cashier is added to a shift, THE Shift_Service SHALL create an audit log entry with action "participant_added"
4. IF the shift status is not "open", THEN THE Shift_Service SHALL return a 400 Bad Request error with message "Cannot add participants to a closed shift"
5. IF the user_id is already a participant in the shift, THEN THE Shift_Service SHALL return a 409 Conflict error with message "User is already a participant in this shift"
6. IF the user_id does not exist or does not belong to the merchant, THEN THE Shift_Service SHALL return a 404 Not Found error
7. IF the requesting user is not the shift owner or a manager, THEN THE Shift_Service SHALL return a 403 Forbidden error

### Requirement 3: Remove Cashier from Active Shift

**User Story:** As a shift manager, I want to remove a cashier from an active shift, so that I can manage staffing changes during the day.

#### Acceptance Criteria

1. WHEN a DELETE request is made to /shifts/:id/participants/:user_id, THE Shift_Service SHALL remove the user from shift participants
2. WHEN a cashier is removed from a shift, THE Shift_Service SHALL record the participant_removed_at timestamp
3. WHEN a cashier is removed from a shift, THE Shift_Service SHALL create an audit log entry with action "participant_removed"
4. IF the shift has only one participant and that participant is being removed, THEN THE Shift_Service SHALL return a 400 Bad Request error with message "Cannot remove the last participant from an open shift"
5. IF the user_id is not a participant in the shift, THEN THE Shift_Service SHALL return a 404 Not Found error
6. IF the requesting user is not the shift owner or a manager, THEN THE Shift_Service SHALL return a 403 Forbidden error
7. WHILE a cashier is removed from a shift, THE Shift_Service SHALL preserve all transactions previously created by that cashier

### Requirement 4: List Active Shift Participants

**User Story:** As a shift manager, I want to view all cashiers currently assigned to a shift, so that I can monitor staffing and make adjustments.

#### Acceptance Criteria

1. WHEN a GET request is made to /shifts/:id/participants, THE Shift_Service SHALL return a list of all current participants
2. THE Shift_Service SHALL include for each participant: user_id, user_name, participant_added_at, and is_owner flag
3. WHEN participants are listed, THE Shift_Service SHALL order them by participant_added_at in ascending order
4. IF the shift does not exist or belongs to a different merchant, THEN THE Shift_Service SHALL return a 404 Not Found error
5. IF the requesting user lacks permission to view the shift, THEN THE Shift_Service SHALL return a 403 Forbidden error

### Requirement 5: Submit Transaction with Multi-Cashier Support

**User Story:** As a cashier, I want to submit transactions that are properly attributed to me and my current shift, so that my performance can be tracked accurately.

#### Acceptance Criteria

1. WHEN a transaction is submitted via POST /transactions with a valid shift_id, THE Transaction_Service SHALL verify the requesting user is an active participant in the specified shift
2. WHEN a transaction is submitted, THE Transaction_Service SHALL link the transaction to the requesting user (cashier_id) and the specified shift
3. WHEN a transaction is submitted, THE Transaction_Service SHALL record the user_id, shift_id, and transaction_timestamp
4. WHEN a transaction is submitted, THE Transaction_Service SHALL validate all products exist and have sufficient stock (existing behavior)
5. IF the requesting user is not an active participant in the specified shift, THEN THE Transaction_Service SHALL return a 403 Forbidden error with message "User is not a participant in this shift"
6. IF the shift_id does not exist or is closed, THEN THE Transaction_Service SHALL return a 400 Bad Request error with message "Shift is not available for transactions"
7. IF the shift belongs to a different outlet or merchant, THEN THE Transaction_Service SHALL return a 403 Forbidden error
8. IF a participant was removed from the shift, THE Transaction_Service SHALL reject new transactions from that user for that shift

### Requirement 6: Close Multi-Cashier Shift

**User Story:** As a shift manager, I want to close a shift that has multiple cashiers, so that I can finalize the day's operations and generate reports.

#### Acceptance Criteria

1. WHEN a PATCH request is made to /shifts/:id/close, THE Shift_Service SHALL set the shift status to "closed"
2. WHEN a shift is closed, THE Shift_Service SHALL record the end_time in UTC timezone
3. WHEN a shift is closed, THE Shift_Service SHALL create an audit log entry with action "shift_closed" and closed_by user_id
4. WHEN a shift is closed, THE Shift_Service SHALL mark all participants as removed (set participant_removed_at timestamp)
5. IF the shift status is already "closed", THEN THE Shift_Service SHALL return a 400 Bad Request error with message "Shift is already closed"
6. IF the requesting user is not the shift owner or a manager, THEN THE Shift_Service SHALL return a 403 Forbidden error
7. WHILE a shift is being closed, THE Shift_Service SHALL preserve all transactions and participant history for audit purposes
8. WHEN a shift is closed, THE Shift_Service SHALL prevent any new transactions from being added to that shift

### Requirement 7: Handoff Shift Between Cashiers

**User Story:** As a cashier, I want to transfer shift responsibility to another cashier, so that I can end my shift while operations continue.

#### Acceptance Criteria

1. WHEN a POST request is made to /shifts/:id/handoff with a valid target_user_id, THE Shift_Service SHALL transfer shift ownership to the target user
2. WHEN a shift is handed off, THE Shift_Service SHALL record the handoff_timestamp, from_user_id, and to_user_id
3. WHEN a shift is handed off, THE Shift_Service SHALL create an audit log entry with action "shift_handoff"
4. WHEN a shift is handed off, THE Shift_Service SHALL remove the previous owner from participants if requested
5. IF the target_user_id is not a participant in the shift, THEN THE Shift_Service SHALL return a 400 Bad Request error with message "Target user must be a participant in the shift"
6. IF the requesting user is not the current shift owner, THEN THE Shift_Service SHALL return a 403 Forbidden error with message "Only the shift owner can initiate a handoff"
7. IF the shift status is not "open", THEN THE Shift_Service SHALL return a 400 Bad Request error with message "Cannot handoff a closed shift"

### Requirement 8: Retrieve Shift Details with Participants

**User Story:** As a shift manager, I want to view complete shift information including all participants and their transaction counts, so that I can monitor shift performance.

#### Acceptance Criteria

1. WHEN a GET request is made to /shifts/:id, THE Shift_Service SHALL return shift details including: id, outlet_id, status, start_time, end_time, shift_owner_id, and participants array
2. THE Shift_Service SHALL include for each participant: user_id, user_name, participant_added_at, participant_removed_at (if applicable), and transaction_count
3. WHEN shift details are retrieved, THE Shift_Service SHALL calculate transaction_count for each participant from the transactions table
4. IF the shift does not exist, THEN THE Shift_Service SHALL return a 404 Not Found error
5. IF the requesting user lacks permission to view the shift, THEN THE Shift_Service SHALL return a 403 Forbidden error

### Requirement 9: Query Shifts with Filtering and Pagination

**User Story:** As a merchant, I want to query shifts with filters for date range, outlet, and status, so that I can analyze operational data.

#### Acceptance Criteria

1. WHEN a GET request is made to /shifts with query parameters, THE Shift_Service SHALL support filtering by: outlet_id, status, start_date, end_date, and user_id
2. WHEN shifts are queried, THE Shift_Service SHALL support pagination with limit and offset parameters
3. WHEN shifts are queried, THE Shift_Service SHALL return results ordered by start_time in descending order
4. THE Shift_Service SHALL include in each result: id, outlet_id, status, start_time, end_time, shift_owner_id, participant_count, and total_transactions
5. IF the requesting user is not a merchant or lacks permission, THEN THE Shift_Service SHALL return a 403 Forbidden error
6. IF invalid query parameters are provided, THEN THE Shift_Service SHALL return a 400 Bad Request error with details about invalid parameters

### Requirement 10: Audit Trail for Shift Operations

**User Story:** As a compliance officer, I want to view a complete audit trail of all shift operations, so that I can ensure accountability and detect irregularities.

#### Acceptance Criteria

1. WHEN a GET request is made to /shifts/:id/audit-log, THE Audit_Service SHALL return all audit log entries for the shift
2. THE Audit_Service SHALL include for each entry: timestamp, action, user_id, user_name, and action_details
3. WHEN audit logs are retrieved, THE Audit_Service SHALL support actions: "shift_opened", "participant_added", "participant_removed", "shift_handoff", "shift_closed"
4. WHEN audit logs are retrieved, THE Audit_Service SHALL order entries by timestamp in ascending order
5. IF the shift does not exist, THEN THE Audit_Service SHALL return a 404 Not Found error
6. IF the requesting user lacks permission to view audit logs, THEN THE Audit_Service SHALL return a 403 Forbidden error

### Requirement 11: Backward Compatibility with Single-Cashier Shifts

**User Story:** As a system administrator, I want existing single-cashier shifts to continue functioning without modification, so that the system remains stable during the transition.

#### Acceptance Criteria

1. WHEN an existing shift with a single participant is queried, THE Shift_Service SHALL return it with compatible structure (shift_owner_id maps to original user_id)
2. WHEN transactions are submitted to a single-participant shift, THE Transaction_Service SHALL process them identically to the current implementation
3. WHEN a single-participant shift is closed, THE Shift_Service SHALL close it without requiring additional participant removal logic
4. WHEN existing shifts are migrated, THE Migration_Service SHALL create shift_participants records for each existing shift's user_id
5. WHILE the system operates, THE Shift_Service SHALL support both single and multi-cashier shifts simultaneously
6. WHEN querying shifts via GET /shifts/outlet/:outlet_id, THE Shift_Service SHALL return the most recent shift (existing behavior maintained)

### Requirement 12: Prevent Concurrent Shift Conflicts

**User Story:** As a system administrator, I want to ensure that shift operations maintain data integrity, so that transaction records remain accurate and auditable.

#### Acceptance Criteria

1. WHEN a user attempts to open a shift while already having an open shift at the same outlet, THE Shift_Service SHALL return a 409 Conflict error with message "User already has an open shift at this outlet"
2. WHEN a transaction is submitted, THE Transaction_Service SHALL verify the shift is still open and the user is still an active participant (participant_removed_at is null)
3. IF a participant is removed from a shift while transactions are being submitted, THE Transaction_Service SHALL reject new transactions from that user for that shift
4. WHEN a shift is closed, THE Shift_Service SHALL prevent any new transactions from being added to that shift (status check)
5. IF concurrent requests attempt to modify the same shift simultaneously, THE Shift_Service SHALL use database-level constraints to ensure consistency
6. WHEN checking participant status, THE Shift_Service SHALL verify participant_removed_at is null to confirm active status

### Requirement 13: Merchant-Scoped Access Control

**User Story:** As a merchant, I want to ensure that only my staff can access my shifts and transactions, so that my business data remains secure.

#### Acceptance Criteria

1. WHEN any shift operation is performed, THE Authorization_Service SHALL verify the outlet belongs to the requesting merchant
2. WHEN a user is added as a participant, THE Authorization_Service SHALL verify the user belongs to the same merchant
3. IF a user from a different merchant attempts to access a shift, THEN THE Authorization_Service SHALL return a 403 Forbidden error
4. WHEN shift data is queried, THE Authorization_Service SHALL filter results to only include shifts from the requesting merchant's outlets
5. THE Authorization_Service SHALL enforce these checks at the API layer before any database operations

### Requirement 14: Shift Participant Performance Metrics

**User Story:** As a shift manager, I want to view performance metrics for each cashier during a shift, so that I can identify top performers and areas for improvement.

#### Acceptance Criteria

1. WHEN a GET request is made to /shifts/:id/participants/:user_id/metrics, THE Metrics_Service SHALL return performance data for that participant
2. THE Metrics_Service SHALL include: transaction_count, total_amount, average_transaction_amount, and participation_duration_minutes
3. WHEN metrics are calculated, THE Metrics_Service SHALL only count transactions where the participant was active in the shift
4. IF the participant was removed from the shift, THE Metrics_Service SHALL calculate metrics only for the time period they were active
5. IF the user_id is not a participant in the shift, THEN THE Metrics_Service SHALL return a 404 Not Found error

### Requirement 15: Validate Shift State Transitions

**User Story:** As a system administrator, I want to ensure shifts transition through valid states, so that the system maintains data integrity.

#### Acceptance Criteria

1. WHEN a shift operation is performed, THE Shift_Service SHALL validate the current shift status allows the operation
2. THE Shift_Service SHALL enforce these valid transitions: open → closed, open → transferred (via handoff)
3. IF an invalid state transition is attempted, THEN THE Shift_Service SHALL return a 400 Bad Request error with message "Invalid state transition"
4. WHEN a shift is in "closed" state, THE Shift_Service SHALL reject all participant modifications and transaction submissions
5. WHEN a shift is in "transferred" state, THE Shift_Service SHALL allow the new owner to continue operations

## Acceptance Criteria Testing Strategy

### Property-Based Testing Approach

The following properties should be verified through property-based testing:

1. **Invariant: Participant Consistency**
   - After any shift operation, the set of participants should be consistent with the audit trail
   - Property: `participants_from_audit_log(shift) == current_participants(shift)`

2. **Invariant: Transaction Attribution**
   - Every transaction must be attributed to a user who was an active participant at the time of transaction
   - Property: `for all transactions in shift, transaction.user_id in active_participants_at(transaction.created_at)`

3. **Invariant: Shift Closure**
   - Once a shift is closed, no new transactions can be added
   - Property: `if shift.status == "closed", then no transactions with created_at > shift.end_time`

4. **Round-Trip Property: Audit Trail Reconstruction**
   - Replaying the audit trail should reconstruct the exact shift state
   - Property: `replay_audit_log(shift.audit_logs) == current_shift_state(shift)`

5. **Idempotence: Participant Listing**
   - Querying participants multiple times returns the same result
   - Property: `list_participants(shift) == list_participants(shift)` (when no modifications occur)

6. **Metamorphic Property: Transaction Count**
   - Total transaction count should equal sum of individual participant counts
   - Property: `sum(participant.transaction_count for all participants) == shift.total_transactions`

---

## Implementation Guidelines

### Code Patterns to Follow

**1. DTO Validation (class-validator)**
```typescript
export class AddParticipantDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440021' })
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
```

**2. Service Layer (Business Logic)**
- Keep controllers thin, delegate to services
- Use `prisma.$transaction()` for atomic operations
- Validate merchant ownership before operations
- Create audit log entries for all state changes

**3. Error Handling (NestJS Exceptions)**
- `NotFoundException` - Resource not found
- `BadRequestException` - Validation failure
- `UnauthorizedException` - Outlet doesn't belong to merchant
- `ForbiddenException` - User lacks permission

**4. Merchant Scoping**
- All queries must filter by merchant_id
- Validate outlet belongs to merchant before operations
- Verify user belongs to same merchant when adding participants

**5. API Response Format**
```json
{
  "success": true,
  "data": { ... }
}
```

**6. Swagger Documentation**
- Document all endpoints with @ApiOperation()
- Document all responses with @ApiResponse()
- Document all DTOs with @ApiProperty()

### Database Constraints

**New Tables Required:**

1. **shift_participants** - Junction table
   - Unique constraint: (shift_id, user_id)
   - Indexes: shift_id, user_id
   - Tracks: participant_added_at, participant_removed_at, is_owner

2. **shift_audit_logs** - Audit trail
   - Indexes: shift_id, user_id, created_at
   - Immutable records
   - Actions: shift_opened, participant_added, participant_removed, shift_handoff, shift_closed

**Modified Tables:**

1. **shifts** - Replace user_id with shift_owner_id
   - Foreign key to users table
   - Relationship to shift_participants
   - Relationship to shift_audit_logs

