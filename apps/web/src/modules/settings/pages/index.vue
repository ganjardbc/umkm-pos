<template>
  <div class="max-w-2xl mx-auto space-y-4">
    <div class="grid grid-cols-1 gap-4">
      <UiCard
        v-for="(menu, i) in listOfSettingMenus"
        :key="i"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        @click="navigateTo(menu?.route)"
      >
        <div class="flex items-center gap-3">
          <div class="w-[42px] text-center">
            <i
              class="text-xl!"
              :class="[
                menu?.icon,
                menu?.color,
              ]"
            />
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-semibold">
              {{ menu?.label }}
            </h3>
            <p class="text-xs text-gray-500">
              {{ menu?.description }}
            </p>
          </div>
          <i class="pi pi-chevron-right text-xs!" />
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { isHasPermission } from '@/helpers/auth.ts';
import UiCard from '@/components/UiCard.vue';
import { LIST_MENU } from '@/modules/settings/services/constants.ts';

const router = useRouter();

const listOfSettingMenus = computed(() => {
  return LIST_MENU.filter((item) => isHasPermission(item.permission));
});

// Navigation
const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};
</script>

<style scoped></style>
