<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-light">
          Accounts Clerk Dashboard
        </h1>
        <p class="text-text-muted">
          Welcome, {{ authStore.user?.displayName || 'Clerk' }}! Manage patient registrations and view sales summaries.
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

    <!-- Key Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 bg-surface-dark rounded-lg">
        <h2 class="text-lg font-semibold mb-4">Key Functions</h2>
        <div class="space-y-4">
          <button @click="navigateTo('/patient/register')" class="w-full flex items-center p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
            <MdiIcon :path="mdiAccountPlus" size="24" class="mr-3 text-primary" />
            <span class="font-medium">New Patient Registration</span>
          </button>
          <button @click="navigateTo('/reports')" class="w-full flex items-center p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
            <MdiIcon :path="mdiChartLine" size="24" class="mr-3 text-primary" />
            <span class="font-medium">View Reports</span>
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

    <!-- Monthly Sales Summary -->
    <div>
      <h2 class="text-lg font-semibold mb-4">This Month's Sales</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 bg-surface-dark rounded-lg">
          <div class="flex items-center space-x-4">
            <MdiIcon :path="mdiCashMultiple" size="28" class="text-primary" />
            <div>
              <p class="text-sm text-text-muted">Total Sales</p>
              <p class="text-2xl font-bold">M{{ formatCurrency(monthlyStats.totalSales) }}</p>
            </div>
          </div>
        </div>
        <div class="p-6 bg-surface-dark rounded-lg">
          <div class="flex items-center space-x-4">
            <MdiIcon :path="mdiCheckCircle" size="28" class="text-green-400" />
            <div>
              <p class="text-sm text-text-muted">Paid Sales</p>
              <p class="text-2xl font-bold">M{{ formatCurrency(monthlyStats.paidSales) }}</p>
            </div>
          </div>
        </div>
        <div class="p-6 bg-surface-dark rounded-lg">
          <div class="flex items-center space-x-4">
            <MdiIcon :path="mdiClockAlert" size="28" class="text-yellow-400" />
            <div>
              <p class="text-sm text-text-muted">Unpaid Sales</p>
              <p class="text-2xl font-bold">M{{ formatCurrency(monthlyStats.unpaidSales) }}</p>
            </div>
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
  mdiAccountPlus,
  mdiChartLine,
  mdiMagnify,
  mdiCashMultiple,
  mdiCheckCircle,
  mdiClockAlert,
} from '@mdi/js';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';

const router = useRouter();
const authStore = useAuthStore();
const patientStore = usePatientStore();

const searchQuery = ref('');
const searchResults = ref([]);
const currentDate = ref('');
const currentTime = ref('');
const monthlyStats = ref({
  totalSales: 0,
  paidSales: 0,
  unpaidSales: 0,
});

let timeInterval = null;
let statsUnsubscribe = null;

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

const loadMonthlyStats = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const invoicesQuery = query(
    collection(db, 'invoices'),
    where('creationDate', '>=', startOfMonth),
    where('creationDate', '<=', endOfMonth)
  );

  statsUnsubscribe = onSnapshot(invoicesQuery, (snapshot) => {
    let totalSales = 0;
    let paidSales = 0;
    let unpaidSales = 0;

    snapshot.forEach((doc) => {
      const invoice = doc.data();
      totalSales += invoice.totalAmount || 0;
      if (invoice.status === 'paid') {
        paidSales += invoice.amountPaid || 0;
      } else {
        unpaidSales += invoice.balance || 0;
      }
    });

    monthlyStats.value = { totalSales, paidSales, unpaidSales };
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

onMounted(() => {
  updateDateTime();
  timeInterval = setInterval(updateDateTime, 1000);
  loadMonthlyStats();
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  if (statsUnsubscribe) {
    statsUnsubscribe();
  }
});
</script>