<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Site Settings
      </h1>
    </template>

    <Form
      v-if="isLoaded"
      v-slot="$form"
      :resolver="resolver"
      :initialValues="initialValues"
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full"
    >
      <div class="w-full space-y-4">
        <!-- Dark Mode -->
        <UiFormGroup label="Dark Mode" variant="vertical">
          <ToggleButton
            name="darkMode"
            on-label="On"
            off-label="Off"
          />
        </UiFormGroup>

        <!-- Notifications -->
        <UiFormGroup label="Notifications" variant="vertical">
          <ToggleButton
            name="notificationsEnabled"
            on-label="On"
            off-label="Off"
          />
        </UiFormGroup>

        <!-- Language -->
        <UiFormGroup label="Language" variant="vertical">
          <Select
            name="language"
            :options="languageOptions"
            option-label="label"
            option-value="value"
            placeholder="Select language"
            fluid
          />
          <Message
            v-if="$form.language?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.language.error?.message }}
          </Message>
        </UiFormGroup>

        <!-- Timezone -->
        <UiFormGroup label="Timezone" variant="vertical">
          <Select
            name="timezone"
            :options="timezoneOptions"
            placeholder="Select timezone"
            fluid
            filter
          />
          <Message
            v-if="$form.timezone?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.timezone.error?.message }}
          </Message>
        </UiFormGroup>
      </div>

      <div class="w-full flex justify-end gap-4">
        <Button
          severity="secondary"
          label="Cancel"
          size="medium"
          class="w-full md:w-[128px]"
          @click="onCancel"
        />
        <Button
          severity="danger"
          variant="outlined"
          label="Reset"
          size="medium"
          class="w-full md:w-[128px]"
          @click="confirmReset"
        />
        <Button
          type="submit"
          label="Save"
          size="medium"
          class="w-full md:w-[128px]"
        />
      </div>
    </Form>
  </UiCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { isHasPermission } from '@/helpers/auth.ts';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import UiCard from '@/components/UiCard.vue';
import UiFormGroup from '@/components/UiFormGroup.vue';
import { Form } from '@primevue/forms';
import { updateSiteSettings } from '@/modules/settings/services/api.ts';
import { SITE_UPDATE } from '@/modules/settings/services/rbac.ts';
import { useSettingsStore } from '@/modules/settings/stores/settings.ts';
import type { SiteSettingsDto } from '@/modules/settings/services/types';

const router = useRouter();
const settingsStore = useSettingsStore();

// RBAC
const isCanUpdate = computed(() => isHasPermission(SITE_UPDATE));

// Form state
const isLoaded = ref(false);
const initialValues = ref<SiteSettingsDto>({
  darkMode: false,
  language: 'en',
  timezone: 'UTC',
  notificationsEnabled: true,
});

const resolver = ref(zodResolver(
  z.object({
    darkMode: z.boolean(),
    language: z.string().min(1, { message: 'Language is required.' }),
    timezone: z.string().min(1, { message: 'Timezone is required.' }),
    notificationsEnabled: z.boolean(),
  })
));

// Options
const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Bahasa Indonesia', value: 'id' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
  { label: '中文', value: 'zh' },
];

const timezoneOptions = [
  'UTC',
  'GMT+1',
  'GMT+2',
  'GMT+3',
  'GMT+4',
  'GMT+5',
  'GMT+5:30',
  'GMT+6',
  'GMT+7',
  'GMT+8',
  'GMT+9',
  'GMT+10',
  'GMT+11',
  'GMT+12',
  'GMT-1',
  'GMT-2',
  'GMT-3',
  'GMT-4',
  'GMT-5',
  'GMT-6',
  'GMT-7',
  'GMT-8',
  'GMT-9',
  'GMT-10',
  'GMT-11',
  'GMT-12',
];

// Initialize form from store
const initializeForm = () => {
  initialValues.value = { ...settingsStore.siteSettings };
  isLoaded.value = true;
};

// Submit
const onFormSubmit = async ({ valid, values }: { valid: boolean; values: any }) => {
  if (valid) {
    try {
      showLoading();

      const payload: SiteSettingsDto = {
        darkMode: values.darkMode,
        language: values.language,
        timezone: values.timezone,
        notificationsEnabled: values.notificationsEnabled,
      };

      const response = await updateSiteSettings(payload);
      const { success } = response?.data || {};

      if (success) {
        // Update store
        settingsStore.updateSiteSettings(payload);

        showToast({
          type: 'success',
          title: 'Success',
          message: 'Site settings updated successfully.',
        });
        router.push({ name: 'settings' });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: getErrorMessage(error) || 'Failed to update settings.',
      });
    } finally {
      hideLoading();
    }
  }
};

// Reset to defaults
const confirmReset = () => {
  showConfirm({
    header: 'Reset Settings',
    message: 'Are you sure you want to reset all settings to defaults?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Reset',
    type: 'warn',
    accept: () => {
      settingsStore.resetToDefaults();
      initializeForm();
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Settings reset to defaults.',
      });
    },
  });
};

// Navigation
const onCancel = () => {
  router.back();
};

onMounted(() => {
  if (!isCanUpdate.value) {
    router.push({ name: 'settings' });
    return;
  }
  settingsStore.initializeSettings();
  initializeForm();
});
</script>

<style scoped></style>
