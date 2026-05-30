-- Phase 3 cleanup: remove legacy merchant-level stock artifacts.
-- Execute after confirming all reads/writes are cut over to outlet inventory.

-- Drop legacy stock logs table (kept only for pre-cutover compatibility).
DROP TABLE IF EXISTS `stock_logs`;

-- Drop deprecated merchant-level stock columns from products.
ALTER TABLE `products`
  DROP COLUMN `stock_qty`;
