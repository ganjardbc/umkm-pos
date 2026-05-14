<template>
  <div class="ui-sidebar-profile">
    <div
      class="ui-sidebar-profile__toggle ui-sidebar-profile__toggle--dark"
      @click="openProfileMenu"
    >
      <Tag
        v-if="isWeb"
        :severity="isUserInShift ? 'success' : 'secondary'"
        :value="isUserInShift ? 'In Shift' : 'Not Shift'"
        class="text-xs! font-medium!"
      />
      <Avatar
        :image="personalInfo?.user?.avatar"
        :label="personalInfo?.user?.avatar ? undefined : personalInfo?.user?.name?.charAt(0)"
        size="small"
        shape="circle"
        class="ui-sidebar-profile__avatar"
      />
    </div>
    <Popover
      ref="opProfileMenu"
      position="right"
      class="ui-sidebar-profile__popper"
    >
      <div class="space-y-4 w-60">
        <div class="relative flex items-center gap-2">
          <Avatar
            :image="personalInfo?.user?.avatar"
            :label="personalInfo?.user?.avatar ? undefined : personalInfo?.user?.name?.charAt(0)"
            size="small"
            shape="circle"
            class="ui-sidebar-profile__avatar"
          />
          <div
            class="flex-1 overflow-hidden flex flex-col"
          >
            <div class="text-xs text-left truncate">
              {{ personalInfo?.user?.name || '-' }}
            </div>
            <div class="text-[10px] text-gray-400 text-left truncate">
              {{ personalInfo?.user?.email || '-' }}
            </div>
          </div>
          <Tag
            :severity="isUserInShift ? 'success' : 'secondary'"
            :value="isUserInShift ? 'In Shift' : 'Not Shift'"
            class="text-xs! font-medium!"
          />
        </div>
        <Divider />
        <div class="space-y-2">
          <router-link :to="PRP_PROFILE" class="block">
            <Button
              severity="secondary"
              variant="text"
              icon="pi pi-user"
              size="small"
              label="Profile"
              fluid
              class="justify-start! items-center!"
            />
          </router-link>
          <router-link :to="PRP_SETTINGS" class="block">
            <Button
              severity="secondary"
              variant="text"
              icon="pi pi-cog"
              size="small"
              label="Settings"
              fluid
              class="justify-start! items-center!"
            />
          </router-link>
        </div>
        <Divider />
        <Button
          severity="secondary"
          variant="outlined"
          icon="pi pi-power-off"
          size="small"
          label="Logout"
          fluid
          @click="handleLogout"
        />
      </div>
    </Popover>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { removeAuth } from '@/helpers/auth.ts';
import { showConfirm, showToast } from "@/helpers/toast.ts";
import { getPersonalInformation } from '@/helpers/auth.ts';
import { useAuthStore } from '@/modules/auth/stores/index.ts';
import { useShift } from '@/modules/shift/composables/useShift.ts';
import { PREFIX_ROUTE_PATH as PRP_AUTH } from '@/modules/auth/services/constants.ts';
import { PREFIX_ROUTE_PATH as PRP_PROFILE } from '@/modules/profile/services/constants.ts';
import { PREFIX_ROUTE_PATH as PRP_SETTINGS } from '@/modules/settings/services/constants.ts';

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const personalInfo = computed(() => getPersonalInformation());

const authStore = useAuthStore();
const { deviceType } = storeToRefs(authStore);

const isWeb = computed(() => deviceType.value === 'web');

// Computed for Shift
const { isUserInShift } = useShift();

const handleLogout = () => {
  showConfirm({
    header: 'Logout dari Akun ini?',
    rejectLabel: 'Batal',
    acceptLabel: 'Ok, Lanjutkan',
    type: 'warn',
    accept: () => {
      removeAuth();

      showToast({
        type: 'success',
        title: 'Logout Succesfully',
      });
      router.push(PRP_AUTH);
    }
  });
}

const opProfileMenu = ref();
const openProfileMenu = (event) => {
  opProfileMenu.value.toggle(event);
}
</script>
<style>
@import 'tailwindcss';
@import '@/assets/styles/themes.css';

.ui-sidebar-profile {
  @apply relative;
}

.ui-sidebar-profile__toggle {
  @apply p-2 rounded-lg cursor-pointer flex items-center gap-2;
}

.ui-sidebar-profile__toggle--dark {
  @apply hover:bg-gray-50 dark:hover:bg-[#27272a];
}

.ui-sidebar-profile__popper.p-popover {
  margin-right: 8px;
}

.ui-sidebar-profile__popper.p-popover:before,
.ui-sidebar-profile__popper.p-popover:after {
  @apply hidden;
}

.ui-sidebar-profile__avatar img {
  object-fit: cover !important;
}
</style>