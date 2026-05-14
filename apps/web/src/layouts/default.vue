<template>
  <div class="default-layout default-layout--dark">
    <!-- Sidebar -->
    <div
      class="default-layout__sidebar default-layout__sidebar--dark"
      :class="{
        'default-layout__sidebar--small': isSmallSidebar,
        'default-layout__sidebar--full': !isSmallSidebar && !isMobile,
        'default-layout__sidebar--mobile': !isSmallSidebar && isMobile,
        'default-layout__sidebar--mobile-open': isMobile && isCollapsed,
        'default-layout__sidebar--mobile-closed': isMobile && !isCollapsed,
      }"
    >
      <div
        class="default-layout__sidebar-header"
        :class="{
          'default-layout__sidebar-header--mobile': isMobile,
          'default-layout__sidebar-header--desktop': !isMobile,
        }"
      >
        <router-link
          to="/landing"
          class="default-layout__logo"
          @click="isMobile ? handleOpenSidebar() : null"
        >
          <Image
            :src="isSmallSidebar ? defaultIcon : defaultLogo"
            alt="Image"
            :class="{
              'max-w-8': isSmallSidebar,
              'max-w-28': !isSmallSidebar,
            }"
          />
        </router-link>

        <Button
          v-if="isMobile"
          severity="secondary" 
          variant="text"
          size="medium"
          icon="pi pi-times"
          aria-label="Collapse"
          class="default-layout__sidebar-close"
          @click="handleOpenSidebar"
        />
      </div>

      <!-- Content -->
      <div class="default-layout__sidebar-content">
        <UiSidebarMenu
          :is-collapsed="isSmallSidebar"
          @navigate="isMobile ? handleOpenSidebar() : null"
        />
      </div>

      <!-- Footer -->
      <div class="default-layout__sidebar-footer" :class="{ 'default-layout__sidebar-footer--small': isSmallSidebar, 'default-layout__sidebar-footer--full': !isSmallSidebar }">
        <Button
          v-if="ENABLE_DARKMODE_TOGGLE"
          severity="secondary" 
          variant="outlined"
          size="medium"
          :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
          @click="toggleDarkMode"
        />
        <router-link to="/notification">
          <Button
            severity="secondary" 
            variant="outlined"
            size="medium"
            icon="pi pi-bell"
          />
        </router-link>
        <router-link to="/settings">
          <Button
            severity="secondary" 
            variant="outlined"
            size="medium"
            icon="pi pi-cog"
          />
        </router-link>
        <router-link to="/profile">
          <Button
            severity="secondary" 
            variant="outlined"
            size="medium"
            icon="pi pi-user"
          />
        </router-link>
      </div>
    </div>

    <!-- Body -->
    <div class="default-layout__body default-layout__body--dark">
      <!-- Header -->
      <div class="default-layout__header default-layout__header--dark">
        <div class="default-layout__header-content">
          <div class="default-layout__header-left">
            <Button
              severity="secondary" 
              variant="text"
              size="medium"
              :icon="!isSmallSidebar ? 'pi pi-align-left' : 'pi pi-bars'"
              aria-label="Collapse"
              class="default-layout__header-toggle"
              @click="handleOpenSidebar"
            />

            <Button
              v-if="isBack"
              severity="secondary" 
              size="medium"
              icon="pi pi-arrow-left"
              aria-label="Back"
              class="default-layout__header-back"
              @click="$router.back()"
            />

            <div class="default-layout__header-title default-layout__header-title--dark">
              {{ title }}
            </div>

            <Divider
              v-if="breadcrumbs.length && isWeb"
              layout="vertical"
            />

            <Breadcrumb
              v-if="breadcrumbs.length && isWeb"
              :home="home"
              :model="breadcrumbs"
              size="small"
            >
              <template #item="{ item, props }">
                <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                  <a :href="href" v-bind="props.action" @click="navigate">
                    <span :class="[item.icon, 'text-color']" />
                    <span
                      class="default-layout__breadcrumb-label default-layout__breadcrumb-label--dark"
                      :class="{
                        'text-primary-500 font-semibold': item.isActive,
                      }"
                    >{{ item.label }}</span>
                  </a>
                </router-link>
                <a v-else :href="item.url" :target="item.target" v-bind="props.action">
                  <span class="tdefault-layout__breadcrumb-label default-layout__breadcrumb-label--dark">{{ item.label }}</span>
                </a>
              </template>
            </Breadcrumb>
          </div>

          <div class="default-layout__header-right">
            <UiSidebarOutlet
              :is-collapsed="isSmallSidebar"
              @navigate="isMobile ? handleOpenSidebar() : null"
            />

            <Divider layout="vertical" />
            
            <UiSidebarProfile
              :is-collapsed="isSmallSidebar"
              @navigate="isMobile ? handleOpenSidebar() : null"
            />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="default-layout__content">
        <div class="default-layout__content-container">
          <slot />
        </div>
      </div>

      <!-- Footer -->
      <div
        id="layout-footer"
        class="default-layout__footer default-layout__footer--dark"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, computed, ref, watch } from "vue";
import { useRoute, useRouter } from 'vue-router';
import defaultIcon from '@/assets/logo.png';
import defaultLogo from '@/assets/insell-logo.png';

import { isLogin, getOutlet } from '@/helpers/auth.ts';
import { useDarkMode } from '@/composables/useDarkMode.ts';

import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/modules/auth/stores/index.ts';

import { PREFIX_ROUTE_PATH as PRP_AUTH } from '@/modules/auth/services/constants.ts';
import { useShift } from '@/modules/shift/composables/useShift.ts';
import { getOutletShift } from '@/modules/shift/services/api.ts';

