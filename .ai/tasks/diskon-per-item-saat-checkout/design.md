# Technical Design Document
## Ticket: diskon-per-item-saat-checkout

---

## 1. Overview & Architecture

Fitur ini mengizinkan kasir pada POS checkout mengaplikasikan diskon manual (berupa persentase `%` atau nominal tetap `Rp`) ke setiap baris item dalam keranjang secara independen sebelum pembayaran final.

Perubahan menyentuh 3 lapisan (multi-app monorepo):
1. **Shared Types (`packages/shared-types`)**: Definisi enum dan tipe diskon item transaksi.
2. **Backend API (`apps/api`)**: Skema database MySQL + Prisma model `transaction_items`, validasi DTO `TransactionItemInputDto`, kalkulasi server-side `prepareTransactionPayload` di `transactions.service.ts`, dan snapshot penyimpanan diskon.
3. **Frontend Web (`apps/web`)**: Pinia store POS (`stores-pos`), antarmuka Cart (`Cart.vue`), PaymentModal, Receipt Preview/Print (`receiptGenerator.ts`, `bluetoothPrinter.ts`), serta halaman detail transaksi (`pages/detail.vue`).

---

## 2. Data Contract & Schema Changes

### 2.1 Database & Prisma (`apps/api/prisma/schema.prisma`)
Tabel `transaction_items` dimutasi dengan penambahan kolom berikut:

```prisma
model transaction_items {
  id                    String       @id @default(dbgenerated("(uuid())")) @db.Char(36)
  transaction_id        String       @db.Char(36)
  product_id            String?      @db.Char(36)
  product_name_snapshot String       @db.VarChar(150)
  price_snapshot        Decimal      @db.Decimal(14, 2)
  qty                   Int
  discount_type         String?      @db.VarChar(20) // 'percentage' | 'fixed' | null
  discount_value        Decimal?     @db.Decimal(14, 2) // e.g. 10.00 (%) or 5000.00 (Rp)
  discount_amount       Decimal      @default(0.00) @db.Decimal(14, 2) // actual monetary cut in Rp
  subtotal              Decimal      @db.Decimal(14, 2) // (price_snapshot * qty) - discount_amount
  customer_note         String?      @db.VarChar(255)
  created_at            DateTime     @default(now()) @db.Timestamp(0)
  updated_at            DateTime     @default(now()) @db.Timestamp(0)
  created_by            String?      @db.Char(36)
  updated_by            String?      @db.Char(36)
  transactions          transactions @relation(fields: [transaction_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "transaction_items_ibfk_1")
  products              products?    @relation(fields: [product_id], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "transaction_items_ibfk_2")

  @@index([product_id], map: "idx_tx_items_product")
  @@index([transaction_id], map: "idx_tx_items_tx")
}
```

### 2.2 Shared Types (`packages/shared-types/src/index.ts` / `products/product.types.ts`)
```typescript
export type DiscountType = 'percentage' | 'fixed';

export interface TransactionItemDiscount {
  discount_type?: DiscountType | null;
  discount_value?: number | null;
  discount_amount?: number;
}
```

### 2.3 Backend DTO (`apps/api/src/transactions/dto/create-transaction.dto.ts`)
```typescript
export class TransactionItemInputDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440031', description: 'Product ID' })
  @IsNotEmpty()
  @IsUUID()
  product_id: string;

  @ApiProperty({ example: 2, description: 'Quantity ordered (must be > 0)' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  qty: number;

  @ApiPropertyOptional({ example: 'percentage', enum: ['percentage', 'fixed'] })
  @IsOptional()
  @IsIn(['percentage', 'fixed'])
  discount_type?: 'percentage' | 'fixed' | null;

  @ApiPropertyOptional({ example: 10, description: 'Discount value (percentage 0-100 or fixed nominal)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_value?: number | null;

  @ApiPropertyOptional({ example: 'Tanpa sambal' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customer_note?: string;
}
```

---

## 3. Mathematical Invariants & Calculation Logic

Untuk setiap baris item $i$:
1. $\text{Gross Subtotal}_i = \text{price\_snapshot}_i \times \text{qty}_i$
2. Jika $\text{discount\_type} = \text{'percentage'}$:
   - Validasi: $0 \le \text{discount\_value} \le 100$
   - $\text{discount\_amount}_i = \text{round}\left(\text{Gross Subtotal}_i \times \frac{\text{discount\_value}}{100}, 2\right)$
3. Jika $\text{discount\_type} = \text{'fixed'}$:
   - Validasi: $0 \le \text{discount\_value} \le \text{Gross Subtotal}_i$
   - $\text{discount\_amount}_i = \text{discount\_value}$
4. Jika tidak ada diskon:
   - $\text{discount\_amount}_i = 0$
5. $\text{subtotal}_i = \text{Gross Subtotal}_i - \text{discount\_amount}_i$
6. $\text{Total Transaksi} = \sum_{i} \text{subtotal}_i$

---

## 4. Frontend Component & State Design

### 4.1 Pinia Store (`stores-pos`)
- State `CartItem`:
  ```typescript
  export interface CartItem {
    id: string;
    name: string;
    price: string;
    quantity: number;
    stock_qty: number;
    thumbnail: string | null;
    category: string;
    discount_type?: 'percentage' | 'fixed' | null;
    discount_value?: number | null;
  }
  ```
- Action:
  - `setItemDiscount(id: string, discount_type: 'percentage' | 'fixed' | null, discount_value: number | null)`
  - `removeItemDiscount(id: string)`
- Getters:
  - `getItemGrossTotal(item)` $\rightarrow \text{price} \times \text{qty}$
  - `getItemDiscountAmount(item)` $\rightarrow \text{calculated discount in Rp}$
  - `getItemSubtotal(item)` $\rightarrow \text{gross} - \text{discount}$
  - `cartTotal` $\rightarrow \sum \text{getItemSubtotal(item)}$

### 4.2 UI Interactions
1. **Cart List**:
   - Di samping kontrol qty, tampilkan tombol aksi "% Diskon" / icon tag diskon.
   - Jika diskon aktif: tampilkan badge potongan (cth. `Disc 10% (-Rp 2.500)`), harga asli tercoret, dan subtotal bersih.
2. **Discount Dialog / Popover**:
   - Tab switch: `Persentase (%)` vs `Nominal (Rp)`.
   - Input number dengan instant reactive preview: Potongan (Rp) dan Subtotal Baru (Rp).
   - Validasi inline jika nominal > subtotal atau % > 100%.
   - Tombol "Terapkan" dan tombol "Hapus Diskon".
3. **Receipt & Print**:
   - Jika `discount_amount > 0`, cetak baris `- Diskon (X% / Rp Y): -Rp Z` di bawah item pada receipt generator, receipt preview modal, dan thermal bluetooth printer.
4. **Detail Page (`/transaction/detail/:id`)**:
   - Tabel rincian item menampilkan kolom `Harga Asli`, `Diskon`, dan `Subtotal`.

---

## 5. Security, Multi-tenancy & Boundary Conditions

1. **Multi-tenant Isolation**: Backend tetap memvalidasi produk milik `merchant_id` yang sedang login.
2. **Tamper Proofing**: Backend tidak mempercayai `discount_amount` atau `subtotal` kiriman client; backend SELALU menghitung ulang `discount_amount` dan `subtotal` berdasarkan `price` terdaftar di database dan `discount_value`.
3. **Immutability Snapshot**: Diskon yang tersimpan di `transaction_items` bersifat snapshot historis permanen.
