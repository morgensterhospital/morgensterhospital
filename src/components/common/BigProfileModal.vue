<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-background-dark rounded-lg shadow-xl w-full h-full max-w-6xl max-h-full flex flex-col">
      <header class="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 class="text-xl font-bold text-text-light">Patient Profile</h2>
        <button @click="$emit('close')" class="text-text-muted hover:text-white">
          <MdiIcon :path="mdiClose" size="24" />
        </button>
      </header>
      <div class="p-6 overflow-y-auto flex-grow">
        <PatientProfile :patientId="patientId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import MdiIcon from '@/components/common/MdiIcon.vue';
import PatientProfile from '@/views/patient/PatientProfile.vue';
import { mdiClose } from '@mdi/js';

const props = defineProps({
  patientId: {
    type: String,
    required: true,
  },
});
</script>
