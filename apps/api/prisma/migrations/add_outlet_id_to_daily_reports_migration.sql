-- Populate outlet_id from the first outlet of each merchant (if still using default)
UPDATE daily_reports dr
SET outlet_id = (
  SELECT id FROM outlets o 
  WHERE o.merchant_id = dr.merchant_id 
  LIMIT 1
)
WHERE outlet_id = '00000000-0000-0000-0000-000000000000';

-- Add foreign key constraint if it doesn't exist
ALTER TABLE daily_reports ADD CONSTRAINT daily_reports_ibfk_2 
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE ON UPDATE NO ACTION;

-- Add index for better query performance
ALTER TABLE daily_reports ADD INDEX idx_daily_reports_outlet (outlet_id);

-- Update the unique constraint to include outlet_id
ALTER TABLE daily_reports DROP INDEX unique_merchant_date;
ALTER TABLE daily_reports ADD UNIQUE INDEX unique_merchant_outlet_date (merchant_id, outlet_id, report_date);
