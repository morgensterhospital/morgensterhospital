<template>
  <div class="flex items-start space-x-3">
    <MdiIcon :path="icon" size="20" class="text-primary mt-1" />
    <div>
      <label class="block text-sm font-medium text-text-muted">{{ label }}</label>
      <span class="text-lg text-text-light">{{ value }}</span>
    </div>
  </div>
</template>

<script setup>
import MdiIcon from './MdiIcon.vue';

defineProps({
  icon: String,
  label: String,
  value: [String, Number],
});
</script>