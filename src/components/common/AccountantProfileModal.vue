<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-background-dark rounded-lg shadow-xl w-full h-full max-w-6xl max-h-full flex flex-col">
      <header class="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 class="text-xl font-bold text-text-light">Patient Profile</h2>
        <button @click="$emit('close')" class="text-text-muted hover:text-white">
          <MdiIcon :path="mdiClose" size="24" />
        </button>
      </header>
      <div class="overflow-y-auto flex-grow">
        <AccountantPatientProfile v-if="patient" :patient="patient" />
        <div v-else class="p-8 text-center text-text-muted">Loading patient data...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, watch } from 'vue';
import { usePatientStore } from '@/stores/patientStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import AccountantPatientProfile from '@/views/patient/AccountantPatientProfile.vue';
import { mdiClose } from '@mdi/js';

const props = defineProps({
  patientId: {
    type: String,
    required: true,
  },
});

const patientStore = usePatientStore();
const patient = ref(null);

const fetchPatient = async (id) => {
  if (id) {
    patient.value = await patientStore.getPatient(id);
  }
};

onMounted(() => {
  fetchPatient(props.patientId);
});

watch(() => props.patientId, (newId) => {
  fetchPatient(newId);
});
</script>
