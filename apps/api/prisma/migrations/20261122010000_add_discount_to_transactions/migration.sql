-- Additive. `total_amount` stays the amount actually payable (after discount),
-- so reports and shift cash totals are unchanged. Subtotal = total_amount + discount_amount.
-- Existing rows get discount_amount = 0 and NULL type/value.
ALTER TABLE `transactions`
  ADD COLUMN `discount_type` VARCHAR(10) NULL AFTER `change_amount`,
  ADD COLUMN `discount_value` DECIMAL(14,2) NULL AFTER `discount_type`,
  ADD COLUMN `discount_amount` DECIMAL(14,2) NOT NULL DEFAULT 0 AFTER `discount_value`;

-- New permission, granted to existing owner/manager/admin roles.
-- Cashiers do not get it; grant it per role from the roles admin if wanted.
INSERT IGNORE INTO `permissions` (`id`, `code`, `description`)
VALUES (UUID(), 'transaction.discount', 'Give discounts on transactions (POS)');

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.`id`, p.`id`
FROM `roles` r
JOIN `permissions` p ON p.`code` = 'transaction.discount'
WHERE r.`name` IN ('owner', 'manager', 'admin');