import UiSidebarMenu from '@/components/UiSidebarMenu.vue';
import UiSidebarOutlet from '@/components/UiSidebarOutlet.vue';
import UiSidebarProfile from '@/components/UiSidebarProfile.vue';

const ENABLE_DARKMODE_TOGGLE = false;

const route = useRoute();
const isBack = computed(() => route.meta.isBack || false);
const title = computed(() => route.meta.title || '-');
const breadcrumbs = computed(() => Array.isArray(route.meta.breadcrumbs) ? route.meta.breadcrumbs : []);

const home = computed(() => ({
  icon: 'pi pi-home',
  route: '/landing',
}));

const router = useRouter();
const outlet = getOutlet();

// Dark mode
const { isDark, toggleDarkMode, initializeTheme } = useDarkMode();

// Device type
const authStore = useAuthStore();
const { deviceType } = storeToRefs(authStore);

const isMobile = computed(() => deviceType.value === 'mobile');
const isWeb = computed(() => deviceType.value === 'web');

// Sidebar collapsed
const isCollapsed = ref(false);

const isSmallSidebar = computed(() => {
  if (isMobile.value) {
    return false;
  }
  return isCollapsed.value;
});

const handleOpenSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

watch(deviceType, () => {
  if (isWeb.value) {
    isCollapsed.value = false;
  } else if (isMobile.value) {
    isCollapsed.value = false;
  } else {
    isCollapsed.value = true;
  }
}, { immediate: true });

// Computed for Shift
const {
  fetchShift,
  fetchShiftParticipants,
} = useShift();

const fetchOutletShift = async () => {
  try {
    const response = await getOutletShift(outlet.id);
    const shiftData = response?.data?.data || {};
    if (shiftData?.id) {
      await fetchShift({ shiftId: shiftData.id });
      await fetchShiftParticipants({ shiftId: shiftData.id });
    }
  } catch (error) {
    console.error('Failed to fetch outlet shift:', error);
  }
};

// Watch for outlet changes
watch(
  () => outlet?.id,
  (newOutletId) => {
    if (newOutletId) {
      fetchOutletShift();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (!isLogin()) {
    router.push(PRP_AUTH);
  }
  initializeTheme();
  fetchOutletShift();
});
</script>
<style scoped>
@import "tailwindcss";
@import '@/assets/styles/themes.css';

/* Main Layout */
.default-layout {
  @apply relative w-full h-screen flex bg-white;
}

.default-layout--dark {
  @apply dark:bg-dark-secondary;
}

/* Sidebar */
.default-layout__sidebar {
  @apply top-0 h-screen border-r border-gray-200 flex flex-col justify-between transition-all duration-100 bg-white;
}

.default-layout__sidebar--dark {
  @apply dark:bg-dark-secondary dark:border-dark;
}

.default-layout__sidebar--small {
  @apply w-16;
}

.default-layout__sidebar--full {
  @apply w-70 relative;
}

.default-layout__sidebar--mobile {
  @apply w-full fixed z-20;
}

.default-layout__sidebar--mobile-open {
  @apply left-0;
}

.default-layout__sidebar--mobile-closed {
  @apply -left-full;
}

.default-layout__sidebar-header {
  @apply w-full min-h-14 flex items-center px-2;
}

.default-layout__sidebar-header--mobile {
  @apply justify-between;
}

.default-layout__sidebar-header--desktop {
  @apply justify-center;
}

.default-layout__logo {
  @apply flex items-center;
}

.default-layout__sidebar-close {
  @apply w-10.5!;
}

.default-layout__sidebar-content {
  @apply p-2 h-full flex flex-col gap-4 overflow-y-auto;
}

.default-layout__sidebar-footer {
  @apply flex justify-center gap-2 px-2 py-3;
}

.default-layout__sidebar-footer--small {
  @apply flex-col items-center;
}

.default-layout__sidebar-footer--full {
  @apply flex-row;
}

/* Body */
.default-layout__body {
  @apply relative flex-1 w-full h-full bg-tertiary-25 overflow-y-auto;
}

.default-layout__body--dark {
  @apply dark:bg-dark;
}

/* Header */
.default-layout__header {
  @apply sticky top-0 z-10 w-full h-14 px-4 border-b border-gray-200 bg-white;
}

.default-layout__header--dark {
  @apply dark:border-dark dark:bg-dark-secondary;
}

.default-layout__header-content {
  @apply mx-auto h-full flex justify-between items-center;
}

.default-layout__header-left {
  @apply flex items-center overflow-hidden;
}

.default-layout__header-right {
  @apply flex items-center;
}

.default-layout__header-toggle {
  @apply w-10.5! mr-4;
}

.default-layout__header-back {
  @apply mr-4;
}

.default-layout__header-title {
  @apply text-lg font-semibold mr-3 truncate;
}

.default-layout__header-dark-toggle {
  @apply mr-2;
}

.default-layout__breadcrumb-label {
  @apply text-sm! text-gray-500 font-normal truncate;
}

.default-layout__breadcrumb-label--dark {
  @apply dark:text-gray-400;
}

/* Content */
.default-layout__content {
  @apply w-full p-4;
}

.default-layout__content-container {
  @apply container mx-auto min-h-[calc(100vh-88px)];
}

/* .default-layout__content-container:not(:has(.pos)) {
  @apply max-w-6xl;
}

.default-layout__content-container:has(.pos) {
  @apply container;
} */

/* Footer */
.default-layout__footer {
  @apply sticky bottom-0 w-full h-18.5 bg-white border-t border-gray-200 py-2;
}

.default-layout__footer--dark {
  @apply dark:bg-dark-secondary dark:border-dark;
}

#layout-footer:empty {
  display: none;
}
</style>