<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-light">
          Doctor's Dashboard
        </h1>
        <p class="text-text-muted">
          Welcome, {{ authStore.user?.displayName || 'Doctor' }}! Here's your daily overview.
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <div class="p-4 bg-surface-dark rounded-lg text-center">
          <p class="text-sm text-text-muted">Date</p>
          <p class="text-lg font-semibold text-text-light">{{ currentDate }}</p>
        </div>
        <div class="p-4 bg-surface-dark rounded-lg text-center">
          <p class="text-sm text-text-muted">Time</p>
          <p class="text-lg font-semibold text-text-light">{{ currentTime }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions & Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Actions -->
      <div class="lg:col-span-1 p-6 bg-surface-dark rounded-lg">
        <h2 class="text-lg font-semibold mb-4">Common Actions</h2>
        <div class="space-y-4">
          <button @click="navigateTo('/patient/register')" class="w-full flex items-center p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
            <MdiIcon :path="mdiAccountPlus" size="24" class="mr-3 text-primary" />
            <span class="font-medium">New Patient Registration</span>
          </button>
          <div class="relative">
            <MdiIcon :path="mdiMagnify" size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for a patient..."
              class="w-full pl-12 pr-4 py-3 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary"
              @input="handleSearch"
            />
            <div
              v-if="searchResults.length > 0"
              class="absolute top-full mt-2 w-full bg-background-dark border border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
            >
              <ul>
                <li
                  v-for="patient in searchResults"
                  :key="patient.id"
                  class="px-4 py-3 hover:bg-primary/10 cursor-pointer"
                  @click="selectPatient(patient)"
                >
                  <p class="font-semibold">{{ patient.name }} {{ patient.surname }}</p>
                  <p class="text-sm text-text-muted">
                    ID: {{ patient.hospitalNumber }} &bull; Age: {{ patient.age }}
                  </p>
                </li>
              </ul>
            </div>
          </div>
          <button @click="openDischargeModal" class="w-full flex items-center p-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors">
            <MdiIcon :path="mdiClipboardArrowUpOutline" size="24" class="mr-3 text-blue-400" />
            <span class="font-medium">Request Patient Discharge</span>
          </button>
        </div>
      </div>

      <!-- Today's Stats -->
      <div class="lg:col-span-2 p-6 bg-surface-dark rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="flex flex-col items-center justify-center p-6 bg-background-dark rounded-lg">
          <p class="text-6xl font-bold text-primary">{{ todayStats.appointments }}</p>
          <p class="mt-2 text-text-muted">Today's Appointments</p>
        </div>
        <div class="flex flex-col items-center justify-center p-6 bg-background-dark rounded-lg">
          <p class="text-6xl font-bold text-primary">{{ todayStats.prescriptions }}</p>
          <p class="mt-2 text-text-muted">Prescriptions Written</p>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Discharge Confirmation Modal -->
<div v-if="isDischargeModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-surface-dark rounded-lg p-8 max-w-md w-full shadow-xl">
    <h2 class="text-xl font-bold text-text-light mb-4">Confirm Discharge Request</h2>
    <p class="text-text-muted mb-6">
      Are you sure you want to request the discharge for patient
      <strong class="text-primary">{{ patientToDischarge.name }}</strong>?
    </p>
    <div class="flex justify-end space-x-4">
      <M3Button variant="outlined" @click="closeDischargeModal">Cancel</M3Button>
      <M3Button variant="filled" @click="requestDischarge">Confirm Request</M3Button>
    </div>
  </div>
</div>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import {
  mdiAccountPlus,
  mdiMagnify,
  mdiClipboardArrowUpOutline,
} from '@mdi/js';
import M3Button from '@/components/common/M3Button.vue';

const router = useRouter();
const authStore = useAuthStore();
const patientStore = usePatientStore();

const searchQuery = ref('');
const searchResults = ref([]);
const currentDate = ref('');
const currentTime = ref('');
const todayStats = ref({
  appointments: 12,
  prescriptions: 8,
});
const isDischargeModalOpen = ref(false);
const patientToDischarge = ref({ id: '', name: '' });

let timeInterval = null;

const openDischargeModal = (patient) => {
  patientToDischarge.value = patient;
  isDischargeModalOpen.value = true;
};

const closeDischargeModal = () => {
  isDischargeModalOpen.value = false;
};

const requestDischarge = async () => {
  try {
    await patientStore.createDischargeNotification({
      patientId: patientToDischarge.value.id,
      patientName: patientToDischarge.value.name,
    });
    closeDischargeModal();
    alert('Discharge request sent successfully!');
  } catch (error) {
    console.error('Failed to send discharge request:', error);
    alert('Failed to send discharge request. Please try again.');
  }
};

const updateDateTime = () => {
  const now = new Date();
  currentDate.value = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const handleSearch = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }
  try {
    searchResults.value = await patientStore.searchPatients(searchQuery.value);
  } catch (error) {
    console.error('Search error:', error);
    searchResults.value = [];
  }
};

const selectPatient = (patient) => {
  openDischargeModal(patient);
  searchQuery.value = '';
  searchResults.value = [];
};

const navigateTo = (path) => {
  router.push(path);
};

onMounted(() => {
  updateDateTime();
  timeInterval = setInterval(updateDateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>