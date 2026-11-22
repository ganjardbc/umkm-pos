-- Cash tracking on shifts (nullable: old shifts stay NULL)
ALTER TABLE `shifts`
  ADD COLUMN `opening_cash` DECIMAL(14,2) NULL,
  ADD COLUMN `closing_cash` DECIMAL(14,2) NULL,
  ADD COLUMN `expected_cash` DECIMAL(14,2) NULL,
  ADD COLUMN `cash_difference` DECIMAL(14,2) NULL;

-- Shift in which the money was received (differs from shift_id for pay-later orders)
ALTER TABLE `transactions` ADD COLUMN `paid_shift_id` CHAR(36) NULL AFTER `shift_id`;
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_ibfk_paid_shift` FOREIGN KEY (`paid_shift_id`) REFERENCES `shifts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
CREATE INDEX `idx_transactions_paid_shift_id` ON `transactions`(`paid_shift_id`);

-- Backfill (idempotent): already-paid transactions were paid in their own shift
UPDATE `transactions` SET `paid_shift_id` = `shift_id`
WHERE `payment_method` <> 'pending' AND `shift_id` IS NOT NULL AND `paid_shift_id` IS NULL;
