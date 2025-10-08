<template>
  <div class="bg-surface-dark p-4 rounded-lg shadow-md mb-6">
    <h3 class="text-xl font-semibold mb-4 text-text-light">New Note</h3>
    <textarea
      v-model="noteContent"
      rows="8"
      class="w-full p-2 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-text-light"
      placeholder="Write your medical notes, diagnosis, laboratory tests orders, x-ray orders, and prescription orders here..."
    ></textarea>
    <div class="flex justify-end mt-4">
      <button
        @click="onSave"
        class="px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition-colors"
      >
        Save Note
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const noteContent = ref('');
const emit = defineEmits(['save-note']);

const onSave = () => {
  if (noteContent.value.trim()) {
    emit('save-note', noteContent.value);
    noteContent.value = ''; // Clear the textarea after saving
  }
};
</script>