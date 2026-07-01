# Multi-Cashier Shifts - Current Implementation Analysis

## Executive Summary

The UMKM POS system currently implements a **single-cashier-per-shift model**. To support multiple concurrent cashiers, significant changes are needed across the database schema, API layer, and frontend components. This document outlines the current state and required modifications.

---

## Current Implementation Analysis

### 1. Database Schema (Prisma)

**Current Shifts Table:**
```prisma
model shifts {
  id           String         @id @default(dbgenerated("(uuid())")) @db.Char(36)
  outlet_id    String         @db.Char(36)
  user_id      String         @db.Char(36)  // ← SINGLE USER ONLY
  start_time   DateTime       @db.Timestamp(0)
  end_time     DateTime?      @db.Timestamp(0)
  status       String         @db.VarChar(50)
  created_at   DateTime       @default(now()) @db.Timestamp(0)
  updated_at   DateTime       @default(now()) @db.Timestamp(0)
  created_by   String?        @db.Char(36)
  updated_by   String?        @db.Char(36)
  outlets      outlets        @relation(...)
  users        users          @relation(...)
  transactions transactions[]
}
```

**Limitation:** The `user_id` field ties each shift to a single user. This prevents multiple cashiers from working in the same shift.

**Required Changes:**
- Remove direct `user_id` from shifts table
- Create `shift_participants` junction table to track multiple users per shift
- Add `shift_owner_id` to identify who opened the shift
- Create `shift_audit_logs` table for tracking all operations

---

### 2. API Layer - Shifts Module

**Current Endpoints:**
- `POST /shifts` - Open shift (single user)
- `GET /shifts` - List shifts (merchant-scoped)
- `GET /shifts/:id` - Get shift details
- `GET /shifts/user/:user_id` - Get user's last shift
- `GET /shifts/outlet/:outlet_id` - Get outlet's last shift
- `PATCH /shifts/:id/close` - Close shift

**Current Validation Logic (shifts.service.ts):**
```typescript
// Prevents user from having multiple open shifts at same outlet
const existingOpen = await this.prisma.shifts.findFirst({
  where: {
    outlet_id: dto.outlet_id,
    user_id: userId,  // ← Single user constraint
    status: 'open',
  },
});
```

**Issues:**
1. No participant management endpoints
2. No shift handoff capability
3. No audit trail tracking
4. No performance metrics per cashier
5. Shift closure doesn't handle multiple participants

**Required New Endpoints:**
- `POST /shifts/:id/participants` - Add cashier to shift
- `DELETE /shifts/:id/participants/:user_id` - Remove cashier from shift
- `GET /shifts/:id/participants` - List shift participants
- `POST /shifts/:id/handoff` - Transfer shift ownership
- `GET /shifts/:id/audit-log` - View shift audit trail
- `GET /shifts/:id/participants/:user_id/metrics` - Get cashier performance

---

### 3. Transaction Validation

**Current Transaction Creation (transactions.service.ts):**
```typescript
async create(dto: CreateTransactionDto, merchantId: string, userId: string) {
  // Validates outlet belongs to merchant
  // Validates products exist and have stock
  // Creates transaction with optional shift_id
  // NO VALIDATION that user is participant in shift
}
```

**Issue:** Transactions don't verify the user is a participant in the specified shift. This needs to be added for multi-cashier support.

**Required Change:**
```typescript
// NEW: Verify user is participant in shift
if (dto.shift_id) {
  const isParticipant = await this.prisma.shift_participants.findFirst({
    where: {
      shift_id: dto.shift_id,
      user_id: userId,
      participant_removed_at: null, // Still active
    },
  });
  if (!isParticipant) {
    throw new ForbiddenException('User is not a participant in this shift');
  }
}
```

---

### 4. Frontend - POS Module

**Current Shift Status Display (pos/pages/index.vue):**
```vue
<span v-if="currentShift.status === ShiftStatus.OPEN">
  {{ currentShift?.users?.name?.split(' ')[0] }}'s in Shift
</span>
```

**Issues:**
1. Shows only single user name
2. No participant list
3. No UI for adding/removing cashiers
4. No performance metrics display
5. Shift open/close buttons only for shift owner

**Required Changes:**
1. Display all active participants
2. Add participant management UI (add/remove)
3. Show individual cashier metrics
4. Add shift handoff UI
5. Update shift status logic for multi-cashier scenarios

---

### 5. Code Guidelines & Patterns

**Observed Patterns in Project:**

1. **DTO Validation:**
   - Uses `class-validator` with decorators
   - All input via DTO
   - Whitelist mode enabled
   - Example: `CreateTransactionDto` with `@IsNotEmpty()`, `@IsUUID()`, etc.

2. **Service Layer:**
   - Thin controllers, business logic in services
   - Merchant-scoped access control
   - Atomic transactions using `prisma.$transaction()`
   - Proper error handling with NestJS exceptions

3. **Error Handling:**
   - `NotFoundException` for missing resources
   - `BadRequestException` for validation failures
   - `UnauthorizedException` for permission issues
   - `ForbiddenException` for access control

