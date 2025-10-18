<template>
  <div class="form-section">
    <h2 class="text-2xl font-semibold text-primary mb-6 flex items-center">
      <MdiIcon :path="icon" size="24" class="mr-3" />
      {{ title }}
    </h2>
    <div class="space-y-6">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import MdiIcon from './MdiIcon.vue';

defineProps({
  title: String,
  icon: String,
});
</script>

<style scoped>
.form-section {
  @apply border-b border-border-futuristic pb-8 mb-8;
}
.form-section:last-of-type {
  @apply border-b-0 pb-0 mb-0;
}
</style>