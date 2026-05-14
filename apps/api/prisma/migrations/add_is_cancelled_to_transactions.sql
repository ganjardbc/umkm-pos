-- Add is_cancelled column to transactions table
ALTER TABLE transactions ADD COLUMN is_cancelled BOOLEAN DEFAULT false;
ALTER TABLE transactions ADD INDEX idx_tx_cancelled (is_cancelled);
