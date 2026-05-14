# Data Migration Guide: Multi-Cashier Shifts

## Overview

This migration script transitions the UMKM POS system from single-cashier to multi-cashier shift support. It handles:

1. **Populating shift_owner_id** - Copies existing `user_id` to `shift_owner_id` for all shifts
2. **Creating shift_participants** - Creates one participant record per shift with `is_owner=true`
3. **Creating audit logs** - Adds initial "shift_opened" audit log entries for all shifts
4. **Linking transactions** - Associates existing transactions with their corresponding shifts
5. **Verifying integrity** - Validates data consistency after migration

## Prerequisites

- Database migrations (1.1-1.4) must be applied first
- All new tables (`shift_participants`, `shift_audit_logs`) must exist
- All new columns (`shift_owner_id`, `status`, `shift_id`, `cashier_id`) must exist on their respective tables
- Database connection must be configured via `DATABASE_URL` environment variable

## Running the Migration

### Step 1: Verify Database Migrations

Ensure all Prisma migrations have been applied:

```bash
cd umkm-pos-api
npx prisma migrate deploy
```

### Step 2: Run the Data Migration

Execute the migration script:

```bash
npx ts-node migrations/migrate-existing-shifts.ts
```

### Step 3: Verify Results

The script will output:
- Number of shifts processed
- Number of participants created
- Number of audit logs created
- Number of transactions linked
- Data integrity verification results

Example output:
```
🚀 Starting data migration for multi-cashier shifts...

📋 Step 1: Fetching all shifts...
   Found 150 shifts to migrate

🔄 Step 2: Migrating shifts...
   Processed 150/150 shifts
   ✅ Migrated 150 shifts

🔗 Step 3: Linking transactions to shifts...
   Found 2500 transactions to link
   Linked 2450/2500 transactions
   ✅ Linked 2450 transactions

🔍 Step 4: Verifying data integrity...
   Shifts without owner: 0
   Shifts without participants: 0
   Shifts without "shift_opened" audit log: 0
   Total participants created: 150
   Expected participants: 150
   Total "shift_opened" audit logs: 150
   Expected audit logs: 150
   Unlinked transactions: 50
   Sample single-participant shifts verified: 5

   ✅ Data integrity verification complete

📊 Migration Summary:
   ✅ Shifts processed: 150
   ✅ Participants created: 150
   ✅ Audit logs created: 150
   ✅ Transactions linked: 2450

✨ Migration completed successfully!
```

## What the Migration Does

### 1. Populate shift_owner_id

For each shift, the `user_id` is copied to `shift_owner_id`:

```sql
UPDATE shifts SET shift_owner_id = user_id WHERE shift_owner_id IS NULL;
```

### 2. Create shift_participants

For each shift, a participant record is created with the shift owner:

```sql
INSERT INTO shift_participants (shift_id, user_id, participant_added_at, is_owner, created_at)
SELECT id, user_id, start_time, TRUE, created_at FROM shifts;
```

### 3. Create Audit Logs

For each shift, an initial "shift_opened" audit log is created:

```sql
INSERT INTO shift_audit_logs (shift_id, action, user_id, action_details, created_at)
SELECT id, 'shift_opened', user_id, JSON_OBJECT('migrated', true), created_at FROM shifts;
```

### 4. Link Transactions

For each transaction without a shift_id, find the corresponding shift and link it:

```sql
UPDATE transactions t
SET t.shift_id = (
  SELECT s.id FROM shifts s
  WHERE s.outlet_id = t.outlet_id
  AND s.start_time <= t.created_at
  AND (s.end_time IS NULL OR s.end_time >= t.created_at)
  ORDER BY s.start_time DESC
  LIMIT 1
),
t.cashier_id = t.user_id
WHERE t.shift_id IS NULL;
```

## Data Integrity Checks

The migration verifies:

1. **All shifts have shift_owner_id** - No NULL values
2. **All shifts have at least one participant** - Backward compatibility
3. **All shifts have initial audit log** - Audit trail completeness
4. **Participant count matches shift count** - Consistency
5. **Audit log count matches shift count** - Consistency
6. **Unlinked transactions** - Identifies transactions that couldn't be matched to shifts
7. **Single-participant shifts** - Verifies backward compatibility

