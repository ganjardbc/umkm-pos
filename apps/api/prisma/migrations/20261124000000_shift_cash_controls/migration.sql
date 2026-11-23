-- Additive. Cash-out reason codes, per-outlet daily cash-out limit and auto-close time,
-- and a flag for shifts closed by the system (no counted closing cash in that case).
ALTER TABLE `shift_cash_entries` ADD COLUMN `reason_code` VARCHAR(30) NULL;
ALTER TABLE `outlets`
  ADD COLUMN `cash_out_daily_limit` DECIMAL(14,2) NULL,
  ADD COLUMN `auto_close_time` VARCHAR(5) NULL;
ALTER TABLE `shifts` ADD COLUMN `closed_by_system` TINYINT(1) NOT NULL DEFAULT 0;
