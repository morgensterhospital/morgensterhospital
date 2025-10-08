<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" @click.self="close">
    <div class="bg-surface-dark rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-text-light">Note Details</h2>
        <button @click="close" class="text-text-muted hover:text-text-light text-3xl">&times;</button>
      </div>

      <div v-if="note" class="flex-grow overflow-y-auto pr-2 text-sm">
        <div class="p-4 bg-background-dark rounded-lg">
          <div class="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
            <div>
              <span class="font-semibold text-primary">By {{ note.authorName }} ({{ note.authorRole }})</span>
              <span v-if="note.isUpdate" class="ml-2 text-xs font-bold text-yellow-400">Update</span>
            </div>
            <span class="text-xs text-text-muted">{{ formatDate(note.createdAt) }}</span>
          </div>
          <div class="space-y-4">
            <div v-if="note.content.general">
              <h4 class="font-semibold text-text-muted">General Notes:</h4>
              <p class="text-text-light whitespace-pre-wrap">{{ note.content.general }}</p>
            </div>
            <div v-if="note.content.diagnosis">
              <h4 class="font-semibold text-text-muted">Diagnosis:</h4>
              <p class="text-text-light whitespace-pre-wrap">{{ note.content.diagnosis }}</p>
            </div>
            <div v-if="note.content.labOrders">
              <h4 class="font-semibold text-text-muted">Laboratory Orders:</h4>
              <p class="text-text-light whitespace-pre-wrap">{{ note.content.labOrders }}</p>
            </div>
            <div v-if="note.content.xrayOrders">
              <h4 class="font-semibold text-text-muted">X-Ray Orders:</h4>
              <p class="text-text-light whitespace-pre-wrap">{{ note.content.xrayOrders }}</p>
            </div>
            <div v-if="note.content.prescriptions">
              <h4 class="font-semibold text-text-muted">Prescriptions:</h4>
              <p class="text-text-light whitespace-pre-wrap">{{ note.content.prescriptions }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: Boolean,
  note: Object,
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'No date';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>