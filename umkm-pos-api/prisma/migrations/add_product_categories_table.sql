-- CreateTable product_categories
CREATE TABLE `product_categories` (
    `id` CHAR(36) NOT NULL,
    `merchant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `unique_merchant_category_name`(`merchant_id`, `name`),
    INDEX `idx_product_categories_merchant`(`merchant_id`),
    INDEX `idx_product_categories_active`(`is_active`),
    CONSTRAINT `product_categories_ibfk_1` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
