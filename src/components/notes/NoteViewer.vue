<template>
  <div class="bg-surface-dark p-4 rounded-lg shadow-md">
    <h3 class="text-xl font-semibold mb-4 text-text-light">Saved Notes</h3>
    <div v-if="notes.length > 0" class="space-y-4">
      <div v-for="note in notes" :key="note.id" class="p-4 bg-background-dark rounded-lg">
        <div class="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
          <div>
            <span class="text-sm font-semibold text-primary">{{ note.authorName }} ({{ note.authorRole }})</span>
            <span v-if="note.isUpdate" class="ml-2 text-xs font-bold text-yellow-400">Update</span>
          </div>
          <span class="text-xs text-text-muted">{{ formatDate(note.createdAt) }}</span>
        </div>
        <div class="space-y-3 text-sm">
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
    <div v-else>
      <p class="text-text-muted">No notes have been saved for this patient yet.</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  notes: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const formatDate = (timestamp) => {
  if (!timestamp) return 'No date';
  // Handle both Firebase Timestamps and potential string dates
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString();
};
</script>