-- Additive. Lets owner/manager/admin see expected cash while a shift is still open.
-- Cashiers do not get it (blind close); grant it per role from the roles admin if wanted.
INSERT IGNORE INTO `permissions` (`id`, `code`, `description`)
VALUES (UUID(), 'shift.view_expected', 'See expected cash of an open shift');

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.`id`, p.`id`
FROM `roles` r
JOIN `permissions` p ON p.`code` = 'shift.view_expected'
WHERE r.`name` IN ('owner', 'manager', 'admin');