## Handling Unlinked Transactions

Some transactions may not be linked if:

- The shift was closed before the transaction was created
- The transaction was created outside of any shift window
- The outlet_id doesn't match any shift

These transactions will have `shift_id = NULL` and `cashier_id = NULL`. They can be:

1. **Manually linked** - If you know which shift they belong to
2. **Ignored** - If they're historical data that shouldn't be linked
3. **Investigated** - To understand why they weren't linked

To find unlinked transactions:

```sql
SELECT * FROM transactions WHERE shift_id IS NULL;
```

## Rollback Procedure

If the migration fails or needs to be rolled back:

### Option 1: Restore from Backup

```bash
# Restore database from backup taken before migration
```

### Option 2: Manual Rollback

If you need to manually undo the migration:

```sql
-- Delete audit logs created by migration
DELETE FROM shift_audit_logs 
WHERE action = 'shift_opened' 
AND action_details->>'migrated' = 'true';

-- Delete shift_participants created by migration
DELETE FROM shift_participants 
WHERE is_owner = true;

-- Clear shift_owner_id
UPDATE shifts SET shift_owner_id = NULL;

-- Unlink transactions
UPDATE transactions SET shift_id = NULL, cashier_id = NULL;
```

## Backward Compatibility

After migration, single-cashier shifts continue to work:

- **shift_owner_id** maps to the original `user_id`
- **shift_participants** contains one record with `is_owner=true`
- **Transactions** are linked to the shift and cashier
- **Audit logs** track the shift opening

Existing API endpoints that reference `user_id` should be updated to use `shift_owner_id` and `shift_participants`.

## Performance Considerations

- **Large datasets**: The migration processes shifts in batches. For 10,000+ shifts, it may take several minutes.
- **Transaction linking**: Linking transactions uses a database query per transaction. For 100,000+ transactions, consider optimizing with batch updates.
- **Database load**: Run during off-peak hours to minimize impact on production systems.

## Troubleshooting

### Error: "DATABASE_URL environment variable is not set"

Ensure the `.env` file contains:
```
DATABASE_URL=mysql://user:password@host:port/database
```

### Error: "Shift with ID ... not found"

This indicates the shift was deleted between fetching and processing. The migration will skip it and continue.

### Error: "Unique constraint violation"

This indicates a participant already exists for the shift. Check if the migration was run previously.

### Unlinked Transactions

If many transactions are unlinked, verify:
- Shifts have correct `start_time` and `end_time`
- Transactions have correct `created_at` timestamps
- Outlet IDs match between shifts and transactions

## Verification Queries

After migration, run these queries to verify:

```sql
-- Check all shifts have owner
SELECT COUNT(*) as shifts_without_owner FROM shifts WHERE shift_owner_id IS NULL;

-- Check all shifts have participants
SELECT COUNT(*) as shifts_without_participants 
FROM shifts s 
WHERE NOT EXISTS (SELECT 1 FROM shift_participants sp WHERE sp.shift_id = s.id);

-- Check participant count
SELECT COUNT(*) as total_participants FROM shift_participants;

-- Check audit logs
SELECT COUNT(*) as total_audit_logs FROM shift_audit_logs WHERE action = 'shift_opened';

-- Check linked transactions
SELECT COUNT(*) as linked_transactions FROM transactions WHERE shift_id IS NOT NULL;

-- Check unlinked transactions
SELECT COUNT(*) as unlinked_transactions FROM transactions WHERE shift_id IS NULL;
```

## Support

If you encounter issues:

1. Check the error message in the migration output
2. Review the troubleshooting section above
3. Verify database connectivity and permissions
4. Check database logs for constraint violations
5. Contact the development team with the migration output

## Next Steps

After successful migration:

1. Deploy updated API endpoints for multi-cashier support
2. Update frontend to display all participants
3. Test backward compatibility with existing shifts
4. Monitor for any data inconsistencies
5. Update documentation for new multi-cashier features
