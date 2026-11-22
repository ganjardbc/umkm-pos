-- Additive. Regular customers registered by staff; transactions.customer_id is optional
-- and set NULL if a customer is deleted (the snapshot name/phone on the transaction stay).
-- phone is unique per merchant when present (MySQL allows several NULLs).
CREATE TABLE `customers` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `merchant_id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `note` VARCHAR(255) NULL,
  `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_merchant_customer_phone` (`merchant_id`, `phone`),
  INDEX `idx_customers_merchant` (`merchant_id`),
  CONSTRAINT `customers_merchant_id_fkey` FOREIGN KEY (`merchant_id`)
    REFERENCES `merchants` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `transactions`
  ADD COLUMN `customer_id` CHAR(36) NULL AFTER `customer_session_id`,
  ADD INDEX `idx_tx_customer` (`customer_id`),
  ADD CONSTRAINT `transactions_ibfk_customer` FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- Permissions: owner/manager/admin manage customers; cashiers can look up and register them.
INSERT IGNORE INTO `permissions` (`id`, `code`, `description`) VALUES
  (UUID(), 'customer.read', 'Read customers'),
  (UUID(), 'customer.create', 'Create customers'),
  (UUID(), 'customer.update', 'Update customers'),
  (UUID(), 'customer.delete', 'Delete customers');

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.`id`, p.`id`
FROM `roles` r
JOIN `permissions` p ON p.`code` IN ('customer.read', 'customer.create', 'customer.update', 'customer.delete')
WHERE r.`name` IN ('owner', 'manager', 'admin');

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.`id`, p.`id`
FROM `roles` r
JOIN `permissions` p ON p.`code` IN ('customer.read', 'customer.create')
WHERE r.`name` = 'cashier';
