<template>
  <div class="bg-surface-dark p-4 rounded-lg shadow-md mb-6">
    <h3 class="text-xl font-semibold mb-4 text-text-light">Add/Update Note</h3>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-text-muted mb-1">General Notes</label>
        <textarea
          v-model="note.general"
          rows="4"
          class="w-full p-2 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-text-light"
          placeholder="General medical notes..."
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-text-muted mb-1">Diagnosis</label>
        <textarea
          v-model="note.diagnosis"
          rows="3"
          class="w-full p-2 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-text-light"
          placeholder="Patient's diagnosis..."
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-text-muted mb-1">Laboratory Orders</label>
        <textarea
          v-model="note.labOrders"
          rows="3"
          class="w-full p-2 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-text-light"
          placeholder="e.g., Full Blood Count, Liver Function Test..."
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-text-muted mb-1">X-Ray Orders</label>
        <textarea
          v-model="note.xrayOrders"
          rows="3"
          class="w-full p-2 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-text-light"
          placeholder="e.g., Chest X-ray, Abdominal Scan..."
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-text-muted mb-1">Prescriptions</label>
        <textarea
          v-model="note.prescriptions"
          rows="3"
          class="w-full p-2 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-text-light"
          placeholder="e.g., Amoxicillin 500mg, Paracetamol 1g..."
        ></textarea>
      </div>
    </div>
    <div class="flex justify-end mt-4">
      <button
        @click="onSave"
        class="px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition-colors"
      >
        Upload Notes
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const note = ref({
  general: '',
  diagnosis: '',
  labOrders: '',
  xrayOrders: '',
  prescriptions: '',
});

const emit = defineEmits(['save-note']);

const onSave = () => {
  // Check if at least one field has content
  if (Object.values(note.value).some(field => field.trim())) {
    emit('save-note', { ...note.value });
    // Reset the form
    Object.keys(note.value).forEach(key => note.value[key] = '');
  }
};
</script>