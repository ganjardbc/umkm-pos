export interface ReceiptData {
  id: string;
  outlets?: {
    name: string;
    location: string;
  };
  users?: {
    name: string;
  };
  created_at: string;
  payment_method: string;
  total_amount: string | number;
  is_offline: boolean;
  is_cancelled: boolean;
  transaction_items: Array<{
    id: string;
    product_name_snapshot: string;
    price_snapshot: string | number;
    qty: number;
    subtotal: string | number;
  }>;
}

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseInt(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};

export const generateReceiptHTML = (transaction: ReceiptData): string => {
  return `
    <div style="
      font-family: 'Courier New', monospace;
      width: 480px;
      padding: 24px;
      background-color: #ffffff;
      color: #000;
    ">
      <!-- Header -->
      <div style="
        text-align: center;
        margin-bottom: 8px;
        padding-bottom: 24px;
        border-bottom: 2px dashed #ccc;
      ">
        <h2 style="
          font-size: 18px;
          font-weight: bold;
          margin: 0;
          color: #111;
        ">${transaction?.outlets?.name || ''}</h2>
        <p style="
          font-size: 12px;
          color: #666;
          margin: 4px 0 0 0;
        ">${transaction?.outlets?.location || ''}</p>
        <p style="
          font-size: 12px;
          color: #999;
          margin: 8px 0 0 0;
        ">Receipt #${transaction?.id?.slice(0, 8).toUpperCase()}</p>
      </div>

      <!-- Transaction Info -->
      <div style="
        font-size: 12px;
        color: #555;
        margin-bottom: 16px;
        line-height: 1.6;
      ">
        <div style="display: flex; justify-content: space-between;">
          <span>Date:</span>
          <span>${formatDate(transaction?.created_at)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Time:</span>
          <span>${formatTime(transaction?.created_at)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Cashier:</span>
          <span>${transaction?.users?.name || ''}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Payment:</span>
          <span style="text-transform: capitalize;">${transaction?.payment_method || ''}</span>
        </div>
      </div>

      <!-- Items Header -->
      <div style="
        font-size: 12px;
        font-weight: bold;
        color: #111;
        padding-bottom: 16px;
        display: grid;
        grid-template-columns: 1fr 0.5fr 0.5fr 0.5fr;
        gap: 4px;
      ">
        <div>Item</div>
        <div style="text-align: right;">Qty</div>
        <div style="text-align: right;">Price</div>
        <div style="text-align: right;">Total</div>
      </div>

      <!-- Items -->
      <div style="
        font-size: 12px;
        color: #555;
        margin-bottom: 8px;
        padding-bottom: 16px;
        border-bottom: 2px dashed #ccc;
      ">
        ${(transaction?.transaction_items || [])
          .map(
            (item) => `
          <div style="
            display: grid;
            grid-template-columns: 1fr 0.5fr 0.5fr 0.5fr;
            gap: 4px;
            margin-bottom: 8px;
          ">
            <div style="height: 24px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.product_name_snapshot}</div>
            <div style="text-align: right;">${item.qty}x</div>
            <div style="text-align: right;">${formatCurrency(item.price_snapshot)}</div>
            <div style="text-align: right; font-weight: bold;">${formatCurrency(item.subtotal)}</div>
          </div>
        `
          )
          .join('')}
      </div>

      <!-- Total -->
      <div style="
        margin-bottom: 8px;
        padding-bottom: 24px;
        border-bottom: 2px dashed #ccc;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-weight: bold;
          color: #111;
        ">
          <span>Total Amount:</span>
          <span>${formatCurrency(transaction?.total_amount)}</span>
        </div>
        ${
          transaction?.is_offline
            ? `
          <div style="
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #d97706;
            font-weight: bold;
            margin-top: 8px;
          ">
            <span>Mode:</span>
            <span>OFFLINE</span>
          </div>
        `
            : ''
        }
        ${
          transaction?.is_cancelled
            ? `
          <div style="
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #dc2626;
            font-weight: bold;
            margin-top: 8px;
          ">
            <span>Status:</span>
            <span>CANCELLED</span>
          </div>
        `
            : ''
        }
      </div>

      <!-- Footer -->
      <div style="
        text-align: center;
        padding-bottom: 24px;
      ">
        <p style="
          font-size: 12px;
          color: #666;
          margin: 0;
        ">Thank you for your purchase!</p>
        <p style="
          font-size: 12px;
          color: #999;
          margin: 8px 0 0 0;
        ">${transaction?.outlets?.name || ''}</p>
      </div>
    </div>
  `;
};
