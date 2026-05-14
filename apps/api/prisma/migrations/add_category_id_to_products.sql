-- Add category_id column to products table
ALTER TABLE `products` 
ADD COLUMN `category_id` CHAR(36) NULL AFTER `merchant_id`;

-- Add foreign key constraint to product_categories with SET NULL on delete
ALTER TABLE `products`
ADD CONSTRAINT `products_ibfk_category` 
FOREIGN KEY (`category_id`) 
REFERENCES `product_categories` (`id`) 
ON DELETE SET NULL 
ON UPDATE NO ACTION;

-- Add index on category_id for query performance
CREATE INDEX `idx_products_category` ON `products` (`category_id`);
