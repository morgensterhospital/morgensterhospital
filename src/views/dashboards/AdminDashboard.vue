<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left Column -->
    <div class="lg:col-span-2 space-y-6">
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button @click="navigateTo('/users')" class="p-4 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-hover">
            <MdiIcon :path="mdiAccountGroup" size="24" />
            <span>User Management</span>
          </button>
          <button @click="navigateTo('/patient/register')" class="p-4 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-hover">
            <MdiIcon :path="mdiAccountPlus" size="24" />
            <span>New Patient Registration</span>
          </button>
          <button @click="navigateTo('/reports')" class="p-4 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-hover">
            <MdiIcon :path="mdiChartLine" size="24" />
            <span>Reports</span>
          </button>
          <button @click="navigateTo('/settings')" class="p-4 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-hover">
            <MdiIcon :path="mdiCog" size="24" />
            <span>System Settings</span>
          </button>
        </div>
      </div>
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Patient Search</h2>
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by name or hospital number..."
            @input="handleSearch"
            class="w-full bg-background-dark border border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <MdiIcon :path="mdiMagnify" size="20" class="absolute right-3 top-2.5 text-text-muted" />
        </div>
        <div v-if="searchResults.length > 0" class="mt-4 space-y-2">
          <div
            v-for="patient in searchResults"
            :key="patient.id"
            class="p-3 bg-background-dark rounded-md cursor-pointer hover:bg-primary/20"
            @click="selectPatient(patient)"
          >
            <p class="font-semibold">{{ patient.name }} {{ patient.surname }}</p>
            <p class="text-sm text-text-muted">{{ patient.hospitalNumber }} • {{ patient.age }} years</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column -->
    <div class="space-y-6">
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <p class="text-sm text-text-muted">Date</p>
            <p class="text-lg font-bold">{{ currentDate }}</p>
          </div>
          <div>
            <p class="text-sm text-text-muted">Time</p>
            <p class="text-lg font-bold">{{ currentTime }}</p>
          </div>
        </div>
      </div>
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">System Stats</h2>
        <div class="space-y-4">
          <div class="flex items-center">
            <div class="p-3 bg-primary rounded-lg mr-4">
              <MdiIcon :path="mdiAccountGroup" size="24" class="text-background-dark" />
            </div>
            <div>
              <p class="text-sm text-text-muted">Total Users</p>
              <p class="text-xl font-bold">{{ systemStats.totalUsers }}</p>
            </div>
          </div>
          <div class="flex items-center">
            <div class="p-3 bg-green-500 rounded-lg mr-4">
              <MdiIcon :path="mdiAccountPlus" size="24" class="text-background-dark" />
            </div>
            <div>
              <p class="text-sm text-text-muted">Total Patients</p>
              <p class="text-xl font-bold">{{ systemStats.totalPatients }}</p>
            </div>
          </div>
          <div class="flex items-center">
            <div class="p-3 bg-yellow-500 rounded-lg mr-4">
              <MdiIcon :path="mdiHospitalBuilding" size="24" class="text-background-dark" />
            </div>
            <div>
              <p class="text-sm text-text-muted">Active Departments</p>
              <p class="text-xl font-bold">{{ systemStats.activeDepartments }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg text-center">
        <h3 class="text-lg font-bold text-primary">Morgenster Hospital</h3>
        <p class="text-text-muted mt-2">Welcome, {{ authStore.user?.displayName || 'Admin' }}!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import {
  mdiAccountGroup,
  mdiAccountPlus,
  mdiChartLine,
  mdiMagnify,
  mdiCog,
  mdiHospitalBuilding,
} from '@mdi/js';

const router = useRouter();
const authStore = useAuthStore();
const patientStore = usePatientStore();

const searchQuery = ref('');
const searchResults = ref([]);
const currentDate = ref('');
const currentTime = ref('');
const systemStats = ref({
  totalUsers: 147,
  totalPatients: 0,
  activeDepartments: 8,
});

let timeInterval = null;

const updateDateTime = () => {
  const now = new Date();
  currentDate.value = now.toLocaleDateString('en-US', { dateStyle: 'long' });
  currentTime.value = now.toLocaleTimeString('en-US', { timeStyle: 'short' });
};

const handleSearch = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }
  try {
    const results = await patientStore.searchPatients(searchQuery.value);
    searchResults.value = results;
  } catch (error) {
    console.error('Search error:', error);
  }
};

const selectPatient = (patient) => {
  router.push(`/patient/${patient.id}`);
  searchQuery.value = '';
  searchResults.value = [];
};

const navigateTo = (path) => {
  router.push(path);
};

onMounted(() => {
  updateDateTime();
  timeInterval = setInterval(updateDateTime, 1000);
  // Fetch initial stats if needed
  // patientStore.fetchTotalPatients().then(count => systemStats.value.totalPatients = count);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped>
/* All styles are handled by Tailwind CSS utility classes */
</style>