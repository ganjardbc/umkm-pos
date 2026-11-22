-- Per-outlet toggle for mandatory cashier shift (default on keeps current behaviour)
ALTER TABLE `outlets` ADD COLUMN `shift_required` TINYINT(1) NOT NULL DEFAULT 1;
