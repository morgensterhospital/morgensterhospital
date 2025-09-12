<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Left Column -->
    <div class="space-y-6">
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Patient Actions</h2>
        <div class="space-y-4">
          <button @click="navigateTo('/patient/register')" class="w-full p-4 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-hover">
            <MdiIcon :path="mdiAccountPlus" size="24" />
            <span>New Patient Registration</span>
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
        </div>
      </div>
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Quick Reports</h2>
        <button @click="navigateTo('/reports')" class="w-full p-4 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-hover">
          <MdiIcon :path="mdiChartLine" size="24" />
          <span>View All Reports</span>
        </button>
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
        <h2 class="text-xl font-bold mb-4">This Month's Sales</h2>
        <div class="space-y-4">
          <div class="flex items-center">
            <div class="p-3 bg-blue-500 rounded-lg mr-4">
              <MdiIcon :path="mdiCashMultiple" size="24" class="text-white" />
            </div>
            <div>
              <p class="text-sm text-text-muted">Total Sales</p>
              <p class="text-xl font-bold">M{{ formatCurrency(monthlyStats.totalSales) }}</p>
            </div>
          </div>
          <div class="flex items-center">
            <div class="p-3 bg-green-500 rounded-lg mr-4">
              <MdiIcon :path="mdiCheckCircle" size="24" class="text-white" />
            </div>
            <div>
              <p class="text-sm text-text-muted">Paid Sales</p>
              <p class="text-xl font-bold">M{{ formatCurrency(monthlyStats.paidSales) }}</p>
            </div>
          </div>
          <div class="flex items-center">
            <div class="p-3 bg-yellow-500 rounded-lg mr-4">
              <MdiIcon :path="mdiClockAlert" size="24" class="text-white" />
            </div>
            <div>
              <p class="text-sm text-text-muted">Unpaid Sales</p>
              <p class="text-xl font-bold">M{{ formatCurrency(monthlyStats.unpaidSales) }}</p>
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
  currentDate.value = now.toLocaleDateString('en-US', { dateStyle: 'long' });
  currentTime.value = now.toLocaleTimeString('en-US', { timeStyle: 'short' });
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

<style scoped>
/* All styles are handled by Tailwind CSS utility classes */
</style>