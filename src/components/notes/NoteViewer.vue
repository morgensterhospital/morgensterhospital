<template>
  <div class="bg-surface-dark p-4 rounded-lg shadow-md">
    <h3 class="text-xl font-semibold mb-4 text-text-light">Saved Notes</h3>
    <div v-if="notes.length > 0" class="space-y-4">
      <div v-for="note in notes" :key="note.id" class="p-4 bg-background-dark rounded-lg">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-semibold text-primary">{{ note.authorName }} ({{ note.authorRole }})</span>
          <span class="text-xs text-text-muted">{{ formatDate(note.createdAt) }}</span>
        </div>
        <p class="text-text-light whitespace-pre-wrap">{{ note.content }}</p>
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
  if (!timestamp) return '';
  // Assuming timestamp is a Firebase Timestamp object
  const date = timestamp.toDate();
  return date.toLocaleString();
};
</script>