<template>
  <div class="w-full flex flex-col justify-center items-center" style="height: calc(100vh - 90px);">
    <h1 class="text-4xl font-bold mb-4">403</h1>
    <p class="text-md text-gray-400 text-center mb-8">Forbidden: Anda tidak memiliki izin untuk mengakses halaman ini.</p>
    <Button
      severity="primary"
      size="small"
      icon="pi pi-home"
      label="Kembali ke Home"
      as="router-link"
      :to="'/'"
    />
  </div>
</template>