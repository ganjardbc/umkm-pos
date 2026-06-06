ALTER TABLE `outlets`
  ADD COLUMN `guest_session_secret` VARCHAR(50) NULL AFTER `location`;

CREATE TABLE `store_tables` (
  `id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `merchant_id` CHAR(36) NOT NULL,
  `outlet_id` CHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `capacity` INT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_outlet_table_code` (`outlet_id`, `code`),
  KEY `idx_store_tables_merchant` (`merchant_id`),
  KEY `idx_store_tables_outlet` (`outlet_id`),
  KEY `idx_store_tables_active` (`is_active`),
  CONSTRAINT `store_tables_ibfk_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `store_tables_ibfk_outlet` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `customer_sessions` (
  `id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `merchant_id` CHAR(36) NOT NULL,
  `outlet_id` CHAR(36) NOT NULL,
  `session_token` VARCHAR(120) NOT NULL,
  `secret_code` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(50) NULL,
  `selected_table_id` CHAR(36) NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'active',
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_customer_session_token` (`session_token`),
  KEY `idx_customer_sessions_merchant` (`merchant_id`),
  KEY `idx_customer_sessions_outlet` (`outlet_id`),
  KEY `idx_customer_sessions_status` (`status`),
  KEY `idx_customer_sessions_expires_at` (`expires_at`),
  CONSTRAINT `customer_sessions_ibfk_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `customer_sessions_ibfk_outlet` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `customer_sessions_ibfk_table` FOREIGN KEY (`selected_table_id`) REFERENCES `store_tables` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `transaction_items`
  ADD COLUMN `customer_note` VARCHAR(255) NULL AFTER `subtotal`;

ALTER TABLE `transactions`
  MODIFY COLUMN `user_id` CHAR(36) NULL,
  MODIFY COLUMN `payment_method` VARCHAR(50) NOT NULL DEFAULT 'pending',
  ADD COLUMN `order_source` VARCHAR(50) NOT NULL DEFAULT 'pos' AFTER `change_amount`,
  ADD COLUMN `order_status` VARCHAR(50) NOT NULL DEFAULT 'selesai' AFTER `order_source`,
  ADD COLUMN `customer_session_id` CHAR(36) NULL AFTER `order_status`,
  ADD COLUMN `table_id` CHAR(36) NULL AFTER `customer_session_id`,
  ADD COLUMN `customer_name_snapshot` VARCHAR(150) NULL AFTER `table_id`,
  ADD COLUMN `customer_phone_snapshot` VARCHAR(50) NULL AFTER `customer_name_snapshot`,
  ADD COLUMN `ordered_at` TIMESTAMP NULL AFTER `customer_phone_snapshot`,
  ADD COLUMN `accepted_at` TIMESTAMP NULL AFTER `ordered_at`,
  ADD COLUMN `processed_at` TIMESTAMP NULL AFTER `accepted_at`,
  ADD COLUMN `served_at` TIMESTAMP NULL AFTER `processed_at`,
  ADD COLUMN `completed_at` TIMESTAMP NULL AFTER `served_at`,
  ADD KEY `idx_tx_order_status` (`order_status`),
  ADD KEY `idx_tx_order_source` (`order_source`),
  ADD KEY `idx_tx_table` (`table_id`),
  ADD KEY `idx_tx_customer_session` (`customer_session_id`),
  ADD CONSTRAINT `transactions_ibfk_customer_session` FOREIGN KEY (`customer_session_id`) REFERENCES `customer_sessions` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `transactions_ibfk_table` FOREIGN KEY (`table_id`) REFERENCES `store_tables` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

UPDATE `outlets`
SET `guest_session_secret` = CASE `slug`
  WHEN 'main-branch' THEN 'DEMO123'
  WHEN 'second-branch' THEN 'DEMO456'
  ELSE `guest_session_secret`
END
WHERE `slug` IN ('main-branch', 'second-branch');
