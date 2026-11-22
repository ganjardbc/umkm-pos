-- Additive. users.pin_hash holds a bcrypt hash of a 6-digit approval PIN (NULL = no PIN).
ALTER TABLE `users`
  ADD COLUMN `pin_hash` TEXT NULL AFTER `password_hash`;

-- Who cancelled, who approved (same user when the canceller may self-approve), and when.
-- Existing cancelled rows keep NULLs.
ALTER TABLE `transactions`
  ADD COLUMN `cancelled_by` CHAR(36) NULL AFTER `cancel_reason`,
  ADD COLUMN `cancel_approved_by` CHAR(36) NULL AFTER `cancelled_by`,
  ADD COLUMN `cancelled_at` TIMESTAMP(0) NULL AFTER `cancel_approved_by`;

-- New permission for owner/manager/admin. Cashiers keep transaction.cancel but now need
-- a manager's PIN to use it.
INSERT IGNORE INTO `permissions` (`id`, `code`, `description`)
VALUES (UUID(), 'transaction.cancel_approve', 'Approve cancellations with a PIN, and cancel without one');

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.`id`, p.`id`
FROM `roles` r
JOIN `permissions` p ON p.`code` = 'transaction.cancel_approve'
WHERE r.`name` IN ('owner', 'manager', 'admin');
