<template>
  <OverlayBadge
    value="3"
    severity="danger"
  >
    <Button
      severity="secondary"
      variant="outlined"
      class="w-[100px]"
      size="medium"
      @click="$refs.op.toggle($event)"
    >
      <i class="pi pi-filter" />
      Filter
    </Button>
  </OverlayBadge>

  <Popover
    ref="op"
    class="w-[380px]"
  >
    <div class="font-semibold mb-2">
      Filter By
    </div>

    <slot />

    <div class="flex items-center justify-end gap-2 mt-4">
      <Button
        label="Reset"
        severity="secondary"
        variant="text"
        size="small"
        class="w-[90px]"
        @click="$emit('reset')"
      />
      <Button
        label="Apply"
        severity="primary"
        size="small"
        class="w-[90px]"
        @click="$emit('apply')"
      />
    </div>
  </Popover>
</template>
<script setup>
</script>