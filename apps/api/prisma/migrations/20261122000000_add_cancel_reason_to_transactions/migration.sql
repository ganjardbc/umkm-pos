-- Additive, nullable: existing cancelled transactions keep NULL (no reason recorded).
ALTER TABLE `transactions`
  ADD COLUMN `cancel_reason` VARCHAR(255) NULL AFTER `is_cancelled`;
