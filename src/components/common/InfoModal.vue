<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-background-dark rounded-lg shadow-xl w-full max-w-lg max-h-full flex flex-col">
      <header class="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 class="text-xl font-bold text-text-light">{{ title }}</h2>
        <button @click="$emit('close')" class="text-text-muted hover:text-white">
          <MdiIcon :path="mdiClose" size="24" />
        </button>
      </header>
      <div class="p-6 overflow-y-auto flex-grow">
        <p class="text-text-muted">Information for {{ title }} will be displayed here.</p>
        <p v-if="!hasData" class="text-center text-text-muted mt-4">No information to display.</p>
      </div>
      <footer class="p-4 border-t border-gray-700 flex justify-end">
        <M3Button variant="outlined" @click="$emit('close')">Close</M3Button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import MdiIcon from '@/components/common/MdiIcon.vue';
import M3Button from '@/components/common/M3Button.vue';
import { mdiClose } from '@mdi/js';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  hasData: {
    type: Boolean,
    default: false,
  },
});
</script>
