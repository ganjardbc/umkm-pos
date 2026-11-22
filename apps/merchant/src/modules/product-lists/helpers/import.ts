import * as XLSX from 'xlsx';

export interface ImportRow {
  name: string;
  price: number;
  cost?: number;
  category?: string;
  stock_qty?: number;
  min_stock?: number;
}

export const IMPORT_MAX_ROWS = 500;

// Accepted header names (case, spaces and punctuation are ignored)
const HEADERS: Record<string, keyof ImportRow> = {
  nama: 'name', namaproduk: 'name', name: 'name',
  harga: 'price', hargajual: 'price', price: 'price',
  modal: 'cost', hargamodal: 'cost', cost: 'cost',
  kategori: 'category', category: 'category',
  stok: 'stock_qty', stock: 'stock_qty', stockqty: 'stock_qty',
  stokminimum: 'min_stock', minstok: 'min_stock', minstock: 'min_stock',
};

const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z]/g, '');

// "15.000", "Rp 15.000,50", "15000" and real numbers; undefined when blank, NaN when unreadable.
export const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value;
  const text = String(value ?? '').replace(/rp/i, '').replace(/\s/g, '');
  if (!text) return undefined;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(text)) return Number(text.replace(/\./g, '').replace(',', '.'));
  return Number(text.replace(',', '.'));
};

export interface ParsedSheet {
  rows: ImportRow[];
  errors: string[];
}

// Reads the first sheet of a .csv/.xlsx/.xls file. Row numbers in errors assume the header is row 1.
export const parseProductFile = async (file: File): Promise<ParsedSheet> => {
  // raw: keep CSV cells as text; otherwise SheetJS reads "15.000" as the number 15.
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', raw: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  const rows: ImportRow[] = [];
  const errors: string[] = [];
  raw.forEach((record, index) => {
    const mapped: Partial<Record<keyof ImportRow, unknown>> = {};
    for (const [header, value] of Object.entries(record)) {
      const field = HEADERS[normalizeHeader(header)];
      if (field) mapped[field] = value;
    }
    const name = String(mapped.name ?? '').trim();
    const price = toNumber(mapped.price);
    if (!name && price === undefined) return; // blank line

    const line = index + 2;
    const row: ImportRow = { name, price: price as number };
    if (!name) errors.push(`Baris ${line}: nama kosong`);
    if (price === undefined || Number.isNaN(price) || price < 0) errors.push(`Baris ${line}: harga tidak valid`);

    for (const field of ['cost', 'stock_qty', 'min_stock'] as const) {
      const n = toNumber(mapped[field]);
      if (n === undefined) continue;
      const ok = !Number.isNaN(n) && n >= 0 && (field === 'cost' || Number.isInteger(n));
      if (ok) row[field] = n;
      else errors.push(`Baris ${line}: ${field === 'cost' ? 'modal' : 'stok'} tidak valid`);
    }
    const category = String(mapped.category ?? '').trim();
    if (category) row.category = category;
    rows.push(row);
  });

  if (rows.length === 0 && errors.length === 0) errors.push('File kosong atau header tidak dikenali (butuh kolom nama dan harga).');
  if (rows.length > IMPORT_MAX_ROWS) errors.push(`Maksimal ${IMPORT_MAX_ROWS} produk per impor, file ini berisi ${rows.length}.`);
  return { rows, errors };
};

export const downloadTemplate = () => {
  const csv = 'nama,harga,modal,kategori,stok,stok minimum\nKeripik Singkong,15000,9000,Makanan,50,5\n';
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template-impor-produk.csv';
  a.click();
  URL.revokeObjectURL(url);
};
