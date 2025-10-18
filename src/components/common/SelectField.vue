<template>
  <div>
    <label :for="label" class="block text-sm font-medium text-text-muted mb-2">{{ label }}</label>
    <div class="relative">
      <MdiIcon v-if="icon" :path="icon" size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <select
        :id="label"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        :required="required"
        class="w-full pl-10 pr-10 py-3 bg-background-dark border border-border-futuristic rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary"
      >
        <option value="" disabled>Select {{ label }}</option>
        <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
      </select>
      <MdiIcon :path="mdiChevronDown" size="20" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
    </div>
    <span v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</span>
  </div>
</template>

<script setup>
import MdiIcon from './MdiIcon.vue';
import { mdiChevronDown } from '@mdi/js';

defineProps({
  modelValue: String,
  label: String,
  icon: String,
  required: Boolean,
  options: {
    type: Array,
    default: () => [],
  },
  error: String,
});

defineEmits(['update:modelValue']);
</script>