-- Add logo_upload_id FK to merchants
ALTER TABLE merchants
  ADD COLUMN logo_upload_id CHAR(36) NULL,
  ADD INDEX idx_merchants_logo_upload (logo_upload_id),
  ADD CONSTRAINT merchants_ibfk_logo_upload FOREIGN KEY (logo_upload_id) REFERENCES uploads(id) ON DELETE SET NULL;

-- Add logo_upload_id FK to outlets
ALTER TABLE outlets
  ADD COLUMN logo_upload_id CHAR(36) NULL,
  ADD INDEX idx_outlets_logo_upload (logo_upload_id),
  ADD CONSTRAINT outlets_ibfk_logo_upload FOREIGN KEY (logo_upload_id) REFERENCES uploads(id) ON DELETE SET NULL;

-- Add avatar_upload_id FK to users
ALTER TABLE users
  ADD COLUMN avatar_upload_id CHAR(36) NULL,
  ADD INDEX idx_users_avatar_upload (avatar_upload_id),
  ADD CONSTRAINT users_ibfk_avatar_upload FOREIGN KEY (avatar_upload_id) REFERENCES uploads(id) ON DELETE SET NULL;
