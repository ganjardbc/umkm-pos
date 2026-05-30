INSERT INTO outlet_product_inventory (
  id,
  merchant_id,
  outlet_id,
  product_id,
  stock_qty,
  min_stock,
  is_active,
  created_at,
  updated_at,
  created_by,
  updated_by
)
SELECT
  uuid(),
  p.merchant_id,
  o.id AS outlet_id,
  p.id AS product_id,
  p.stock_qty,
  p.min_stock,
  p.is_active,
  NOW(),
  NOW(),
  p.created_by,
  p.updated_by
FROM products p
JOIN (
  SELECT o1.merchant_id, o1.id
  FROM outlets o1
  JOIN (
    SELECT merchant_id, MIN(created_at) AS min_created_at
    FROM outlets
    WHERE is_active = 1
    GROUP BY merchant_id
  ) o2 ON o1.merchant_id = o2.merchant_id AND o1.created_at = o2.min_created_at
) o ON o.merchant_id = p.merchant_id
WHERE NOT EXISTS (
  SELECT 1
  FROM outlet_product_inventory opi
  WHERE opi.outlet_id = o.id AND opi.product_id = p.id
);
