<template>
  <UiCard>
    <div class="w-full flex gap-4 items-center justify-between">
      <h1 class="text-lg font-semibold">
        Kas Masuk / Keluar
      </h1>
      <slot name="action" />
    </div>

    <div v-if="!entries.length" class="text-sm text-gray-500 dark:text-gray-400">
      Belum ada catatan kas.
    </div>
    <DataTable v-else :value="entries" size="small">
      <Column header="Waktu">
        <template #body="{ data }">
          {{ formatDateTime(data.created_at) }}
        </template>
      </Column>
      <Column header="Jenis">
        <template #body="{ data }">
          <Tag
            :value="data.type === 'in' ? 'MASUK' : 'KELUAR'"
            :severity="data.type === 'in' ? 'success' : 'danger'"
          />
        </template>
      </Column>
      <Column header="Nominal">
        <template #body="{ data }">
          {{ formatCash(data.amount) }}
        </template>
      </Column>
      <Column field="reason" header="Alasan" />
      <Column header="Pencatat">
        <template #body="{ data }">
          {{ data.created_by_name || '-' }}
        </template>
      </Column>
    </DataTable>
  </UiCard>
</template>

<script setup lang="ts">
import { formatCash } from '@/modules/shift/services/cash.ts';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import { formatDateTime } from '@umkm-pos/ui/helpers/utils';

defineProps<{ entries: any[] }>();
</script>
