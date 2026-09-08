<template>
  <Dialog
    v-model:visible="visibility"
    modal
    group="headless"
    class="receipt-modal w-120"
  >
    <template #header>
      <h1 class="text-xl font-semibold">
        Cetak Struk
      </h1>
    </template>

    <div class="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
      <ReceiptPreview :transaction="selected" />

      <!-- Bluetooth Printer Section -->
      <div v-if="isSupported" class="mt-2 border border-gray-200 dark:border-dark-secondary rounded-lg p-4 bg-gray-50 dark:bg-dark-secondary">
        <div class="flex items-center justify-between cursor-pointer select-none" @click="showSettings = !showSettings">
          <div class="flex items-center gap-2">
            <i class="pi pi-print text-gray-500 dark:text-gray-400" />
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">Printer Termal Bluetooth</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="isConnected" class="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              {{ deviceName }}
            </span>
            <i :class="['pi', showSettings ? 'pi-chevron-up' : 'pi-chevron-down', 'text-xs text-gray-400']" />
          </div>
        </div>

        <div v-if="showSettings" class="mt-3 space-y-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <!-- Printer Status & Actions -->
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-500 dark:text-gray-400">Status Koneksi:</span>
            <span v-if="isConnected" class="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
              Terhubung
            </span>
            <span v-else-if="isConnecting" class="text-yellow-600 dark:text-yellow-400 font-semibold flex items-center gap-1">
              Menghubungkan...
            </span>
            <span v-else class="text-gray-400 dark:text-gray-500">Terputus</span>
          </div>

          <div class="flex gap-2">
            <Button
              v-if="!isConnected"
              label="Pasangkan & Hubungkan"
              icon="pi pi-plus"
              size="small"
              class="flex-1 text-xs"
              @click="handleConnect"
              :loading="isConnecting"
            />
            <Button
              v-else
              label="Putuskan Koneksi"
              icon="pi pi-power-off"
              severity="danger"
              size="small"
              class="flex-1 text-xs animate-fade-in"
              @click="handleDisconnect"
            />
            <Button
              label="Uji Cetak"
              icon="pi pi-file"
              severity="secondary"
              size="small"
              class="text-xs"
              :disabled="!isConnected"
              @click="handlePrintTest"
              :loading="isPrintingTest"
            />
          </div>

          <!-- Paper Size Selection -->
          <div class="flex flex-col gap-1.5">
            <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Pengaturan Lebar Kertas:</span>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                :class="[
                  'px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center',
                  paperSize === '58mm'
                    ? 'bg-primary/10 border-primary text-primary dark:bg-primary-500/20 dark:border-primary-400 dark:text-primary-300'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-dark! dark:border-gray-700 dark:text-gray-400 dark:hover:bg-dark-secondary'
                ]"
                @click="setPaperSize('58mm')"
              >
                58mm (Kecil)
              </button>
              <button
                type="button"
                :class="[
                  'px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center',
                  paperSize === '80mm'
                    ? 'bg-primary/10 border-primary text-primary dark:bg-primary-500/20 dark:border-primary-400 dark:text-primary-300'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-dark! dark:border-gray-700 dark:text-gray-400 dark:hover:bg-dark-secondary'
                ]"
                @click="setPaperSize('80mm')"
              >
                80mm (Lebar)
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="mt-2 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-3 bg-yellow-50 dark:bg-yellow-950/20 text-xs text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
        <i class="pi pi-exclamation-triangle mt-0.5 shrink-0" />
        <div>
          Pencetakan Bluetooth tidak didukung pada peramban ini. Silakan gunakan peramban berbasis Chromium (Chrome, Edge, Opera) melalui koneksi HTTPS yang aman.
        </div>
      </div>
    </div>

    <template #footer>
      <!-- Footer -->
      <div class="w-full flex flex-col gap-4">
        <Button
          v-if="isSupported"
          severity="success"
          label="Cetak Struk (Bluetooth)"
          icon="pi pi-print"
          size="medium"
          fluid
          @click="handlePrint"
          :loading="isPrinting"
        />
        <Button
          label="Download Gambar Struk"
          icon="pi pi-download"
          severity="secondary"
          size="medium"
          fluid
          @click="downloadReceipt"
          :loading="isDownloading"
        />
        <Button
          severity="secondary"
          variant="outlined"
          label="Tutup"
          size="medium"
          fluid
          @click="onCancel"
        />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import html2canvas from 'html2canvas';
import ReceiptPreview from './ReceiptPreview.vue';
import { generateReceiptHTML, type ReceiptData } from '../utils/receiptGenerator';
import { showToast } from '@/helpers/toast';
import {
  isBluetoothSupported,
  isPrinterConnected,
  getConnectedDeviceName,
  connectPrinter,
  disconnectPrinter,
  printReceipt,
  printTestPage
} from '../utils/bluetoothPrinter';

