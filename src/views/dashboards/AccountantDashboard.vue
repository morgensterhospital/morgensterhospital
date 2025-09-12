<template>
  <div class="space-y-6">
    <DischargeNotificationModal
      v-if="isDischargeModalOpen"
      :notification="selectedNotification"
      @close="closeDischargeModal"
      @approve="approveDischarge"
      @deny="denyDischarge"
    />
    <PatientProfileModal
      v-if="isPatientProfileModalOpen"
      :patient="selectedPatient"
      @close="closePatientProfileModal"
    />
    <!-- Welcome Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-text-light">
          Welcome, {{ authStore.user?.displayName || 'Accountant' }}!
        </h1>
        <p class="text-text-muted">Here is your financial overview.</p>
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

    <!-- Financial Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="p-6 bg-surface-dark rounded-lg">
        <div class="flex items-center justify-between">
          <p class="text-sm text-text-muted">Total Revenue</p>
          <MdiIcon :path="mdiCashMultiple" size="24" class="text-primary" />
        </div>
        <p class="text-3xl font-bold mt-2">${{ formatCurrency(financialStats.totalRevenue) }}</p>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg">
        <div class="flex items-center justify-between">
          <p class="text-sm text-text-muted">Monthly Growth</p>
          <MdiIcon :path="mdiTrendingUp" size="24" class="text-green-400" />
        </div>
        <p class="text-3xl font-bold mt-2">{{ financialStats.monthlyGrowth }}%</p>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg">
        <div class="flex items-center justify-between">
          <p class="text-sm text-text-muted">Pending Approvals</p>
          <MdiIcon :path="mdiAlertCircle" size="24" class="text-yellow-400" />
        </div>
        <p class="text-3xl font-bold mt-2">{{ financialStats.pendingApprovals }}</p>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg">
        <div class="flex items-center justify-between">
          <p class="text-sm text-text-muted">Invoices Processed</p>
          <MdiIcon :path="mdiFileDocument" size="24" class="text-indigo-400" />
        </div>
        <p class="text-3xl font-bold mt-2">{{ financialStats.invoicesProcessed }}</p>
      </div>
    </div>

    <!-- Actions and Patient Search -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quick Actions -->
      <div class="p-6 bg-surface-dark rounded-lg">
        <h2 class="text-lg font-semibold mb-4">Core Functions</h2>
        <div class="space-y-4">
          <button @click="navigateTo('/users')" class="w-full flex items-center p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
            <MdiIcon :path="mdiAccountGroup" size="24" class="mr-3 text-primary" />
            <span class="font-medium">User Management</span>
          </button>
          <button @click="navigateTo('/price-management')" class="w-full flex items-center p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
            <MdiIcon :path="mdiCurrencyUsd" size="24" class="mr-3 text-primary" />
            <span class="font-medium">Price List Management</span>
          </button>
          <button @click="navigateTo('/reports')" class="w-full flex items-center p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
            <MdiIcon :path="mdiChartLine" size="24" class="mr-3 text-primary" />
            <span class="font-medium">Financial Reports</span>
          </button>
        </div>
      </div>

      <!-- Notifications -->
      <div class="p-6 bg-surface-dark rounded-lg">
        <h2 class="text-lg font-semibold mb-4">Notifications</h2>
        <div class="space-y-4">
          <div v-if="dischargeNotifications.length === 0" class="text-center text-text-muted">No new notifications</div>
          <div v-for="notification in dischargeNotifications" :key="notification.id" class="p-4 bg-background-dark rounded-lg cursor-pointer" @click="openDischargeModal(notification)">
            <p><strong>{{ notification.patientName }}</strong> discharge request</p>
            <p class="text-sm text-text-muted">From Dr. {{ notification.doctorName }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Patient Search -->
    <div class="p-6 bg-surface-dark rounded-lg">
        <h2 class="text-lg font-semibold mb-4">Find a Patient's Financial Record</h2>
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
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import DischargeNotificationModal from '@/components/common/DischargeNotificationModal.vue';
import PatientProfileModal from '@/components/common/PatientProfileModal.vue';
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
  totalRevenue: 0.00,
  monthlyGrowth: 12.5,
  pendingApprovals: 8,
  invoicesProcessed: 156,
});
const dischargeNotifications = ref([]);
const selectedNotification = ref(null);
const isDischargeModalOpen = ref(false);

let timeInterval = null;

const fetchDischargeNotifications = async () => {
  try {
    dischargeNotifications.value = await patientStore.getDischargeNotifications();
  } catch (error) {
    console.error('Error fetching discharge notifications:', error);
  }
};

const openDischargeModal = (notification) => {
  selectedNotification.value = notification;
  isDischargeModalOpen.value = true;
};

const closeDischargeModal = () => {
  isDischargeModalOpen.value = false;
  selectedNotification.value = null;
};

const approveDischarge = async () => {
  if (selectedNotification.value) {
    await patientStore.updatePatientDischargeStatus(selectedNotification.value.patientId, 'approved');
    closeDischargeModal();
    fetchDischargeNotifications();
  }
};

const denyDischarge = async () => {
  if (selectedNotification.value) {
    await patientStore.updatePatientDischargeStatus(selectedNotification.value.patientId, 'denied');
    closeDischargeModal();
    fetchDischargeNotifications();
  }
};

const isPatientProfileModalOpen = ref(false);
const selectedPatient = ref(null);

const openPatientProfileModal = (patient) => {
  selectedPatient.value = patient;
  isPatientProfileModalOpen.value = true;
};

const closePatientProfileModal = () => {
  isPatientProfileModalOpen.value = false;
  selectedPatient.value = null;
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
  openPatientProfileModal(patient);
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
  fetchDischargeNotifications();
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>