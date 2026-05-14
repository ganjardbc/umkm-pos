-- CreateTable shift_audit_logs
CREATE TABLE `shift_audit_logs` (
    `id` CHAR(36) NOT NULL,
    `shift_id` CHAR(36) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `action_details` JSON,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_shift_audit_logs_shift_id`(`shift_id`),
    INDEX `idx_shift_audit_logs_user_id`(`user_id`),
    INDEX `idx_shift_audit_logs_created_at`(`created_at` DESC),
    CONSTRAINT `shift_audit_logs_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `shift_audit_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `chk_shift_audit_logs_action` CHECK (`action` IN ('shift_opened', 'participant_added', 'participant_removed', 'shift_handoff', 'shift_closed')),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
