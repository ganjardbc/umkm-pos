-- CreateTable
CREATE TABLE `daily_reports` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `merchant_id` CHAR(36) NOT NULL,
    `outlet_id` CHAR(36) NOT NULL,
    `report_date` DATE NOT NULL,
    `total_sales` DECIMAL(14, 2) NOT NULL,
    `total_transactions` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `idx_daily_reports_merchant`(`merchant_id`),
    INDEX `idx_daily_reports_outlet`(`outlet_id`),
    UNIQUE INDEX `unique_merchant_outlet_date`(`merchant_id`, `outlet_id`, `report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `merchants` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `slug` VARCHAR(120) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `address` TEXT NULL,
    `logo` TEXT NULL,
    `logo_upload_id` CHAR(36) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    UNIQUE INDEX `slug`(`slug`),
    INDEX `idx_merchants_logo_upload`(`logo_upload_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outlets` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `merchant_id` CHAR(36) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `location` TEXT NULL,
    `logo` TEXT NULL,
    `logo_upload_id` CHAR(36) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `idx_outlets_merchant`(`merchant_id`),
    INDEX `idx_outlets_logo_upload`(`logo_upload_id`),
    UNIQUE INDEX `unique_merchant_slug`(`merchant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `user_id` CHAR(36) NOT NULL,
    `outlet_id` CHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL DEFAULT 'general',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_notifications_user`(`user_id`),
    INDEX `idx_notifications_outlet`(`outlet_id`),
    INDEX `idx_notifications_is_read`(`is_read`),
    INDEX `idx_notifications_created`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `code` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    UNIQUE INDEX `code`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_categories` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `merchant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `idx_product_categories_merchant`(`merchant_id`),
    INDEX `idx_product_categories_active`(`is_active`),
    UNIQUE INDEX `unique_merchant_category_name`(`merchant_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `merchant_id` CHAR(36) NOT NULL,
    `category_id` CHAR(36) NULL,
    `image_upload_id` CHAR(36) NULL,
    `slug` VARCHAR(120) NOT NULL,
    `thumbnail` TEXT NULL,
    `name` VARCHAR(150) NOT NULL,
    `category` VARCHAR(120) NULL,
    `price` DECIMAL(14, 2) NOT NULL,
    `cost` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `stock_qty` INTEGER NOT NULL DEFAULT 0,
    `min_stock` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `idx_products_active`(`is_active`),
    INDEX `idx_products_merchant`(`merchant_id`),
    INDEX `idx_products_category`(`category_id`),
    UNIQUE INDEX `unique_merchant_slug`(`merchant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outlet_product_inventory` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `merchant_id` CHAR(36) NOT NULL,
    `outlet_id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `stock_qty` INTEGER NOT NULL DEFAULT 0,
    `min_stock` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `idx_outlet_product_inventory_merchant`(`merchant_id`),
    INDEX `idx_outlet_product_inventory_outlet`(`outlet_id`),
    INDEX `idx_outlet_product_inventory_product`(`product_id`),
    UNIQUE INDEX `unique_outlet_product_inventory`(`outlet_id`, `product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_movements` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `merchant_id` CHAR(36) NOT NULL,
    `outlet_id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `change_qty` INTEGER NOT NULL,
    `stock_after` INTEGER NULL,
    `reason` VARCHAR(50) NOT NULL,
    `ref_type` VARCHAR(50) NULL,
    `ref_id` CHAR(36) NULL,
    `note` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `idx_inventory_movements_merchant`(`merchant_id`),
    INDEX `idx_inventory_movements_outlet`(`outlet_id`),
    INDEX `idx_inventory_movements_product`(`product_id`),
    INDEX `idx_inventory_movements_ref`(`ref_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `role_id` CHAR(36) NOT NULL,
    `permission_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `permission_id`(`permission_id`),
    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shifts` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `outlet_id` CHAR(36) NOT NULL,
    `shift_owner_id` CHAR(36) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'open',
    `start_time` TIMESTAMP(0) NOT NULL,
    `end_time` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `idx_shifts_outlet`(`outlet_id`),
    INDEX `idx_shifts_shift_owner_id`(`shift_owner_id`),
    INDEX `idx_shifts_status`(`status`),
    INDEX `idx_shifts_start_time`(`start_time` DESC),
    INDEX `idx_shifts_outlet_owner_status`(`outlet_id`, `shift_owner_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shift_participants` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `shift_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `participant_added_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `participant_removed_at` TIMESTAMP(0) NULL,
    `is_owner` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_shift_participants_shift_id`(`shift_id`),
    INDEX `idx_shift_participants_user_id`(`user_id`),
    INDEX `idx_shift_participants_active`(`shift_id`, `participant_removed_at`),
    UNIQUE INDEX `unique_participant_per_shift`(`shift_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shift_audit_logs` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `shift_id` CHAR(36) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `action_details` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_shift_audit_logs_shift_id`(`shift_id`),
    INDEX `idx_shift_audit_logs_user_id`(`user_id`),
    INDEX `idx_shift_audit_logs_created_at`(`created_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_logs` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `product_id` CHAR(36) NOT NULL,
    `change_qty` INTEGER NOT NULL,
    `reason` VARCHAR(50) NOT NULL,
    `ref_id` CHAR(36) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `idx_stock_logs_product`(`product_id`),
    INDEX `idx_stock_logs_ref`(`ref_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_items` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `transaction_id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NULL,
    `product_name_snapshot` VARCHAR(150) NOT NULL,
    `price_snapshot` DECIMAL(14, 2) NOT NULL,
    `qty` INTEGER NOT NULL,
    `subtotal` DECIMAL(14, 2) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `idx_tx_items_product`(`product_id`),
    INDEX `idx_tx_items_tx`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uploads` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `original_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `size` INTEGER NOT NULL,
    `s3_key` VARCHAR(500) NOT NULL,
    `bucket` VARCHAR(255) NOT NULL,
    `uploaded_by_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_uploads_uploaded_by`(`uploaded_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `outlet_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `shift_id` CHAR(36) NULL,
    `cashier_id` CHAR(36) NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `total_amount` DECIMAL(14, 2) NOT NULL,
    `cash_received` DECIMAL(14, 2) NULL,
    `change_amount` DECIMAL(14, 2) NULL,
    `is_offline` BOOLEAN NOT NULL DEFAULT false,
    `device_id` VARCHAR(120) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `is_cancelled` BOOLEAN NOT NULL DEFAULT false,

    INDEX `idx_tx_cancelled`(`is_cancelled`),
    INDEX `idx_tx_created`(`created_at`),
    INDEX `idx_tx_outlet`(`outlet_id`),
    INDEX `idx_transactions_shift_id`(`shift_id`),
    INDEX `idx_transactions_cashier_id`(`cashier_id`),
    INDEX `idx_tx_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `user_id` CHAR(36) NOT NULL,
    `role_id` CHAR(36) NOT NULL,
    `outlet_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `idx_user_roles_outlet`(`outlet_id`),
    INDEX `idx_user_roles_user`(`user_id`),
    INDEX `role_id`(`role_id`),
    PRIMARY KEY (`user_id`, `role_id`, `outlet_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `merchant_id` CHAR(36) NOT NULL,
    `avatar` TEXT NULL,
    `avatar_upload_id` CHAR(36) NULL,
    `username` VARCHAR(120) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` TEXT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `idx_users_merchant`(`merchant_id`),
    INDEX `idx_users_avatar_upload`(`avatar_upload_id`),
    UNIQUE INDEX `unique_merchant_email`(`merchant_id`, `email`),
    UNIQUE INDEX `unique_merchant_username`(`merchant_id`, `username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `daily_reports` ADD CONSTRAINT `daily_reports_ibfk_1` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `daily_reports` ADD CONSTRAINT `daily_reports_ibfk_2` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `merchants` ADD CONSTRAINT `merchants_ibfk_logo_upload` FOREIGN KEY (`logo_upload_id`) REFERENCES `uploads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outlets` ADD CONSTRAINT `outlets_ibfk_1` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `outlets` ADD CONSTRAINT `outlets_ibfk_logo_upload` FOREIGN KEY (`logo_upload_id`) REFERENCES `uploads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_ibfk_1` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_ibfk_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_ibfk_image_upload` FOREIGN KEY (`image_upload_id`) REFERENCES `uploads`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `outlet_product_inventory` ADD CONSTRAINT `outlet_product_inventory_merchant_id_fkey` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `outlet_product_inventory` ADD CONSTRAINT `outlet_product_inventory_outlet_id_fkey` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `outlet_product_inventory` ADD CONSTRAINT `outlet_product_inventory_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `inventory_movements_merchant_id_fkey` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `inventory_movements_outlet_id_fkey` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `inventory_movements_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shifts` ADD CONSTRAINT `shifts_ibfk_1` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shifts` ADD CONSTRAINT `shifts_ibfk_shift_owner` FOREIGN KEY (`shift_owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shift_participants` ADD CONSTRAINT `shift_participants_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shift_participants` ADD CONSTRAINT `shift_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shift_audit_logs` ADD CONSTRAINT `shift_audit_logs_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shift_audit_logs` ADD CONSTRAINT `shift_audit_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `stock_logs` ADD CONSTRAINT `stock_logs_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_ibfk_cashier` FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_ibfk_3` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_ibfk_avatar_upload` FOREIGN KEY (`avatar_upload_id`) REFERENCES `uploads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

