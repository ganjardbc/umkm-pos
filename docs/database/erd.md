# ERD Summary — WisataPOS

## Core Entities

```
merchants
  id, slug, name, phone, address, logo, logo_upload_id
  → outlets (1:N)
  → users (1:N)
  → products (1:N)
  → product_categories (1:N)
  → store_tables (1:N)
  → customer_sessions (1:N)
  → daily_reports (1:N)
  → outlet_product_inventory (1:N)
  → inventory_movements (1:N)

outlets
  id, merchant_id, slug, name, location, is_active, guest_session_secret
  → shifts (1:N)
  → transactions (1:N)
  → user_roles (1:N)
  → store_tables (1:N)
  → customer_sessions (1:N)
  → notifications (1:N)
  → outlet_product_inventory (1:N)
  → inventory_movements (1:N)

users
  id, merchant_id, username, name, email, password_hash, is_active, avatar
  → user_roles (1:N)
  → shifts (as owner) (1:N)
  → shift_participants (1:N)
  → transactions (1:N)
  → notifications (1:N)

products
  id, merchant_id, name, price, cost, stock_qty, category_id, image, upload_id
  → transaction_items (1:N)
  → stock_logs (1:N)
  → outlet_product_inventory (1:N)
  → inventory_movements (1:N)

product_categories
  id, merchant_id, name, description
  → products (1:N)
```

---

## RBAC Entities

```
roles
  id, name, description
  → role_permissions (1:N)
  → user_roles (1:N)

permissions
  id, code, description
  → role_permissions (1:N)

role_permissions
  role_id, permission_id (composite PK)

user_roles
  user_id, role_id, outlet_id (composite PK)
  — outlet-scoped role assignment
```

---

## Transaction Entities

```
transactions
  id, outlet_id, user_id, cashier_id, shift_id
  payment_method, total_amount, cash_received, change_amount
  order_source (pos | customer), order_status
  customer_session_id, table_id
  customer_name_snapshot, customer_phone_snapshot
  is_offline, device_id, is_cancelled
  → transaction_items (1:N)

transaction_items
  id, transaction_id, product_id
  product_name_snapshot, price_snapshot (IMMUTABLE)
  qty, subtotal, customer_note
```

---

## Shift Entities

```
shifts
  id, outlet_id, shift_owner_id, status (open | closed)
  start_time, end_time (nullable until closed)
  → shift_participants (1:N)
  → shift_audit_logs (1:N)
  → transactions (1:N)

shift_participants
  id, shift_id, user_id, is_owner
  participant_added_at, participant_removed_at

shift_audit_logs
  id, shift_id, action, user_id, action_details (JSON)
```

---

## Stock Entities

```
stock_logs
  id, product_id, change_qty, reason, ref_id
  — append-only audit trail

outlet_product_inventory
  id, merchant_id, outlet_id, product_id, stock_qty
  — per-outlet stock level

inventory_movements
  id, merchant_id, outlet_id, product_id
  movement_type, qty, ref_id, note
```

---

## Customer Self-Order Entities

```
store_tables
  id, merchant_id, outlet_id, code, name, capacity, is_active

customer_sessions
  id, merchant_id, outlet_id, session_token (unique), secret_code
  customer_name, customer_phone, selected_table_id
  status (active | expired | completed), expires_at
```

---

## Other Entities

```
uploads
  id, original_name, mime_type, size, s3_key, bucket, uploaded_by_id

notifications
  id, user_id, outlet_id, title, message, type, is_read

daily_reports
  id, merchant_id, outlet_id, report_date
  total_sales, total_transactions
  — unique (merchant_id, outlet_id, report_date)
```
