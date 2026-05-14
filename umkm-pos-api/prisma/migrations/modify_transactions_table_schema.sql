-- Add cashier_id column to transactions table
ALTER TABLE `transactions` ADD COLUMN `cashier_id` CHAR(36) AFTER `shift_id`;

-- Add foreign key constraint for cashier_id
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_ibfk_cashier` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Add indexes on shift_id and cashier_id
CREATE INDEX `idx_transactions_shift_id` ON `transactions`(`shift_id`);
CREATE INDEX `idx_transactions_cashier_id` ON `transactions`(`cashier_id`);
