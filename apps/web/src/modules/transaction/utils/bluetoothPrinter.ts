import type { ReceiptData } from './receiptGenerator';

// Common printer service UUIDs
const PRINTER_SERVICES = [
  '0000ffe0-0000-1000-8000-00805f9b34fb', // FFE0 (very common for cheap ESC/POS printers)
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Bluetooth SIG Printing Service
  '49535343-fe7d-4158-9337-136a15203892', // ISSC SPP
  '00001101-0000-1000-8000-00805f9b34fb', // SPP UUID
];

// Cache active connection objects in module scope so they don't get deep-proxied by Vue
let activeDevice: any = null;
let activeCharacteristic: any = null;

export const isBluetoothSupported = (): boolean => {
  return typeof window !== 'undefined' && 'bluetooth' in navigator;
};

export const getConnectedDeviceName = (): string | null => {
  if (activeDevice && activeDevice.gatt?.connected) {
    return activeDevice.name || 'Unnamed Printer';
  }
  return null;
};

export const isPrinterConnected = (): boolean => {
  return !!(activeDevice && activeDevice.gatt?.connected && activeCharacteristic);
};

export const disconnectPrinter = async (): Promise<void> => {
  if (activeDevice) {
    try {
      if (activeDevice.gatt?.connected) {
        activeDevice.gatt.disconnect();
      }
    } catch (e) {
      console.error('Error disconnecting printer:', e);
    }
  }
  activeDevice = null;
  activeCharacteristic = null;
};

export const connectPrinter = async (): Promise<string> => {
  if (!isBluetoothSupported()) {
    throw new Error('Bluetooth is not supported in this browser.');
  }

  try {
    // Request any Bluetooth device, but specify optional services to access them
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: PRINTER_SERVICES,
    });

    if (!device) {
      throw new Error('No device selected');
    }

    activeDevice = device;

    // Listen to disconnect event
    device.addEventListener('gattserverdisconnected', () => {
      console.log('Bluetooth printer disconnected');
      activeCharacteristic = null;
    });

    const server = await device.gatt.connect();

    // Scan for write characteristic in common services
    let charFound: any = null;

    for (const serviceUuid of PRINTER_SERVICES) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            charFound = char;
            break;
          }
        }
        if (charFound) {
          console.log(`Found write characteristic in service ${serviceUuid}`);
          break;
        }
      } catch (err) {
        console.warn(`Service ${serviceUuid} not found or inaccessible:`, err);
      }
    }

    if (!charFound) {
      // Fallback: try to find ANY service and characteristics if none of standard matched
      try {
        const services = await server.getPrimaryServices();
        for (const service of services) {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              charFound = char;
              break;
            }
          }
          if (charFound) break;
        }
      } catch (fallbackErr) {
        console.error('Fallback service discovery failed:', fallbackErr);
      }
    }

    if (!charFound) {
      throw new Error('Could not find a writeable characteristic on the device');
    }

    activeCharacteristic = charFound;
    return device.name || 'Unnamed Printer';
  } catch (error) {
    await disconnectPrinter();
    throw error;
  }
};

// Check for already authorized devices (optional gesture-free reconnection)
export const getPairedDevices = async (): Promise<any[]> => {
  if (!isBluetoothSupported() || !(navigator as any).bluetooth.getDevices) {
    return [];
  }
  try {
    const devices = await (navigator as any).bluetooth.getDevices();
    return devices;
  } catch (e) {
    console.error('Error fetching paired devices:', e);
    return [];
  }
};

// Reconnect to a previously paired device
export const reconnectDevice = async (device: any): Promise<string> => {
  try {
    activeDevice = device;
    const server = await device.gatt.connect();
    
    // Find service & characteristic
    let charFound: any = null;
    for (const serviceUuid of PRINTER_SERVICES) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            charFound = char;
            break;
          }
        }
        if (charFound) break;
      } catch (err) {
        // Ignore and try next
      }
    }

    if (!charFound) {
      throw new Error('Write characteristic not found');
    }

    activeCharacteristic = charFound;
    return device.name || 'Unnamed Printer';
  } catch (err) {
    await disconnectPrinter();
    throw err;
  }
};

// Writer helper that sends bytes in chunks to prevent printer buffer overflows
const writeDataInChunks = async (data: Uint8Array): Promise<void> => {
  if (!activeCharacteristic) {
    throw new Error('Printer is not connected.');
  }

  const CHUNK_SIZE = 20; // 20 bytes is standard MTU limit for BLE
  const DELAY_MS = 15;   // Delay between chunks

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    if (activeCharacteristic.properties.writeWithoutResponse) {
      await activeCharacteristic.writeValueWithoutResponse(chunk);
    } else {
      await activeCharacteristic.writeValue(chunk);
    }
    // Sleep a bit
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }
};

// ESC/POS Command Encoder helper
class ESCPOSEncoder {
  private buffer: number[] = [];

  constructor() {}

  initialize() {
    this.buffer.push(0x1B, 0x40);
    return this;
  }

  alignLeft() {
    this.buffer.push(0x1B, 0x61, 0x00);
    return this;
  }

  alignCenter() {
    this.buffer.push(0x1B, 0x61, 0x01);
    return this;
  }

  alignRight() {
    this.buffer.push(0x1B, 0x61, 0x02);
    return this;
  }

  bold(enabled: boolean) {
    this.buffer.push(0x1B, 0x45, enabled ? 0x01 : 0x00);
    return this;
  }

