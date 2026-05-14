-- CreateTable shift_participants
CREATE TABLE `shift_participants` (
    `id` CHAR(36) NOT NULL,
    `shift_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `participant_added_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `participant_removed_at` TIMESTAMP(0) NULL,
    `is_owner` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `unique_participant_per_shift`(`shift_id`, `user_id`),
    INDEX `idx_shift_participants_shift_id`(`shift_id`),
    INDEX `idx_shift_participants_user_id`(`user_id`),
    INDEX `idx_shift_participants_active`(`shift_id`, `participant_removed_at`) WHERE `participant_removed_at` IS NULL,
    CONSTRAINT `shift_participants_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `shift_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `check_removed_after_added` CHECK (`participant_removed_at` IS NULL OR `participant_removed_at` >= `participant_added_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
