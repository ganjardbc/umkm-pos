-- Cash in / cash out recorded during an open shift (final entries, no update/delete)
CREATE TABLE `shift_cash_entries` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `shift_id` CHAR(36) NOT NULL,
  `type` VARCHAR(10) NOT NULL,
  `amount` DECIMAL(14,2) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `created_by` CHAR(36) NOT NULL,
  `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  CONSTRAINT `shift_cash_entries_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `shift_cash_entries_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE INDEX `idx_shift_cash_entries_shift_id` ON `shift_cash_entries`(`shift_id`);