  doubleSize(enabled: boolean) {
    this.buffer.push(0x1D, 0x21, enabled ? 0x11 : 0x00); // 0x11 = double height + double width
    return this;
  }

  text(str: string) {
    // Normalise and filter to ASCII-compatible characters
    const cleanStr = str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/\u00a0/g, ' ')         // non-breaking space
      .replace(/[^\x20-\x7E\n\r]/g, ''); // ASCII printable only
    const encoder = new TextEncoder();
    const bytes = encoder.encode(cleanStr);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  line(str: string = '') {
    this.text(str);
    this.buffer.push(0x0A);
    return this;
  }

  lineFeed(lines: number = 1) {
    this.buffer.push(0x1B, 0x64, lines);
    return this;
  }

  getBuffer(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

// Format a key-value row (e.g. left aligned item name/key, right aligned price/value)
const formatRow = (key: string, value: string, columns: number): string => {
  const spaces = columns - key.length - value.length;
  if (spaces <= 0) {
    // Key is too long to fit key and value on same line
    // Truncate key or wrap. Wrapping key:
    const maxKeyLen = columns - value.length - 2;
    if (maxKeyLen > 3) {
      const truncatedKey = key.slice(0, maxKeyLen) + '..';
      const remSpaces = columns - truncatedKey.length - value.length;
      return truncatedKey + ' '.repeat(remSpaces > 0 ? remSpaces : 1) + value;
    }
    return key + '\n' + ' '.repeat(columns - value.length) + value;
  }
  return key + ' '.repeat(spaces) + value;
};

// Main printing formatting functions
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
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0';
  return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
};

export const printTestPage = async (): Promise<void> => {
  const encoder = new ESCPOSEncoder();
  encoder.initialize();
  encoder.alignCenter();
  encoder.bold(true);
  encoder.line('WISATA POS');
  encoder.bold(false);
  encoder.line('Bluetooth Printer Test');
  encoder.line('--------------------------------');
  encoder.alignLeft();
  encoder.line('Status: Connected');
  encoder.line(`Date: ${new Date().toLocaleString()}`);
  encoder.line('--------------------------------');
  encoder.alignCenter();
  encoder.bold(true);
  encoder.line('SUCCESS!');
  encoder.bold(false);
  encoder.lineFeed(4); // spacing

  const buffer = encoder.getBuffer();
  await writeDataInChunks(buffer);
};

export const printReceipt = async (transaction: ReceiptData, paperSize: '58mm' | '80mm' = '58mm'): Promise<void> => {
  const columns = paperSize === '80mm' ? 48 : 32;
  const encoder = new ESCPOSEncoder();
  
  encoder.initialize();
  
  // Header
  encoder.alignCenter();
  encoder.bold(true);
  encoder.line(transaction.outlets?.name || 'UMKM OUTLET');
  encoder.bold(false);
  if (transaction.outlets?.location) {
    encoder.line(transaction.outlets.location);
  }
  encoder.line(`Receipt #${transaction.id?.slice(0, 8).toUpperCase()}`);
  encoder.line('-'.repeat(columns));
  
  // Transaction Info
  encoder.alignLeft();
  encoder.line(formatRow('Date:', formatDate(transaction.created_at), columns));
  encoder.line(formatRow('Time:', formatTime(transaction.created_at), columns));
  if (transaction.users?.name) {
    encoder.line(formatRow('Cashier:', transaction.users.name, columns));
  }
  encoder.line(formatRow('Payment:', transaction.payment_method.toUpperCase(), columns));
  encoder.line('-'.repeat(columns));
  
  // Items Header
  if (columns === 48) {
    encoder.line(formatRow('Item', 'Total', columns));
    encoder.line('-'.repeat(columns));
  }
  
  // Items List
  const items = transaction.transaction_items || [];
  for (const item of items) {
    // Print item name
    encoder.line(item.product_name_snapshot);
    
    // Print qty x price and item total
    const leftText = `  ${item.qty}x ${formatCurrency(item.price_snapshot)}`;
    const rightText = formatCurrency(item.subtotal);
    encoder.line(formatRow(leftText, rightText, columns));
  }
  encoder.line('-'.repeat(columns));
  
  // Totals
  encoder.bold(true);
  encoder.line(formatRow('Total Amount:', formatCurrency(transaction.total_amount), columns));
  encoder.bold(false);
  
  if (transaction.payment_method === 'cash') {
    if (transaction.cash_received !== null && transaction.cash_received !== undefined) {
      encoder.line(formatRow('Cash Paid:', formatCurrency(transaction.cash_received), columns));
    }
    if (transaction.change_amount !== null && transaction.change_amount !== undefined) {
      encoder.line(formatRow('Change:', formatCurrency(transaction.change_amount), columns));
    }
  }
  
  if (transaction.is_offline) {
    encoder.line(formatRow('Mode:', 'OFFLINE', columns));
  }
  if (transaction.is_cancelled) {
    encoder.bold(true);
    encoder.line(formatRow('Status:', 'CANCELLED', columns));
    encoder.bold(false);
  }
  encoder.line('-'.repeat(columns));
  
  // Footer
  encoder.alignCenter();
  encoder.line('Thank you for your purchase!');
  if (transaction.outlets?.name) {
    encoder.line(transaction.outlets.name);
  }
  encoder.lineFeed(4); // Feed paper so the user can tear it off

  const buffer = encoder.getBuffer();
  await writeDataInChunks(buffer);
};
