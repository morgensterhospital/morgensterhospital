<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-text-light">View Patients</h1>

    <!-- Search Bar -->
    <div class="p-6 bg-surface-dark rounded-lg">
      <h2 class="text-lg font-semibold mb-4">Find a Patient</h2>
      <div class="relative">
        <MdiIcon :path="mdiMagnify" size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or hospital number..."
          class="w-full pl-10 pr-4 py-2 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary"
        />
      </div>
    </div>

    <!-- Patient Cards -->
    <div v-if="filteredPatients.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="patient in filteredPatients" :key="patient.id" class="p-6 bg-surface-dark rounded-lg">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xl font-bold text-text-light">{{ patient.name }} {{ patient.surname }}</p>
            <p class="text-sm text-text-muted">Hospital No: {{ patient.hospitalNumber }}</p>
          </div>
          <button @click="viewPatient(patient.id)" class="flex items-center text-primary hover:underline">
            <MdiIcon :path="mdiEye" size="20" class="mr-1" />
            View
          </button>
        </div>
        <div class="mt-4 space-y-2">
          <p><span class="font-semibold">Age:</span> {{ patient.age }}</p>
          <p><span class="font-semibold">Gender:</span> {{ patient.gender }}</p>
          <p><span class="font-semibold">Phone:</span> {{ patient.phone }}</p>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-text-muted py-10">
      <p>No patients found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePatientStore } from '@/stores/patientStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import { mdiMagnify, mdiEye } from '@mdi/js';

const router = useRouter();
const patientStore = usePatientStore();

const allPatients = ref([]);
const searchQuery = ref('');

onMounted(async () => {
  try {
    allPatients.value = await patientStore.getAllPatients();
  } catch (error) {
    console.error('Error fetching patients:', error);
  }
});

const filteredPatients = computed(() => {
  if (!searchQuery.value) {
    return allPatients.value;
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return allPatients.value.filter(patient =>
    (patient.name.toLowerCase() + ' ' + patient.surname.toLowerCase()).includes(lowerCaseQuery) ||
    patient.hospitalNumber.toLowerCase().includes(lowerCaseQuery)
  );
});

const viewPatient = (patientId) => {
  router.push(`/patient/${patientId}`);
};
</script>
