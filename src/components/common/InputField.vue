<template>
  <div>
    <label :for="label" class="block text-sm font-medium text-text-muted mb-2">{{ label }}</label>
    <div class="relative">
      <MdiIcon v-if="icon" :path="icon" size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        :type="type"
        :id="label"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :required="required"
        :placeholder="placeholder || `Enter ${label.toLowerCase()}`"
        class="w-full pl-10 pr-4 py-3 bg-background-dark border border-border-futuristic rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
      />
    </div>
  </div>
</template>

<script setup>
import MdiIcon from './MdiIcon.vue';

defineProps({
  modelValue: [String, Number],
  label: String,
  type: {
    type: String,
    default: 'text',
  },
  icon: String,
  required: Boolean,
  placeholder: String,
});

defineEmits(['update:modelValue']);
</script>