<template>
  <div
    @click="onViewDetails"
    class="p-4 bg-background-dark rounded-lg shadow-sm cursor-pointer hover:bg-gray-700 transition-colors active:bg-gray-600"
  >
    <div class="flex justify-between items-center">
      <div>
        <h4 class="font-semibold text-primary">{{ formatDate(note.createdAt) }}</h4>
        <p class="text-xs text-text-muted">By {{ note.authorName }} ({{ note.authorRole }})</p>
      </div>
      <MdiIcon :path="mdiChevronRight" size="24" class="text-text-muted" />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import MdiIcon from '@/components/common/MdiIcon.vue';
import { mdiChevronRight } from '@mdi/js';

const props = defineProps({
  note: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['view-details']);

const onViewDetails = () => {
  emit('view-details', props.note);
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