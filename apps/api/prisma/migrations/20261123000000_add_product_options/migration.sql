-- Additive. New tables use the same utf8mb4_unicode_ci as the rest of the schema, which
-- the CHAR(36) foreign keys require. Option groups/options belong to a product and cascade with it.
-- A group is "variant-like" when required + single choice (e.g. Ukuran) and
-- "modifier-like" when optional + multiple (e.g. Topping).
CREATE TABLE `product_option_groups` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `product_id` CHAR(36) NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `is_required` BOOLEAN NOT NULL DEFAULT false,
  `allow_multiple` BOOLEAN NOT NULL DEFAULT false,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  INDEX `idx_option_groups_product` (`product_id`),
  CONSTRAINT `product_option_groups_product_id_fkey` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `product_options` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `group_id` CHAR(36) NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `price_delta` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  INDEX `idx_options_group` (`group_id`),
  CONSTRAINT `product_options_group_id_fkey` FOREIGN KEY (`group_id`)
    REFERENCES `product_option_groups` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- What the customer chose, frozen at sale time: [{option_id, group_name, name, price_delta}].
-- NULL for lines without options. transaction_items.price_snapshot is the unit price
-- INCLUDING these deltas.
ALTER TABLE `transaction_items`
  ADD COLUMN `options_snapshot` JSON NULL AFTER `customer_note`;
