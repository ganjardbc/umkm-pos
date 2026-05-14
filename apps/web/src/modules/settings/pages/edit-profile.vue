<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Edit Profile
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
        <UiFormGroup label="Name" variant="vertical">
          <InputText
            name="name"
            type="text"
            placeholder="Enter your name"
            fluid
          />
          <Message
            v-if="$form.name?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.name.error?.message }}
          </Message>
        </UiFormGroup>

        <UiFormGroup label="Email" variant="vertical">
          <InputText
            :model-value="initialValues.email"
            type="email"
            disabled
            fluid
          />
          <Message
            severity="info"
            size="small"
            variant="simple"
          >
            Email cannot be changed here. Use Change Email page.
          </Message>
        </UiFormGroup>

        <UiFormGroup label="Phone" variant="vertical">
          <InputText
            name="phone"
            type="tel"
            placeholder="Enter your phone number"
            fluid
          />
          <Message
            v-if="$form.phone?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.phone.error?.message }}
          </Message>
        </UiFormGroup>

        <UiFileUpload
          :previewUrl="imagePreview"
          @select="onUploadImage"
          @remove="onRemoveImage"
        />
        <UiFormGroup label="Bio" variant="vertical">
          <Textarea
            name="bio"
            placeholder="Tell us about yourself"
            rows="4"
            fluid
          />
          <Message
            v-if="$form.bio?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.bio.error?.message }}
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
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { isHasPermission, getUser } from '@/helpers/auth.ts';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import UiCard from '@/components/UiCard.vue';
import UiFormGroup from '@/components/UiFormGroup.vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import { getProfile, updateProfile } from '@/modules/settings/services/api.ts';
import { setUserAvatar, removeUserAvatar } from '@/services/uploads';
import { useFileUpload } from '@/composables/useFileUpload';
import { PROFILE_READ, PROFILE_UPDATE } from '@/modules/settings/services/rbac.ts';
import type { UpdateProfileDto } from '@/modules/settings/services/types';

const router = useRouter();
const currentUserId = computed(() => getUser()?.id || '');

// RBAC
const isCanRead = computed(() => isHasPermission(PROFILE_READ));
const isCanUpdate = computed(() => isHasPermission(PROFILE_UPDATE));

// Form state
const isLoaded = ref(false);
const hasExistingAvatar = ref(false);

const {
  selectedUploadId,
  imagePreview,
  onUploadImage,
  onRemoveImage,
} = useFileUpload();

const initialValues = ref({
  name: '',
  email: '',
  phone: '',
  bio: '',
});

const resolver = ref(zodResolver(
  z.object({
    name: z.string().min(1, { message: 'Name is required.' }),
    phone: z.string().optional(),
    bio: z.string().optional(),
  })
));

// Fetch profile
const fetchProfile = async () => {
  try {
    showLoading();
    const response = await getProfile();
    const { data } = response?.data || {};

    if (data) {
      initialValues.value = {
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
      };

      if (data.avatar) {
        hasExistingAvatar.value = true
        imagePreview.value = data.avatar
      }
    }
    isLoaded.value = true;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error',
      message: getErrorMessage(error) || 'Failed to load profile.',
    });
  } finally {
    hideLoading();
  }
};

// Submit
const onFormSubmit = async ({ valid, values }: { valid: boolean; values: any }) => {
  if (valid) {
    try {
      showLoading();

      const payload: UpdateProfileDto = {
        name: values.name,
        phone: values.phone || undefined,
        bio: values.bio || undefined,
      };

      const response = await updateProfile(payload);
      const { success } = response?.data || {};

      if (success) {
        if (selectedUploadId.value) {
          await setUserAvatar(currentUserId.value, selectedUploadId.value);
        } else if (hasExistingAvatar.value && !imagePreview.value) {
          await removeUserAvatar(currentUserId.value);
        }

        showToast({
          type: 'success',
          title: 'Success',
          message: 'Profile updated successfully.',
        });
        router.push({ name: 'settings' });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: getErrorMessage(error) || 'Failed to update profile.',
      });
    } finally {
      hideLoading();
    }
  }
};

// Navigation
const onCancel = () => {
  router.back();
};

onMounted(() => {
  if (!isCanRead.value) {
    router.push({ name: 'settings' });
    return;
  }
  fetchProfile();
});
</script>

<style scoped></style>