4. **API Response Format:**
   ```json
   {
     "success": true,
     "data": { ... }
   }
   ```

5. **Merchant Scoping:**
   - All queries filter by merchant_id
   - Outlet validation before operations
   - User belongs to same merchant check

6. **Swagger Documentation:**
   - All endpoints documented with `@ApiOperation()`, `@ApiResponse()`
   - DTOs documented with `@ApiProperty()`, `@ApiPropertyOptional()`

---

## Database Schema Changes Required

### New Tables

**1. shift_participants (junction table)**
```prisma
model shift_participants {
  id                    String    @id @default(dbgenerated("(uuid())")) @db.Char(36)
  shift_id              String    @db.Char(36)
  user_id               String    @db.Char(36)
  participant_added_at  DateTime  @default(now()) @db.Timestamp(0)
  participant_removed_at DateTime? @db.Timestamp(0)
  is_owner              Boolean   @default(false)
  created_at            DateTime  @default(now()) @db.Timestamp(0)
  updated_at            DateTime  @default(now()) @db.Timestamp(0)
  created_by            String?   @db.Char(36)
  updated_by            String?   @db.Char(36)
  shifts                shifts    @relation(fields: [shift_id], references: [id], onDelete: Cascade)
  users                 users     @relation(fields: [user_id], references: [id], onDelete: NoAction)
  
  @@unique([shift_id, user_id])
  @@index([shift_id])
  @@index([user_id])
}
```

**2. shift_audit_logs (audit trail)**
```prisma
model shift_audit_logs {
  id              String    @id @default(dbgenerated("(uuid())")) @db.Char(36)
  shift_id        String    @db.Char(36)
  action          String    @db.VarChar(50)  // shift_opened, participant_added, etc.
  user_id         String    @db.Char(36)
  action_details  String?   @db.Text
  created_at      DateTime  @default(now()) @db.Timestamp(0)
  shifts          shifts    @relation(fields: [shift_id], references: [id], onDelete: Cascade)
  users           users     @relation(fields: [user_id], references: [id], onDelete: NoAction)
  
  @@index([shift_id])
  @@index([user_id])
  @@index([created_at])
}
```

### Modified Tables

**shifts table changes:**
```prisma
model shifts {
  id              String    @id @default(dbgenerated("(uuid())")) @db.Char(36)
  outlet_id       String    @db.Char(36)
  shift_owner_id  String    @db.Char(36)  // NEW: Who opened the shift
  // REMOVED: user_id (now in shift_participants)
  start_time      DateTime  @db.Timestamp(0)
  end_time        DateTime? @db.Timestamp(0)
  status          String    @db.VarChar(50)
  created_at      DateTime  @default(now()) @db.Timestamp(0)
  updated_at      DateTime  @default(now()) @db.Timestamp(0)
  created_by      String?   @db.Char(36)
  updated_by      String?   @db.Char(36)
  outlets         outlets   @relation(...)
  shift_owner     users     @relation("shift_owner", fields: [shift_owner_id], references: [id])
  participants    shift_participants[]
  audit_logs      shift_audit_logs[]
  transactions    transactions[]
}
```

---

## Implementation Strategy

### Phase 1: Database & Core API
1. Create migration for new tables
2. Update Prisma schema
3. Implement shift participant management endpoints
4. Add audit logging

### Phase 2: Transaction Validation
1. Update transaction creation to verify participant status
2. Add cashier_id tracking to transactions
3. Implement performance metrics calculation

### Phase 3: Frontend Updates
1. Update POS page to show all participants
2. Add participant management UI
3. Implement shift handoff UI
4. Display performance metrics

### Phase 4: Backward Compatibility
1. Ensure existing single-cashier shifts work
2. Add migration for existing shifts
3. Test compatibility

---

## Key Considerations

### 1. Backward Compatibility
- Existing shifts must continue to work
- Single-participant shifts should behave identically
- No breaking changes to existing API responses

### 2. Data Integrity
- Use database-level constraints
- Atomic transactions for all operations
- Prevent race conditions with proper locking

### 3. Performance
- Index shift_participants by shift_id and user_id
- Cache participant lists when possible
- Optimize audit log queries

### 4. Security
- Maintain merchant-scoped access control
- Verify user belongs to same merchant
- Enforce permission checks for all operations

### 5. Audit Trail
- Log all shift operations
- Track participant additions/removals
- Record shift handoffs
- Maintain immutable audit logs

---

## Code Guidelines to Follow

1. **DTOs:** Use class-validator decorators, document with @ApiProperty
2. **Services:** Keep business logic here, use atomic transactions
3. **Controllers:** Thin controllers, delegate to services
4. **Error Handling:** Use appropriate NestJS exceptions
5. **Merchant Scoping:** Always validate outlet belongs to merchant
6. **Swagger:** Document all endpoints and DTOs
7. **Naming:** Follow existing conventions (snake_case for DB, camelCase for code)