const emits = defineEmits(['cancel']);

const props = defineProps({
  selected: {
    type: Object as () => ReceiptData,
    required: true,
    default: () => ({}),
  }
})

const visibility = defineModel<boolean>("visibility", {
  required: true
});

const isDownloading = ref(false);
const isSupported = ref(false);
const isConnected = ref(false);
const deviceName = ref<string | null>(null);
const paperSize = ref<'58mm' | '80mm'>('58mm');
const showSettings = ref(false);
const isConnecting = ref(false);
const isPrinting = ref(false);
const isPrintingTest = ref(false);

onMounted(() => {
  isSupported.value = isBluetoothSupported();
  isConnected.value = isPrinterConnected();
  deviceName.value = getConnectedDeviceName();
  
  // Load paper size preference
  const savedSize = localStorage.getItem('printer_paper_size');
  if (savedSize === '58mm' || savedSize === '80mm') {
    paperSize.value = savedSize;
  }
});

const setPaperSize = (size: '58mm' | '80mm') => {
  paperSize.value = size;
  localStorage.setItem('printer_paper_size', size);
};

const handleConnect = async () => {
  if (isConnecting.value) return;
  try {
    isConnecting.value = true;
    const name = await connectPrinter();
    deviceName.value = name;
    isConnected.value = true;
    showToast({
      type: 'success',
      title: 'Printer Terhubung',
      message: `Berhasil terhubung ke ${name}`,
    });
  } catch (error: any) {
    console.error('Failed to connect printer:', error);
    // User canceling the scan doesn't need a loud error dialog, show a warning toast
    if (error.name === 'NotFoundError') {
      showToast({
        type: 'warn',
        title: 'Koneksi Dibatalkan',
        message: 'Pemindaian perangkat Bluetooth dibatalkan.',
      });
    } else {
      showToast({
        type: 'error',
        title: 'Gagal Menghubungkan',
        message: error.message || 'Gagal terhubung ke printer',
      });
    }
    isConnected.value = false;
    deviceName.value = null;
  } finally {
    isConnecting.value = false;
  }
};

const handleDisconnect = async () => {
  await disconnectPrinter();
  isConnected.value = false;
  deviceName.value = null;
  showToast({
    type: 'info',
    title: 'Printer Terputus',
    message: 'Koneksi printer telah diputuskan.',
  });
};

const handlePrint = async () => {
  if (isPrinting.value) return;

  try {
    isPrinting.value = true;

    // Auto-connect flow if disconnected
    if (!isConnected.value) {
      showToast({
        type: 'info',
        title: 'Menghubungkan Printer',
        message: 'Silakan pasangkan printer termal dari peramban Anda.',
      });
      await handleConnect();
    }

    if (!isConnected.value) {
      // If still not connected (user cancelled or connect failed)
      return;
    }

    await printReceipt(props.selected, paperSize.value);
    showToast({
      type: 'success',
      title: 'Struk Tercetak',
      message: 'Struk berhasil dikirim ke printer termal.',
    });
  } catch (error: any) {
    console.error('Print error:', error);
    showToast({
      type: 'error',
      title: 'Gagal Mencetak',
      message: error.message || 'Gagal mencetak struk. Silakan periksa koneksi printer.',
    });
  } finally {
    isPrinting.value = false;
  }
};

const handlePrintTest = async () => {
  if (isPrintingTest.value || !isConnected.value) return;
  try {
    isPrintingTest.value = true;
    await printTestPage();
    showToast({
      type: 'success',
      title: 'Halaman Uji Tercetak',
      message: 'Halaman uji berhasil dikirim ke printer.',
    });
  } catch (error: any) {
    console.error('Test print error:', error);
    showToast({
      type: 'error',
      title: 'Gagal Mencetak Halaman Uji',
      message: error.message || 'Gagal mencetak halaman uji.',
    });
  } finally {
    isPrintingTest.value = false;
  }
};

const downloadReceipt = async () => {
  if (!props.selected?.id) return;

  try {
    isDownloading.value = true;

    // Create temporary container with generated HTML
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = generateReceiptHTML(props.selected);
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);

    const canvas = await html2canvas(tempContainer, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    document.body.removeChild(tempContainer);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `receipt-${props.selected?.id?.slice(0, 8)}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading receipt:', error);
  } finally {
    isDownloading.value = false;
  }
};

const onCancel = () => {
  emits('cancel');
}
</script>

<style scoped>
.receipt-modal :deep(.p-dialog-content) {
  padding-bottom: 0 !important;
}
</style>
