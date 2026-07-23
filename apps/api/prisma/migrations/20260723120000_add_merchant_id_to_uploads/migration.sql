-- AlterTable
ALTER TABLE `uploads` ADD COLUMN `merchant_id` CHAR(36) NULL;

-- CreateIndex
CREATE INDEX `idx_uploads_merchant` ON `uploads`(`merchant_id`);

-- AddForeignKey
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_ibfk_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
