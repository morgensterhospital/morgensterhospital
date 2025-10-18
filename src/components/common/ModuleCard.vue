<template>
  <div class="glass-card p-6">
    <div class="flex items-center mb-4" :class="color">
      <MdiIcon :path="icon" size="32" class="mr-4" />
      <h3 class="text-xl font-bold tracking-wider">{{ title }}</h3>
    </div>
    <div class="flex space-x-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import MdiIcon from './MdiIcon.vue';

defineProps({
  title: String,
  icon: String,
  color: {
    type: String,
    default: 'text-primary',
  },
});
</script>