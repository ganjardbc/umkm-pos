export const isLowStock = (product: any) =>
  Number(product?.min_stock) > 0 && Number(product?.stock_qty) <= Number(product?.min_stock);
