<template>
  <div class="ui-sidebar-outlet">
    <div
      class="ui-sidebar-outlet__toggle ui-sidebar-outlet__toggle--dark"
      @click="openOutletMenu"
    >
      <div class="min-w-6 text-center">
        <i class="text-[10px]! text-gray-400 pi pi-chevron-down" />
      </div>

      <div
        v-if="!isMobile"
        class="flex-1 overflow-hidden flex flex-col"
      >
        <div class="text-xs text-right truncate">
          {{ merchant?.name || '-' }}
        </div>
        <div class="text-[10px] text-gray-400 text-right truncate">
          {{ activeOutlet?.name || '-' }}
        </div>
      </div>

      <Avatar
        :image="activeOutlet?.logo"
        :label="activeOutlet?.logo ? undefined : activeOutlet?.name?.charAt(0)"
        size="small"
        shape="square"
        :icon="activeOutlet?.logo ? undefined : 'pi pi-store'"
        class="ui-sidebar-outlet__avatar"
      />
    </div>
    <Popover
      ref="opOutletMenu"
      position="right"
      class="ui-sidebar-outlet__popper"
    >
      <div class="space-y-4 w-75">
        <div class="text-xs font-semibold">
          Outlet Lists
        </div>
        <div
          v-for="(outlet, i) in listOutlet"
          :key="i"
        >
          <div class="flex items-center gap-2">
            <Avatar
              :image="outlet?.outlet?.logo"
              :label="outlet?.outlet?.logo ? undefined : outlet?.outlet?.name?.charAt(0)"
              size="small"
              shape="square"
              class="ui-sidebar-outlet__avatar"
            />
            <div
              class="flex-1 overflow-hidden flex flex-col"
            >
              <div class="text-xs text-left truncate">
                {{ outlet?.outlet?.name || '-' }}
              </div>
              <div class="text-[10px] text-gray-400 text-left truncate">
                {{ outlet?.role?.name || '-' }}
              </div>
            </div>
            <Button
              severity="secondary" 
              variant="outlined"
              size="small"
              :label="activeOutlet.id === outlet?.outlet?.id ? 'Current' : 'Visit'"
              :disabled="activeOutlet.id === outlet?.outlet?.id"
              class="h-8 text-xs!"
              @click="onVisitOutlet(outlet)"
            />
          </div>
          <Divider v-if="i !== listOutlet.length - 1" />
        </div>
      </div>
    </Popover>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/modules/auth/stores/index.ts';
import { removeAuth } from '@/helpers/auth.ts';
import { showToast } from '@/helpers/toast.ts';
import { getMerchant, getListOutlet, getOutlet, setOutlet } from '@/helpers/auth.ts';

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

// Device type
const authStore = useAuthStore();
const { deviceType } = storeToRefs(authStore);

const isMobile = computed(() => deviceType.value === 'mobile');

// Personal info
const router = useRouter();
const confirm = useConfirm();

const merchant = computed(() => getMerchant());

const listOutlet = computed(() => getListOutlet());
const activeOutlet = computed(() => getOutlet());

const opOutletMenu = ref();
const openOutletMenu = (event) => {
  opOutletMenu.value.toggle(event);
}

// Methods
const onVisitOutlet = async (outlet) => {
  try {
    await setOutlet(outlet);
    window.location.href = '/landing';
  }
  catch (error) {
    console.error(error);
    showToast({
      type: 'error',
      title: 'Error',
      message: error.message,
    })
  }
};
</script>
<style>
@import 'tailwindcss';
@import '@/assets/styles/themes.css';

.ui-sidebar-outlet {
  @apply relative;
}

.ui-sidebar-outlet__toggle {
  @apply flex items-center gap-2 p-2 rounded-lg cursor-pointer;
}

.ui-sidebar-outlet__toggle--dark {
  @apply hover:bg-gray-50 dark:hover:bg-[#27272a];
}

.ui-sidebar-outlet__popper.p-popover {
  margin-right: 8px;
}

.ui-sidebar-outlet__popper.p-popover:before,
.ui-sidebar-outlet__popper.p-popover:after {
  @apply hidden;
}

.ui-sidebar-outlet__avatar {
  @apply rounded-md overflow-hidden;
}

.ui-sidebar-outlet__avatar img {
  object-fit: cover !important;
}
</style>