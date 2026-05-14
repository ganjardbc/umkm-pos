<template>
  <div
    v-bind="$attrs, { novalidate: true }"
    class="w-full h-full flex flex-col gap-4"
  >
    <slot />

    <Teleport to="#layout-footer">
      <div class="container mx-auto h-full flex items-center justify-end gap-4 px-4">
        <slot name="tc-footer" />
      </div>
    </Teleport>
  </div>
</template>
