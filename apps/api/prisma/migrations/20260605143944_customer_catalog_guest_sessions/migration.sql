-- DropForeignKey
ALTER TABLE `customer_sessions` DROP FOREIGN KEY `customer_sessions_ibfk_merchant`;

-- DropForeignKey
ALTER TABLE `customer_sessions` DROP FOREIGN KEY `customer_sessions_ibfk_outlet`;

-- DropForeignKey
ALTER TABLE `customer_sessions` DROP FOREIGN KEY `customer_sessions_ibfk_table`;

-- DropForeignKey
ALTER TABLE `store_tables` DROP FOREIGN KEY `store_tables_ibfk_merchant`;

-- DropForeignKey
ALTER TABLE `store_tables` DROP FOREIGN KEY `store_tables_ibfk_outlet`;

-- AddForeignKey
ALTER TABLE `store_tables` ADD CONSTRAINT `store_tables_merchant_id_fkey` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `store_tables` ADD CONSTRAINT `store_tables_outlet_id_fkey` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customer_sessions` ADD CONSTRAINT `customer_sessions_merchant_id_fkey` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customer_sessions` ADD CONSTRAINT `customer_sessions_outlet_id_fkey` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customer_sessions` ADD CONSTRAINT `customer_sessions_selected_table_id_fkey` FOREIGN KEY (`selected_table_id`) REFERENCES `store_tables`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
