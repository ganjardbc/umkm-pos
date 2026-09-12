-- 1. Add nullable column first (existing rows must survive).
ALTER TABLE `notifications` ADD COLUMN `merchant_id` CHAR(36) NULL AFTER `user_id`;

-- 2. Backfill every existing row from the owning user's merchant.
UPDATE `notifications` n
INNER JOIN `users` u ON u.`id` = n.`user_id`
SET n.`merchant_id` = u.`merchant_id`
WHERE n.`merchant_id` IS NULL;

-- 3. Enforce NOT NULL. This step is also the safety check for orphans (see below) --
--    if any row still has merchant_id = NULL, this statement fails and the migration
--    stops here rather than silently succeeding with bad data.
ALTER TABLE `notifications` MODIFY COLUMN `merchant_id` CHAR(36) NOT NULL;

-- 4. FK to merchants, cascade delete, matching the neighbouring merchant_id FKs.
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_3`
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`)
  ON DELETE CASCADE ON UPDATE NO ACTION;

-- 5. Composite index for the new scoped read pattern.
CREATE INDEX `idx_notifications_merchant_user_read`
  ON `notifications` (`merchant_id`, `user_id`, `is_read`);
