-- Migration: Add uploads table and product image association
-- Description: Add S3 file upload support

-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
    id CHAR(36) NOT NULL DEFAULT (uuid()),
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INT NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    bucket VARCHAR(255) NOT NULL,
    uploaded_by_id CHAR(36) NOT NULL,
    created_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_uploads_uploaded_by (uploaded_by_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add image_upload_id to products table
ALTER TABLE products
    ADD COLUMN image_upload_id CHAR(36) NULL AFTER category_id,
    ADD INDEX idx_products_image_upload (image_upload_id),
    ADD CONSTRAINT products_ibfk_image_upload
        FOREIGN KEY (image_upload_id) REFERENCES uploads(id)
        ON DELETE SET NULL ON UPDATE NO ACTION;
