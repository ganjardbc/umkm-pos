-- =========================================
-- WISATAPOS — PRODUCTION SQL SCHEMA (MYSQL)
-- MySQL 8 • Multi-tenant • Multi-outlet • RBAC
-- =========================================

-- =========================================
-- MERCHANTS
-- =========================================
CREATE TABLE merchants (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  logo TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- OUTLETS
-- =========================================
CREATE TABLE outlets (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  merchant_id CHAR(36) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(150) NOT NULL,
  location TEXT,
  logo TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  UNIQUE KEY unique_merchant_slug (merchant_id, slug),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  INDEX idx_outlets_merchant (merchant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- USERS
-- =========================================
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  merchant_id CHAR(36) NOT NULL,
  avatar TEXT,
  username VARCHAR(120) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  UNIQUE KEY unique_merchant_username (merchant_id, username),
  UNIQUE KEY unique_merchant_email (merchant_id, email),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  INDEX idx_users_merchant (merchant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- PRODUCTS
-- =========================================
CREATE TABLE products (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  merchant_id CHAR(36) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  thumbnail TEXT,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(120),
  price DECIMAL(14,2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(14,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
  stock_qty INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  UNIQUE KEY unique_merchant_slug (merchant_id, slug),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  INDEX idx_products_merchant (merchant_id),
  INDEX idx_products_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- SHIFTS
-- =========================================
CREATE TABLE shifts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  outlet_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_shifts_outlet (outlet_id),
  INDEX idx_shifts_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- TRANSACTIONS
-- =========================================
CREATE TABLE transactions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  outlet_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  shift_id CHAR(36),
  payment_method VARCHAR(50) NOT NULL,
  total_amount DECIMAL(14,2) NOT NULL CHECK (total_amount >= 0),
  is_offline BOOLEAN NOT NULL DEFAULT FALSE,
  is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  device_id VARCHAR(120),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  FOREIGN KEY (outlet_id) REFERENCES outlets(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (shift_id) REFERENCES shifts(id),
  INDEX idx_tx_outlet (outlet_id),
  INDEX idx_tx_user (user_id),
  INDEX idx_tx_shift (shift_id),
  INDEX idx_tx_created (created_at),
  INDEX idx_tx_cancelled (is_cancelled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- TRANSACTION ITEMS
-- =========================================
CREATE TABLE transaction_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  transaction_id CHAR(36) NOT NULL,
  product_id CHAR(36),
  product_name_snapshot VARCHAR(150) NOT NULL,
  price_snapshot DECIMAL(14,2) NOT NULL CHECK (price_snapshot >= 0),
  qty INT NOT NULL CHECK (qty > 0),
  subtotal DECIMAL(14,2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_tx_items_tx (transaction_id),
  INDEX idx_tx_items_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- STOCK LOGS
-- =========================================
CREATE TABLE stock_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_id CHAR(36) NOT NULL,
  change_qty INT NOT NULL,
  reason VARCHAR(50) NOT NULL,
  ref_id CHAR(36),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_stock_logs_product (product_id),
  INDEX idx_stock_logs_ref (ref_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- DAILY REPORTS (CACHE TABLE)
-- =========================================
CREATE TABLE daily_reports (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  merchant_id CHAR(36) NOT NULL,
  report_date DATE NOT NULL,
  total_sales DECIMAL(14,2) NOT NULL,
  total_transactions INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  UNIQUE KEY unique_merchant_date (merchant_id, report_date),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  INDEX idx_daily_reports_merchant (merchant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- RBAC TABLES
-- =========================================

CREATE TABLE roles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
  role_id CHAR(36) NOT NULL,
  permission_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
  user_id CHAR(36) NOT NULL,
  role_id CHAR(36) NOT NULL,
  outlet_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  PRIMARY KEY (user_id, role_id, outlet_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  INDEX idx_user_roles_user (user_id),
  INDEX idx_user_roles_outlet (outlet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
