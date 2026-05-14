# Data Migrations

This directory contains data migration scripts for the UMKM POS system.

## Available Migrations

### 1. migrate-existing-shifts.ts

**Purpose**: Migrate existing single-cashier shifts to multi-cashier model

**What it does**:
- Populates `shift_owner_id` from existing `user_id` for all shifts
- Creates `shift_participants` records for each existing shift (one participant per shift with `is_owner=true`)
- Creates initial `shift_audit_logs` entries with action "shift_opened" for all existing shifts
- Links existing transactions to shifts (populate `shift_id` and `cashier_id`)
- Verifies data integrity after migration

**Requirements**:
- Database migrations (1.1-1.4) must be applied first
- All new tables and columns must exist
- Database connection configured via `DATABASE_URL`

**Usage**:
```bash
npx ts-node migrations/migrate-existing-shifts.ts
```

**Output**: Detailed migration report with statistics and verification results

## Migration Scripts

### migrate-existing-shifts.ts
Main migration script that handles the transition from single-cashier to multi-cashier shifts.

### migrate-existing-shifts.test.ts
Test suite for verifying the migration. Run with:
```bash
npm test -- migrations/migrate-existing-shifts.test.ts
```

### verify-migration.ts
Post-migration verification script. Run after migration to ensure data integrity:
```bash
npx ts-node migrations/verify-migration.ts
```

## Migration Process

### Step 1: Apply Database Migrations

Ensure all Prisma migrations are applied:
```bash
npx prisma migrate deploy
```

### Step 2: Run Data Migration

Execute the migration script:
```bash
npx ts-node migrations/migrate-existing-shifts.ts
```

### Step 3: Verify Results

Run the verification script:
```bash
npx ts-node migrations/verify-migration.ts
```

### Step 4: Review Output

Check the migration report for:
- Number of shifts processed
- Number of participants created
- Number of audit logs created
- Number of transactions linked
- Data integrity verification results

## Migration Details

### What Gets Migrated

#### 1. Shift Owner Population
```
For each shift:
  shift_owner_id = user_id
```

#### 2. Participant Creation
```
For each shift:
  Create shift_participant with:
    - shift_id = shift.id
    - user_id = shift.user_id
    - participant_added_at = shift.start_time
    - is_owner = true
```

#### 3. Audit Log Creation
```
For each shift:
  Create shift_audit_log with:
    - shift_id = shift.id
    - action = 'shift_opened'
    - user_id = shift.user_id
    - action_details = { migrated: true }
    - created_at = shift.created_at
```

#### 4. Transaction Linking
```
For each transaction without shift_id:
  Find matching shift where:
    - outlet_id matches
    - start_time <= transaction.created_at
    - end_time >= transaction.created_at (or end_time is null)
  
  Update transaction with:
    - shift_id = matching_shift.id
    - cashier_id = transaction.user_id
```

## Data Integrity Checks

The migration verifies:

1. ✅ All shifts have `shift_owner_id` populated
2. ✅ All shifts have at least one participant
3. ✅ All shifts have initial audit log
4. ✅ Participant count matches shift count
5. ✅ Audit log count matches shift count
6. ✅ `shift_owner_id` matches owner participant `user_id`
7. ✅ All owner participants have `is_owner=true`
8. ✅ No duplicate participants per shift
9. ✅ Participant timestamps are valid
10. ✅ Audit log actions are valid
11. ✅ Transactions are linked to shifts
12. ✅ Linked transactions have `cashier_id`
13. ✅ Transaction `shift_id` references valid shifts
14. ✅ No orphaned `shift_participants`
15. ✅ No orphaned `shift_audit_logs`
16. ✅ Backward compatibility maintained

## Handling Issues

### Unlinked Transactions

Some transactions may not be linked if:
- The shift was closed before the transaction was created
- The transaction was created outside of any shift window
- The outlet_id doesn't match any shift

To find unlinked transactions:
```sql
SELECT * FROM transactions WHERE shift_id IS NULL;
```

### Migration Failures

If the migration fails:

1. **Check error message** - Review the output for specific errors
2. **Verify database** - Ensure all tables and columns exist
3. **Check permissions** - Verify database user has necessary permissions
4. **Review logs** - Check database logs for constraint violations

### Rollback

To rollback the migration:

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

## Performance Considerations

- **Large datasets**: For 10,000+ shifts, migration may take several minutes
- **Transaction linking**: Uses one query per transaction; optimize for 100,000+ transactions
- **Database load**: Run during off-peak hours
- **Backup**: Always backup database before running migration

## Verification Queries

After migration, verify with these queries:

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

## Next Steps

After successful migration:

1. Deploy updated API endpoints for multi-cashier support
2. Update frontend to display all participants
3. Test backward compatibility with existing shifts
4. Monitor for any data inconsistencies
5. Update documentation for new multi-cashier features

## Support

For issues or questions:

1. Review the MIGRATION_GUIDE.md for detailed information
2. Check the troubleshooting section
3. Review migration output for specific errors
4. Contact the development team with migration output

## Files

- `migrate-existing-shifts.ts` - Main migration script
- `migrate-existing-shifts.test.ts` - Test suite
- `verify-migration.ts` - Verification script
- `MIGRATION_GUIDE.md` - Detailed migration guide
- `README.md` - This file
