<template>
  <div class="p-6 bg-background-dark min-h-screen">
    <h1 class="text-4xl font-bold text-text-light tracking-wider mb-8">View Patients</h1>

    <!-- Search Bar -->
    <div class="mb-8">
      <div class="relative">
        <MdiIcon :path="mdiMagnify" size="24" class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or hospital number..."
          class="w-full pl-12 pr-4 py-4 bg-surface-dark border border-border-futuristic rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-lg"
        />
      </div>
    </div>

    <!-- Patient Cards -->
    <div v-if="filteredPatients.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="patient in filteredPatients" :key="patient.id"
        class="glass-card p-6 flex flex-col justify-between transition-all duration-300 hover:border-primary cursor-pointer"
        @click="viewPatient(patient.id)">
        <div>
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-2xl font-bold text-primary">{{ patient.name }} {{ patient.surname }}</p>
              <p class="text-sm text-text-muted">#{{ patient.hospitalNumber }}</p>
            </div>
            <div class="p-3 rounded-full bg-primary/20 text-primary">
              <MdiIcon :path="mdiAccountHeart" size="28" />
            </div>
          </div>
          <div class="space-y-2 text-text-light">
            <p><MdiIcon :path="mdiCakeVariant" size="16" class="inline mr-2" /> Age: {{ patient.age }}</p>
            <p><MdiIcon :path="mdiGenderMaleFemale" size="16" class="inline mr-2" /> Gender: {{ patient.gender }}</p>
            <p><MdiIcon :path="mdiPhone" size="16" class="inline mr-2" /> Phone: {{ patient.phone }}</p>
          </div>
        </div>
        <div class="text-right mt-4 text-sm text-primary hover:underline">
          View Profile &rarr;
        </div>
      </div>
    </div>
    <div v-else class="text-center text-text-muted py-20">
      <MdiIcon :path="mdiAccountSearch" size="64" class="mx-auto mb-4" />
      <p class="text-xl">No patients found.</p>
      <p v-if="searchQuery">Try adjusting your search query.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePatientStore } from '@/stores/patientStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import {
  mdiMagnify,
  mdiAccountHeart,
  mdiCakeVariant,
  mdiGenderMaleFemale,
  mdiPhone,
  mdiAccountSearch
} from '@mdi/js';

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
