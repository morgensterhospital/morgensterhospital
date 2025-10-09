<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" @click.self="close">
    <div class="bg-surface-dark rounded-lg shadow-2xl p-6 w-full max-w-lg text-center">
      <h2 class="text-2xl font-semibold text-text-light mb-4">{{ title }}</h2>
      <p class="text-text-muted mb-6">
        This feature is currently under development. Full functionality will be available soon.
      </p>
      <M3Button @click="close">
        Close
      </M3Button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import M3Button from '@/components/common/M3Button.vue';

const props = defineProps({
  show: Boolean,
  title: String,
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>