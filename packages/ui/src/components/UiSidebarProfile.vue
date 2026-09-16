<template>
  <div class="ui-sidebar-profile">
    <div
      class="ui-sidebar-profile__toggle ui-sidebar-profile__toggle--dark"
      @click="openProfileMenu"
    >
      <OverlayBadge v-if="badgeSeverity" :severity="badgeSeverity">
        <Avatar
          :image="avatarUrl || undefined"
          :label="avatarUrl ? undefined : personalInfo?.user?.name?.charAt(0)"
          size="small"
          shape="circle"
          class="ui-sidebar-profile__avatar"
        />
      </OverlayBadge>
      <Avatar
        v-else
        :image="avatarUrl || undefined"
        :label="avatarUrl ? undefined : personalInfo?.user?.name?.charAt(0)"
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
            :image="avatarUrl || undefined"
            :label="avatarUrl ? undefined : personalInfo?.user?.name?.charAt(0)"
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
            v-if="statusTag"
            :severity="statusTag.severity"
            :value="statusTag.value"
            class="text-xs! font-medium!"
          />
        </div>
        <Divider />
        <div class="space-y-2">
          <router-link
            v-for="link in allLinks"
            :key="link.to"
            :to="link.to"
            class="block"
          >
            <Button
              severity="secondary"
              variant="text"
              :icon="link.icon"
              size="small"
              :label="link.label"
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
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { clearSession, getMerchant, getPermissions, getRole, getUser } from '../auth';
import { showConfirm, showToast } from '../helpers/toast';
import { getUploadSignedUrl } from '../services/uploads';

interface ProfileLink {
  label: string;
  icon: string;
  to: string;
}

const props = withDefaults(
  defineProps<{
    /** Route to send the user to after logging out. */
    loginPath: string;
    /** Route of the app's own profile page; rendered as the first menu link. */
    profilePath: string;
    isCollapsed?: boolean;
    /** When set, the avatar is wrapped in an OverlayBadge of this severity. */
    badgeSeverity?: string | null;
    /** Optional status pill next to the user's name. */
    statusTag?: { severity: string; value: string } | null;
    /** Extra links rendered after "Profil". */
    links?: ProfileLink[];
  }>(),
  {
    isCollapsed: false,
    badgeSeverity: null,
    statusTag: null,
    links: () => [],
  },
);

defineEmits<{ navigate: [] }>();

const router = useRouter();

const personalInfo = computed(() => ({
  user: getUser(),
  role: getRole(),
  merchant: getMerchant(),
  permissions: getPermissions(),
}));

const allLinks = computed<ProfileLink[]>(() => [
  { label: 'Profil', icon: 'pi pi-user', to: props.profilePath },
  ...props.links,
]);

const avatarUrl = ref<string | null>(personalInfo.value?.user?.avatar || null);

const handleLogout = () => {
  showConfirm({
    header: 'Logout dari Akun ini?',
    rejectLabel: 'Batal',
    acceptLabel: 'Ok, Lanjutkan',
    type: 'warn',
    accept: () => {
      clearSession();

      showToast({
        type: 'success',
        title: 'Logout Succesfully',
      });
      router.push(props.loginPath);
    },
  });
};

const opProfileMenu = ref();
const openProfileMenu = (event: MouseEvent) => {
  opProfileMenu.value.toggle(event);
};

const hydrateAvatarUrl = async () => {
  try {
    const avatarUploadId = personalInfo.value?.user?.avatar_upload_id;
    if (!avatarUploadId) return;

    const response = await getUploadSignedUrl(avatarUploadId);
    avatarUrl.value = response?.data?.data?.url || personalInfo.value?.user?.avatar || null;
  } catch {
    avatarUrl.value = personalInfo.value?.user?.avatar || null;
  }
};

onMounted(() => {
  hydrateAvatarUrl();
});
</script>
<style>
@import 'tailwindcss';
@import '../styles/themes.css';

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
