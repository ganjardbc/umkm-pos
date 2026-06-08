<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="`${outlet?.name || 'Outlet'} — QR Code`"
    class="w-[92vw] max-w-lg"
  >
    <div class="space-y-4">
      <Message
        v-if="outlet && !outlet.guest_session_secret"
        severity="warn"
      >
        Outlet ini belum punya secret code. QR bisa dipreview, tapi customer belum bisa masuk sampai secret code diisi.
      </Message>

      <div
        ref="qrCardRef"
        class="mx-auto max-w-md rounded-[28px] bg-gradient-to-b from-amber-50 via-white to-stone-50 p-6 shadow-sm ring-1 ring-amber-100"
      >
        <div class="text-center space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
            Scan To Order
          </p>
          <h2 class="text-2xl font-bold text-slate-900">
            {{ outlet?.name }}
          </h2>
          <p class="text-sm text-slate-500">
            Scan QR lalu masukkan secret code untuk mulai pesan.
          </p>
        </div>

        <div class="mt-5 flex justify-center">
          <div class="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <img
              v-if="qrCodeDataUrl"
              :src="qrCodeDataUrl"
              :alt="`QR ${outlet?.name}`"
              class="h-64 w-64 rounded-2xl"
            >
          </div>
        </div>

        <div class="mt-5 space-y-3 rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200">
          <div>
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">Scan URL</p>
            <p class="mt-1 break-all text-sm font-medium text-slate-700">
              {{ customerCatalogUrl }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">Secret Code</p>
            <p class="mt-1 font-mono text-lg font-semibold text-slate-900">
              {{ outlet?.guest_session_secret || 'BELUM DISET' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2">
        <Button
          icon="pi pi-download"
          label="Download QR"
          severity="secondary"
          variant="outlined"
          :disabled="!qrCodeDataUrl"
          @click="downloadQrCard"
        />
        <Button
          icon="pi pi-print"
          label="Print QR"
          :disabled="!qrCodeDataUrl"
          @click="printQrCard"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

const props = defineProps<{
  outlet: any;
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const visible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val),
});

const qrCardRef = ref<HTMLElement | null>(null);
const qrCodeDataUrl = ref('');

const customerCatalogUrl = computed(() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/menu/${props.outlet?.id}`;
});

const generateQrCode = async () => {
  if (!props.outlet?.id) return;
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(customerCatalogUrl.value, {
      width: 256,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    });
  } catch {
    qrCodeDataUrl.value = '';
  }
};

const downloadQrCard = async () => {
  if (!qrCardRef.value || !props.outlet) return;
  try {
    const canvas = await html2canvas(qrCardRef.value, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `outlet-qr-${props.outlet.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    // silent
  }
};

const printQrCard = () => {
  if (!qrCodeDataUrl.value || !props.outlet) return;
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Outlet QR - ${props.outlet.name}</title>
        <style>
          body { margin: 0; padding: 32px; font-family: Arial, sans-serif; background: #ffffff; color: #111827; }
          .card { max-width: 420px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 24px; padding: 24px; text-align: center; box-sizing: border-box; }
          .qr { width: 256px; height: 256px; margin: 20px auto; display: block; }
          .label { font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #b45309; font-weight: 700; }
          .title { font-size: 30px; font-weight: 700; margin: 8px 0; }
          .muted { color: #64748b; font-size: 14px; line-height: 1.5; }
          .info { margin-top: 20px; text-align: left; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; }
          .info strong { display: block; margin-bottom: 6px; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #94a3b8; }
          .url { word-break: break-all; font-size: 14px; }
          .secret { font-family: monospace; font-size: 24px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="label">Scan To Order</div>
          <div class="title">${props.outlet.name}</div>
          <div class="muted">Scan QR lalu masukkan secret code untuk mulai pesan.</div>
          <img class="qr" src="${qrCodeDataUrl.value}" alt="Outlet QR">
          <div class="info"><strong>Scan URL</strong><div class="url">${customerCatalogUrl.value}</div></div>
          <div class="info"><strong>Secret Code</strong><div class="secret">${props.outlet.guest_session_secret || 'BELUM DISET'}</div></div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

watch(() => props.visible, (val) => {
  if (val) {
    generateQrCode();
  }
});
</script>
