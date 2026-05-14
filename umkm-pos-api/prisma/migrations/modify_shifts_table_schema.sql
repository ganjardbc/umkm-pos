-- Add shift_owner_id column to shifts table
ALTER TABLE `shifts` ADD COLUMN `shift_owner_id` CHAR(36) NOT NULL AFTER `outlet_id`;

-- Add status column to shifts table
ALTER TABLE `shifts` ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'open' AFTER `shift_owner_id`;

-- Add foreign key constraint for shift_owner_id
ALTER TABLE `shifts` ADD CONSTRAINT `shifts_ibfk_shift_owner` FOREIGN KEY (`shift_owner_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Add unique constraint for (outlet_id, shift_owner_id, status) WHERE status = 'open'
ALTER TABLE `shifts` ADD CONSTRAINT `unique_user_open_shift_per_outlet` UNIQUE KEY (`outlet_id`, `shift_owner_id`, `status`) WHERE `status` = 'open';

-- Add check constraint for status values
ALTER TABLE `shifts` ADD CONSTRAINT `check_status_values` CHECK (`status` IN ('open', 'closed', 'transferred'));

-- Add check constraint for end_time > start_time
ALTER TABLE `shifts` ADD CONSTRAINT `check_end_time_after_start` CHECK (`end_time` IS NULL OR `end_time` > `start_time`);

-- Add indexes
CREATE INDEX `idx_shifts_shift_owner_id` ON `shifts`(`shift_owner_id`);
CREATE INDEX `idx_shifts_status` ON `shifts`(`status`);
CREATE INDEX `idx_shifts_start_time` ON `shifts`(`start_time` DESC);
