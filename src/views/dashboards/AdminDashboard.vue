<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-text-light">
          Welcome, {{ authStore.user?.displayName || 'Admin' }}!
        </h1>
        <p class="text-text-muted">Here's a summary of the hospital's status.</p>
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

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 bg-surface-dark rounded-lg flex items-center space-x-4">
        <div class="p-3 rounded-full bg-primary/20 text-primary">
          <MdiIcon :path="mdiAccountGroup" size="28" />
        </div>
        <div>
          <p class="text-sm text-text-muted">Total Users</p>
          <p class="text-2xl font-bold text-text-light">{{ systemStats.totalUsers }}</p>
        </div>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg flex items-center space-x-4">
        <div class="p-3 rounded-full bg-green-500/20 text-green-400">
          <MdiIcon :path="mdiAccountPlus" size="28" />
        </div>
        <div>
          <p class="text-sm text-text-muted">Total Patients</p>
          <p class="text-2xl font-bold text-text-light">{{ systemStats.totalPatients }}</p>
        </div>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg flex items-center space-x-4">
        <div class="p-3 rounded-full bg-yellow-500/20 text-yellow-400">
          <MdiIcon :path="mdiHospitalBuilding" size="28" />
        </div>
        <div>
          <p class="text-sm text-text-muted">Active Departments</p>
          <p class="text-2xl font-bold text-text-light">{{ systemStats.activeDepartments }}</p>
        </div>
      </div>
    </div>

    <!-- Actions and Patient Search -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quick Actions -->
      <div class="p-6 bg-surface-dark rounded-lg">
        <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            @click="navigateTo('/user-management')"
            class="flex items-center p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <MdiIcon :path="mdiAccountGroup" size="24" class="mr-3 text-primary" />
            <span class="font-medium">User Management</span>
          </button>
          <button
            @click="navigateTo('/patients')"
            class="flex items-center p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <MdiIcon :path="mdiAccountPlus" size="24" class="mr-3 text-primary" />
            <span class="font-medium">View Patients</span>
          </button>
          <button
            @click="navigateTo('/reports')"
            class="flex items-center p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <MdiIcon :path="mdiChartLine" size="24" class="mr-3 text-primary" />
            <span class="font-medium">Reports</span>
          </button>
          <button
            @click="navigateTo('/settings')"
            class="flex items-center p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <MdiIcon :path="mdiCog" size="24" class="mr-3 text-primary" />
            <span class="font-medium">Settings</span>
          </button>
        </div>
      </div>

      <!-- Patient Search -->
      <div class="p-6 bg-surface-dark rounded-lg">
        <h2 class="text-lg font-semibold mb-4">Find a Patient</h2>
        <div class="relative">
          <MdiIcon :path="mdiMagnify" size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or hospital number..."
            class="w-full pl-10 pr-4 py-2 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary"
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
  totalUsers: 0,
  totalPatients: 0,
  activeDepartments: 0,
});

let timeInterval = null;

const fetchSystemStats = async () => {
  try {
    const response = await fetch('/.netlify/functions/get-system-stats');
    if (!response.ok) {
      throw new Error('Failed to fetch system stats');
    }
    const stats = await response.json();
    systemStats.value.totalUsers = stats.totalUsers;
    systemStats.value.totalPatients = stats.totalPatients;
    systemStats.value.activeDepartments = stats.activeDepartments;
  } catch (error) {
    console.error('Error fetching system stats:', error);
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
  // Fetch initial stats
  fetchSystemStats();
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>