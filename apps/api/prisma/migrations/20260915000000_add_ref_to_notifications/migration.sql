-- Additive, nullable: existing notifications keep NULL refs and fall back to
-- the list page on the frontend. `ref_type` names the referenced entity
-- (e.g. 'transaction', 'shift') and `ref_id` is its id, so a notification can
-- deep-link to that entity's detail page.
ALTER TABLE `notifications`
  ADD COLUMN `ref_type` VARCHAR(40) NULL AFTER `type`,
  ADD COLUMN `ref_id` CHAR(36) NULL AFTER `ref_type`;
