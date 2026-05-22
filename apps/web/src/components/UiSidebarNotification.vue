<template>
  <div class="ui-sidebar-notification">
    <div
      class="ui-sidebar-notification__toggle"
      @click="openNotificationMenu"
    >
      <OverlayBadge severity="success">
        <Button
          severity="secondary" 
          variant="text"
          size="small"
          icon="pi pi-bell"
          rounded
        />
      </OverlayBadge>
    </div>
    <Popover
      ref="opNotificationMenu"
      position="right"
      class="ui-sidebar-notification__popper"
    >
      <div class="space-y-2">
        <div class="text-base font-medium">
          Notifications(0)
        </div>
      </div>

      <div class="space-y-4 w-80">
        <UiEmptyState
          icon="pi pi-bell-slash"
          title="No Notifications"
          description="You're all caught up!"
        />
      </div>

      <div class="px-2 pb-2">
        <Button
          severity="secondary"
          variant="outlined"
          size="small"
          label="View All"
          fluid
        />
      </div>
    </Popover>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import UiEmptyState from '@/components/UiEmptyState.vue';

const opNotificationMenu = ref();
const openNotificationMenu = (event: MouseEvent) => {
  opNotificationMenu.value.toggle(event);
};
</script>
<style>
@import 'tailwindcss';
@import '@/assets/styles/themes.css';

.ui-sidebar-notification {
  @apply relative;
}

.ui-sidebar-notification__toggle {
  @apply p-2 rounded-lg flex items-center gap-2;
}

.ui-sidebar-notification__popper.p-popover:before,
.ui-sidebar-notification__popper.p-popover:after {
  @apply hidden;
}
</style>