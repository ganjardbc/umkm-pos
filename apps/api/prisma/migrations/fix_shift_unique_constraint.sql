-- Drop the old unique constraint that includes status
ALTER TABLE shifts DROP INDEX unique_user_open_shift_per_outlet;

-- Create a new unique constraint that only applies when status is 'open'
-- We'll use a partial unique index by creating a generated column
ALTER TABLE shifts ADD COLUMN status_open_key VARCHAR(108) GENERATED ALWAYS AS (
  CASE WHEN status = 'open' THEN CONCAT(outlet_id, '-', shift_owner_id) ELSE NULL END
) STORED UNIQUE;


