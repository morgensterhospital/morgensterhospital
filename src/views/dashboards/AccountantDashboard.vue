<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Left Column -->
    <div class="space-y-6">
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Core Actions</h2>
        <div class="space-y-4">
          <button @click="navigateTo('/users')" class="w-full p-4 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-hover">
            <MdiIcon :path="mdiAccountGroup" size="24" />
            <span>User Management</span>
          </button>
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
            <span>Financial Reports</span>
          </button>
          <button @click="navigateTo('/price-management')" class="w-full p-4 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-hover">
            <MdiIcon :path="mdiCurrencyUsd" size="24" />
            <span>Price List Management</span>
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
        <h2 class="text-xl font-bold mb-4">Financial Snapshot</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-background-dark rounded-lg text-center">
            <MdiIcon :path="mdiCashMultiple" size="32" class="mx-auto text-primary" />
            <p class="mt-2 text-2xl font-bold">M{{ formatCurrency(financialStats.totalRevenue) }}</p>
            <p class="text-sm text-text-muted">Total Revenue</p>
          </div>
          <div class="p-4 bg-background-dark rounded-lg text-center">
            <MdiIcon :path="mdiTrendingUp" size="32" class="mx-auto text-green-500" />
            <p class="mt-2 text-2xl font-bold">{{ financialStats.monthlyGrowth }}%</p>
            <p class="text-sm text-text-muted">Monthly Growth</p>
          </div>
          <div class="p-4 bg-background-dark rounded-lg text-center">
            <MdiIcon :path="mdiAlertCircle" size="32" class="mx-auto text-yellow-500" />
            <p class="mt-2 text-2xl font-bold">{{ financialStats.pendingApprovals }}</p>
            <p class="text-sm text-text-muted">Pending Approvals</p>
          </div>
          <div class="p-4 bg-background-dark rounded-lg text-center">
            <MdiIcon :path="mdiFileDocument" size="32" class="mx-auto text-blue-500" />
            <p class="mt-2 text-2xl font-bold">{{ financialStats.invoicesProcessed }}</p>
            <p class="text-sm text-text-muted">Invoices Processed</p>
          </div>
        </div>
      </div>
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h3 class="text-lg font-bold mb-4">Quick Actions</h3>
        <div class="space-y-3">
          <button @click="approveDischarges" class="w-full text-left p-3 bg-background-dark rounded-lg hover:bg-primary/20">Approve Discharges</button>
          <button @click="reviewBilling" class="w-full text-left p-3 bg-background-dark rounded-lg hover:bg-primary/20">Review Billing</button>
          <button @click="exportReports" class="w-full text-left p-3 bg-background-dark rounded-lg hover:bg-primary/20">Export Reports</button>
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
  mdiChartLine,
  mdiMagnify,
  mdiCurrencyUsd,
  mdiCashMultiple,
  mdiTrendingUp,
  mdiAlertCircle,
  mdiFileDocument,
} from '@mdi/js';

const router = useRouter();
const authStore = useAuthStore();
const patientStore = usePatientStore();

const searchQuery = ref('');
const searchResults = ref([]);
const currentDate = ref('');
const currentTime = ref('');
const financialStats = ref({
  totalRevenue: 125000.00,
  monthlyGrowth: 12.5,
  pendingApprovals: 8,
  invoicesProcessed: 156,
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

const approveDischarges = () => {
  router.push('/discharges/pending');
};

const reviewBilling = () => {
  router.push('/billing/review');
};

const exportReports = () => {
  router.push('/reports/export');
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