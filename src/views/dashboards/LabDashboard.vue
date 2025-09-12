<template>
  <div class="space-y-6">
    <!-- Patient Search -->
    <div class="relative max-w-xl mx-auto">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search for a patient by name or hospital number..."
        @input="handleSearch"
        class="w-full bg-surface-dark border border-gray-700 rounded-full py-2 px-6 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <MdiIcon :path="mdiMagnify" size="20" class="absolute right-4 top-2.5 text-text-muted" />
      <div v-if="searchResults.length > 0" class="absolute mt-2 w-full bg-surface-dark border border-gray-700 rounded-lg shadow-lg z-10">
        <div
          v-for="patient in searchResults"
          :key="patient.id"
          class="p-3 cursor-pointer hover:bg-primary/20"
          @click="selectPatient(patient)"
        >
          <p class="font-semibold">{{ patient.name }} {{ patient.surname }}</p>
          <p class="text-sm text-text-muted">{{ patient.hospitalNumber }} • {{ patient.age }} years</p>
        </div>
      </div>
    </div>

    <!-- Test Status Columns -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <!-- Incoming Tests -->
      <div class="bg-surface-dark rounded-lg shadow-lg flex flex-col">
        <div class="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 class="font-bold text-lg flex items-center"><MdiIcon :path="mdiClockOutline" size="20" class="mr-2 text-yellow-400" /> Incoming</h3>
          <span class="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-sm font-semibold">{{ incomingTests.length }}</span>
        </div>
        <div class="p-4 space-y-3 overflow-y-auto h-96">
          <div v-for="test in incomingTests" :key="test.id" @click="viewTest(test)" class="p-3 bg-background-dark rounded-md cursor-pointer hover:bg-primary/10">
            <p class="font-semibold">{{ test.patientName }}</p>
            <p class="text-sm text-primary">{{ test.testType }}</p>
            <p class="text-xs text-text-muted mt-1">{{ formatTime(test.timestamp) }}</p>
          </div>
        </div>
      </div>

      <!-- Pending Tests -->
      <div class="bg-surface-dark rounded-lg shadow-lg flex flex-col">
        <div class="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 class="font-bold text-lg flex items-center"><MdiIcon :path="mdiClockAlert" size="20" class="mr-2 text-orange-400" /> Pending</h3>
          <span class="px-3 py-1 bg-orange-400/20 text-orange-300 rounded-full text-sm font-semibold">{{ pendingTests.length }}</span>
        </div>
        <div class="p-4 space-y-3 overflow-y-auto h-96">
          <div v-for="test in pendingTests" :key="test.id" @click="viewTest(test)" class="p-3 bg-background-dark rounded-md cursor-pointer hover:bg-primary/10">
            <p class="font-semibold">{{ test.patientName }}</p>
            <p class="text-sm text-primary">{{ test.testType }}</p>
            <p class="text-xs text-text-muted mt-1">{{ formatTime(test.timestamp) }}</p>
          </div>
        </div>
      </div>

      <!-- Done Tests -->
      <div class="bg-surface-dark rounded-lg shadow-lg flex flex-col">
        <div class="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 class="font-bold text-lg flex items-center"><MdiIcon :path="mdiCheckCircle" size="20" class="mr-2 text-green-400" /> Done</h3>
          <span class="px-3 py-1 bg-green-400/20 text-green-300 rounded-full text-sm font-semibold">{{ doneTests.length }}</span>
        </div>
        <div class="p-4 space-y-3 overflow-y-auto h-96">
          <div v-for="test in doneTests" :key="test.id" @click="viewTest(test)" class="p-3 bg-background-dark rounded-md cursor-pointer hover:bg-primary/10">
            <p class="font-semibold">{{ test.patientName }}</p>
            <p class="text-sm text-primary">{{ test.testType }}</p>
            <p class="text-xs text-text-muted truncate">{{ test.resultDetails }}</p>
            <p class="text-xs text-text-muted mt-1">{{ formatTime(test.resultTimestamp) }}</p>
          </div>
        </div>
      </div>

      <!-- Failed Tests -->
      <div class="bg-surface-dark rounded-lg shadow-lg flex flex-col">
        <div class="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 class="font-bold text-lg flex items-center"><MdiIcon :path="mdiCloseCircle" size="20" class="mr-2 text-red-400" /> Failed</h3>
          <span class="px-3 py-1 bg-red-400/20 text-red-300 rounded-full text-sm font-semibold">{{ failedTests.length }}</span>
        </div>
        <div class="p-4 space-y-3 overflow-y-auto h-96">
          <div v-for="test in failedTests" :key="test.id" @click="viewTest(test)" class="p-3 bg-background-dark rounded-md cursor-pointer hover:bg-primary/10">
            <p class="font-semibold">{{ test.patientName }}</p>
            <p class="text-sm text-primary">{{ test.testType }}</p>
            <p class="text-xs text-text-muted truncate">{{ test.resultDetails }}</p>
            <p class="text-xs text-text-muted mt-1">{{ formatTime(test.resultTimestamp) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Reports Section -->
    <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
      <h3 class="text-xl font-bold mb-4">Generate Reports</h3>
      <div class="flex flex-col md:flex-row gap-4 items-center">
        <input type="date" v-model="reportDateFrom" class="bg-background-dark border border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" />
        <input type="date" v-model="reportDateTo" class="bg-background-dark border border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" />
        <button @click="generateReport" class="w-full md:w-auto p-2 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-hover">
          <span>Generate by Test Type</span>
        </button>
        <button @click="downloadLabReportPDF" class="w-full md:w-auto p-2 bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-600">
          <MdiIcon :path="mdiDownload" size="20" />
          <span>Download PDF</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import apiService from '@/services/api';
import MdiIcon from '@/components/common/MdiIcon.vue';
import {
  mdiMagnify,
  mdiClockOutline,
  mdiClockAlert,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiDownload,
} from '@mdi/js';
import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';

const router = useRouter();
const authStore = useAuthStore();
const patientStore = usePatientStore();

const searchQuery = ref('');
const searchResults = ref([]);
const reportDateFrom = ref('');
const reportDateTo = ref('');

const incomingTests = ref([]);
const pendingTests = ref([]);
const doneTests = ref([]);
const failedTests = ref([]);

let unsubscribeTests = null;

const loadLabRequests = () => {
  const labRequestsQuery = collectionGroup(db, 'lab_requests');
  
  unsubscribeTests = onSnapshot(labRequestsQuery, async (snapshot) => {
    const incoming = [];
    const pending = [];
    const done = [];
    const failed = [];

    for (const doc of snapshot.docs) {
      const request = { id: doc.id, ...doc.data() };
      
      const patientId = doc.ref.parent.parent.id;
      try {
        const patient = await patientStore.getPatient(patientId);
        request.patientName = `${patient.name} ${patient.surname}`;
      } catch (error) {
        request.patientName = 'Unknown Patient';
      }

      switch (request.status) {
        case 'pending':
          if (request.resultDetails) {
            pending.push(request);
          } else {
            incoming.push(request);
          }
          break;
        case 'completed':
          done.push(request);
          break;
        case 'failed':
          failed.push(request);
          break;
        default:
          incoming.push(request);
      }
    }

    incomingTests.value = incoming;
    pendingTests.value = pending;
    doneTests.value = done;
    failedTests.value = failed;
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

const viewTest = (test) => {
  const patientId = test.patientId || 'unknown';
  router.push(`/patient/${patientId}?tab=laboratory&testId=${test.id}`);
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const generateReport = () => {
  console.log('Generating report from', reportDateFrom.value, 'to', reportDateTo.value);
};

const downloadLabReportPDF = async () => {
  try {
    await apiService.generateReportPDF('lab_report', reportDateFrom.value, reportDateTo.value, authStore.user.uid);
  } catch (error) {
    console.error('Error downloading lab report PDF:', error);
    alert('Error generating PDF report. Please try again.');
  }
};

onMounted(() => {
  loadLabRequests();
  
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  reportDateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
  reportDateTo.value = today.toISOString().split('T')[0];
});

onUnmounted(() => {
  if (unsubscribeTests) {
    unsubscribeTests();
  }
});
</script>

<style scoped>
/* All styles are handled by Tailwind CSS utility classes */
</style>