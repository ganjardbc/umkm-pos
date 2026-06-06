<template>
  <div class="w-full space-y-4">
    <div class="flex gap-4 items-center">
      <Button
        severity="secondary"
        icon="pi pi-arrow-left"
        size="small"
        @click="onBack"
      />
      <h1 class="text-lg font-semibold">
        Outlet Detail
      </h1>
    </div>

    <UiCard v-if="outletDetail">
      <template #header>  
        <div class="w-full flex gap-4 items-center justify-between">
          <h1 class="text-lg font-semibold">
            Outlet Information
          </h1>
          <Button
            icon="pi pi-pencil"
            label="Edit Outlet"
            size="small"
            :disabled="!isCanUpdate"
            @click="onEdit"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div v-if="outletDetail.logo" class="flex justify-center md:justify-start">
          <img :src="outletDetail.logo" alt="Outlet Logo"
               class="w-32 h-32 rounded-lg object-cover border border-gray-200" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Name</label>
            <p class="text-base mt-1">{{ outletDetail.name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Slug</label>
            <p class="text-base mt-1">{{ outletDetail.slug }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Location</label>
            <p class="text-base mt-1">{{ outletDetail.location }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Guest Secret Code</label>
            <p class="text-base mt-1 font-mono">{{ outletDetail.guest_session_secret || '-' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Merchant</label>
            <p class="text-base mt-1">{{ outletDetail.merchants?.name || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Status</label>
            <div class="mt-1">
              <Tag
                :value="outletDetail.is_active ? 'Active' : 'Inactive'"
                :severity="outletDetail.is_active ? 'success' : 'danger'"
                class="capitalize"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Created At</label>
            <p class="text-base mt-1">{{ formatDateTime(outletDetail.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Updated At</label>
            <p class="text-base mt-1">{{ formatDateTime(outletDetail.updated_at) }}</p>
          </div>
        </div>
      </div>
    </UiCard>

    <UiCard v-if="outletDetail">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-lg font-semibold">Customer Catalog QR</h1>
          <div class="flex gap-2">
            <Button
              icon="pi pi-download"
              label="Download QR"
              size="small"
              severity="secondary"
              variant="outlined"
              :disabled="!qrCodeDataUrl"
              @click="downloadQrCard"
            />
            <Button
              icon="pi pi-print"
              label="Print QR"
              size="small"
              :disabled="!qrCodeDataUrl"
              @click="printQrCard"
            />
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <Message
          v-if="!outletDetail.guest_session_secret"
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
              {{ outletDetail.name }}
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
                :alt="`QR ${outletDetail.name}`"
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
                {{ outletDetail.guest_session_secret || 'BELUM DISET' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </UiCard>

    <UiCard v-if="outletDetail">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-lg font-semibold">Store Tables</h1>
          <Button
            icon="pi pi-plus"
            label="Add Table"
            size="small"
            :disabled="!isCanUpdate"
            @click="openCreateTable"
          />
        </div>
      </template>

      <div class="space-y-3">
        <div v-for="table in tables" :key="table.id" class="rounded-xl border border-gray-200 dark:border-dark! dark:bg-dark! p-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="font-semibold">{{ table.name }} <span class="text-xs text-slate-500">({{ table.code }})</span></p>
              <p class="text-sm text-slate-500">Kapasitas: {{ table.capacity || '-' }}</p>
            </div>
            <div class="flex gap-2">
              <Tag :value="table.is_active ? 'Active' : 'Inactive'" :severity="table.is_active ? 'success' : 'danger'" />
              <Button icon="pi pi-pencil" size="small" text @click="openEditTable(table)" />
              <Button icon="pi pi-trash" size="small" text severity="danger" @click="removeTable(table.id)" />
            </div>
          </div>
        </div>
        <p v-if="tables.length === 0" class="text-sm text-slate-500">Belum ada meja untuk outlet ini.</p>
      </div>
    </UiCard>

    <Dialog v-model:visible="showTableDialog" modal :header="editingTable?.id ? 'Edit Table' : 'Add Table'" class="w-[92vw] max-w-lg">
      <div class="space-y-3">
        <UiFormGroup label="Code" variant="vertical">
          <InputText v-model="tableForm.code" fluid />
        </UiFormGroup>
        <UiFormGroup label="Name" variant="vertical">
          <InputText v-model="tableForm.name" fluid />
        </UiFormGroup>
        <UiFormGroup label="Capacity" variant="vertical">
          <InputNumber v-model="tableForm.capacity" fluid />
        </UiFormGroup>
        <div class="flex items-center gap-2">
          <Checkbox v-model="tableForm.is_active" binary inputId="table-active" />
          <label for="table-active">Active</label>
        </div>
        <Button label="Save" fluid @click="saveTable" />
      </div>
    </Dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { deleteOutletTable, getDetailOutlet, getOutletTables, patchOutletTable, postOutletTable } from '@/modules/outlet/services/api.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/outlet/services/constants.ts';
import { UPDATE } from '@/modules/outlet/services/rbac.ts';
import UiCard from '@/components/UiCard.vue';
import UiFormGroup from '@/components/UiFormGroup.vue';

const route = useRoute();
const router = useRouter();
const outletID = computed(() => route.params.id as string);
const qrCardRef = ref<HTMLElement | null>(null);

// RBAC
const isCanUpdate = computed(() => isHasPermission(UPDATE));

// Fetch Detail
const outletDetail = ref<any>(null);
const tables = ref<any[]>([]);
const showTableDialog = ref(false);
const editingTable = ref<any>(null);
const qrCodeDataUrl = ref('');
const tableForm = reactive({
  code: '',
  name: '',
  capacity: null as number | null,
  is_active: true,
});

const customerCatalogUrl = computed(() => {
  if (!outletID.value) return '';
  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/menu/${outletID.value}`;
});

const fetchDetail = async () => {
  try {
    const response = await getDetailOutlet(outletID.value);
    const { data } = response?.data || {};

    outletDetail.value = data || null;
    await generateQrCode();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to fetch data.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const generateQrCode = async () => {
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(customerCatalogUrl.value, {
      width: 256,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    });
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to generate QR.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const fetchTables = async () => {
  try {
    const response = await getOutletTables(outletID.value);
    tables.value = response?.data?.data || [];
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to fetch tables.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

// Methods
const onBack = () => {
  router.back();
};

const onEdit = () => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: {
      id: outletID.value,
    }
  });
};

const resetTableForm = () => {
  editingTable.value = null;
  tableForm.code = '';
  tableForm.name = '';
  tableForm.capacity = null;
  tableForm.is_active = true;
};

const openCreateTable = () => {
  resetTableForm();
  showTableDialog.value = true;
};

const openEditTable = (table: any) => {
  editingTable.value = table;
  tableForm.code = table.code;
  tableForm.name = table.name;
  tableForm.capacity = table.capacity;
  tableForm.is_active = table.is_active;
  showTableDialog.value = true;
};

const saveTable = async () => {
  try {
    const payload = {
      code: tableForm.code,
      name: tableForm.name,
      capacity: tableForm.capacity,
      is_active: tableForm.is_active,
    };

    if (editingTable.value?.id) {
      await patchOutletTable(outletID.value, editingTable.value.id, payload);
    } else {
      await postOutletTable(outletID.value, payload);
    }

    showTableDialog.value = false;
    resetTableForm();
    fetchTables();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to save table.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const removeTable = async (id: string) => {
  try {
    await deleteOutletTable(outletID.value, id);
    fetchTables();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to delete table.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const downloadQrCard = async () => {
  if (!qrCardRef.value || !outletDetail.value) return;

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
    link.download = `outlet-qr-${outletDetail.value.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to download QR.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const printQrCard = () => {
  if (!qrCodeDataUrl.value || !outletDetail.value) return;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Outlet QR - ${outletDetail.value.name}</title>
        <style>
          body {
            margin: 0;
            padding: 32px;
            font-family: Arial, sans-serif;
            background: #ffffff;
            color: #111827;
          }
          .card {
            max-width: 420px;
            margin: 0 auto;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            padding: 24px;
            text-align: center;
            box-sizing: border-box;
          }
          .qr {
            width: 256px;
            height: 256px;
            margin: 20px auto;
            display: block;
          }
          .label {
            font-size: 12px;
            letter-spacing: 0.24em;
            text-transform: uppercase;
            color: #b45309;
            font-weight: 700;
          }
          .title {
            font-size: 30px;
            font-weight: 700;
            margin: 8px 0;
          }
          .muted {
            color: #64748b;
            font-size: 14px;
            line-height: 1.5;
          }
          .info {
            margin-top: 20px;
            text-align: left;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 16px;
          }
          .info strong {
            display: block;
            margin-bottom: 6px;
            font-size: 12px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #94a3b8;
          }
          .url {
            word-break: break-all;
            font-size: 14px;
          }
          .secret {
            font-family: monospace;
            font-size: 24px;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="label">Scan To Order</div>
          <div class="title">${outletDetail.value.name}</div>
          <div class="muted">Scan QR lalu masukkan secret code untuk mulai pesan.</div>
          <img class="qr" src="${qrCodeDataUrl.value}" alt="Outlet QR">
          <div class="info">
            <strong>Scan URL</strong>
            <div class="url">${customerCatalogUrl.value}</div>
          </div>
          <div class="info">
            <strong>Secret Code</strong>
            <div class="secret">${outletDetail.value.guest_session_secret || 'BELUM DISET'}</div>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

onMounted(() => {
  fetchDetail();
  fetchTables();
});
</script>
