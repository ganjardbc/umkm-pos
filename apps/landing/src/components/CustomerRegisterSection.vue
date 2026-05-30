<template>
  <section id="register" class="py-20 px-4 bg-cream dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-10">
        <p class="text-primary font-semibold mb-2">{{ t.register.kicker }}</p>
        <h2 class="text-3xl md:text-4xl font-bold text-navy dark:text-white">{{ t.register.title }}</h2>
        <p class="mt-4 text-gray-600 dark:text-gray-300">{{ t.register.subtitle }}</p>
      </div>

      <form class="bg-white dark:bg-gray-950 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-800" @submit.prevent="submitRegistration">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-200">
            <span>{{ t.register.fields.name }}</span>
            <input v-model.trim="form.name" type="text" required class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors" />
          </label>

          <label class="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-200">
            <span>{{ t.register.fields.email }}</span>
            <input v-model.trim="form.email" type="email" required class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors" />
          </label>

          <label class="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-200 md:col-span-2">
            <span>{{ t.register.fields.password }}</span>
            <input v-model="form.password" type="password" minlength="6" required class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors" />
          </label>

          <label class="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-200">
            <span>{{ t.register.fields.merchantName }}</span>
            <input v-model.trim="form.merchantName" type="text" required class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors" />
          </label>

          <label class="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-200">
            <span>{{ t.register.fields.merchantSlug }}</span>
            <input v-model.trim="form.merchantSlug" type="text" required class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors" pattern="[a-z0-9-]+" />
          </label>

          <label class="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-200">
            <span>{{ t.register.fields.outletName }}</span>
            <input v-model.trim="form.outletName" type="text" required class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors" />
          </label>

          <label class="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-200">
            <span>{{ t.register.fields.outletSlug }}</span>
            <input v-model.trim="form.outletSlug" type="text" required class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors" pattern="[a-z0-9-]+" />
          </label>
        </div>

        <p v-if="errorMessage" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
        <p v-if="successMessage" class="mt-4 text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>

        <button type="submit" :disabled="loading" class="mt-6 w-full py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {{ loading ? t.register.actions.loading : t.register.actions.submit }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

const props = defineProps<{ t: any }>()

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const form = reactive({
  name: '',
  email: '',
  password: '',
  merchantName: '',
  merchantSlug: '',
  outletName: '',
  outletSlug: '',
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')

watch(() => form.merchantName, (value) => {
  form.merchantSlug = slugify(value)
})

watch(() => form.outletName, (value) => {
  form.outletSlug = slugify(value)
})

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.password = ''
  form.merchantName = ''
  form.merchantSlug = ''
  form.outletName = ''
  form.outletSlug = ''
}

const submitRegistration = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        merchant: {
          slug: form.merchantSlug,
          name: form.merchantName,
        },
        outlets: [
          {
            slug: form.outletSlug,
            name: form.outletName,
          },
        ],
      }),
    })

    const payload = await response.json()

    if (!response.ok || !payload?.success) {
      throw new Error(payload?.message || props.t.register.messages.failed)
    }

    successMessage.value = props.t.register.messages.success
    resetForm()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : props.t.register.messages.failed
  } finally {
    loading.value = false
  }
}
</script>
