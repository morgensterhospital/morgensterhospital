<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Left Column -->
    <div class="space-y-6">
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Core Actions</h2>
        <div class="space-y-4">
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search for a patient..."
              @input="handleSearch"
              class="w-full bg-background-dark border border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <MdiIcon :path="mdiMagnify" size="20" class="absolute right-3 top-2.5 text-text-muted" />
          </div>
          <div v-if="searchResults.length > 0" class="space-y-2">
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
          <button @click="navigateTo('/reports')" class="w-full p-4 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-hover">
            <MdiIcon :path="mdiChartLine" size="24" />
            <span>Reports & Analytics</span>
          </button>
          <button @click="printCashSales" class="w-full p-4 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-hover">
            <MdiIcon :path="mdiPrinter" size="24" />
            <span>Print Cash Sales</span>
          </button>
          <button @click="navigateTo('/approvals')" class="w-full p-4 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-hover">
            <MdiIcon :path="mdiCheckDecagram" size="24" />
            <span>Approve Balances</span>
          </button>
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
        <h2 class="text-xl font-bold mb-4">Supervisory Stats</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-background-dark rounded-lg text-center">
            <MdiIcon :path="mdiAccountSupervisor" size="32" class="mx-auto text-primary" />
            <p class="mt-2 text-2xl font-bold">{{ supervisoryStats.clerksSupervised }}</p>
            <p class="text-sm text-text-muted">Clerks Supervised</p>
          </div>
          <div class="p-4 bg-background-dark rounded-lg text-center">
            <MdiIcon :path="mdiClockAlert" size="32" class="mx-auto text-yellow-500" />
            <p class="mt-2 text-2xl font-bold">{{ supervisoryStats.pendingApprovals }}</p>
            <p class="text-sm text-text-muted">Pending Approvals</p>
          </div>
          <div class="p-4 bg-background-dark rounded-lg text-center">
            <MdiIcon :path="mdiCashMultiple" size="32" class="mx-auto text-green-500" />
            <p class="mt-2 text-2xl font-bold">M{{ formatCurrency(supervisoryStats.todayCashSales) }}</p>
            <p class="text-sm text-text-muted">Today's Cash Sales</p>
          </div>
          <div class="p-4 bg-background-dark rounded-lg text-center">
            <MdiIcon :path="mdiFileDocument" size="32" class="mx-auto text-blue-500" />
            <p class="mt-2 text-2xl font-bold">{{ supervisoryStats.reportsGenerated }}</p>
            <p class="text-sm text-text-muted">Reports Generated</p>
          </div>
        </div>
      </div>
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg text-center">
        <MdiIcon :path="mdiAccountTie" size="48" class="mx-auto text-primary" />
        <h3 class="text-xl font-bold mt-4">Account Assistant</h3>
        <p class="text-text-muted mt-2">Monitor, approve, and report on financial activities.</p>
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
  mdiChartLine,
  mdiMagnify,
  mdiPrinter,
  mdiCheckDecagram,
  mdiAccountSupervisor,
  mdiClockAlert,
  mdiCashMultiple,
  mdiFileDocument,
  mdiAccountTie,
} from '@mdi/js';

const router = useRouter();
const authStore = useAuthStore();
const patientStore = usePatientStore();

const searchQuery = ref('');
const searchResults = ref([]);
const currentDate = ref('');
const currentTime = ref('');
const supervisoryStats = ref({
  clerksSupervised: 5,
  pendingApprovals: 12,
  todayCashSales: 8500.00,
  reportsGenerated: 24,
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

const printCashSales = () => {
  console.log('Printing cash sales report...');
  // Implement print functionality here
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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

<style scoped>
/* All styles are handled by Tailwind CSS utility classes */
</style>