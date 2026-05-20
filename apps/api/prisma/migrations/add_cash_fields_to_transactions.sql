-- Add cash payment metadata fields to transactions
ALTER TABLE `transactions`
  ADD COLUMN `cash_received` DECIMAL(14,2) NULL AFTER `total_amount`,
  ADD COLUMN `change_amount` DECIMAL(14,2) NULL AFTER `cash_received`;
