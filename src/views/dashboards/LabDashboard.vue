<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-text-light">Laboratory Dashboard</h1>
      <p class="text-text-muted">
        Welcome, {{ authStore.user?.displayName || 'Lab Scientist' }}! Manage and track lab tests.
      </p>
    </div>

    <!-- Patient Search -->
    <div class="relative max-w-xl mx-auto">
      <MdiIcon :path="mdiMagnify" size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for a patient to view their lab history..."
        class="w-full pl-12 pr-4 py-3 bg-surface-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary"
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
            <p class="text-sm text-text-muted">ID: {{ patient.hospitalNumber }} &bull; Age: {{ patient.age }}</p>
          </li>
        </ul>
      </div>
    </div>

    <!-- Test Status Columns -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <RequestStatusColumn title="Incoming" :icon="mdiClockOutline" :items="incomingTests" @view="viewTest" color="blue" />
      <RequestStatusColumn title="Pending" :icon="mdiClockAlert" :items="pendingTests" @view="viewTest" color="yellow" />
      <RequestStatusColumn title="Completed" :icon="mdiCheckCircle" :items="doneTests" @view="viewTest" color="green" />
      <RequestStatusColumn title="Failed" :icon="mdiCloseCircle" :items="failedTests" @view="viewTest" color="red" />
    </div>

    <!-- Reports Section -->
    <div class="p-6 bg-surface-dark rounded-lg">
      <h2 class="text-lg font-semibold mb-4">Generate Reports</h2>
      <div class="flex flex-col sm:flex-row gap-4 items-end">
        <div class="flex-1">
          <label for="date-from" class="text-sm font-medium text-text-muted">From</label>
          <input v-model="reportDateFrom" id="date-from" type="date" class="mt-1 w-full p-2 bg-background-dark border border-gray-600 rounded-lg" />
        </div>
        <div class="flex-1">
          <label for="date-to" class="text-sm font-medium text-text-muted">To</label>
          <input v-model="reportDateTo" id="date-to" type="date" class="mt-1 w-full p-2 bg-background-dark border border-gray-600 rounded-lg" />
        </div>
        <button @click="generateReport" class="w-full sm:w-auto px-4 py-2 bg-primary text-background-dark font-semibold rounded-lg hover:bg-primary/90 transition-colors">
          Generate by Test Type
        </button>
        <button @click="downloadLabReportPDF" class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/30 transition-colors">
          <MdiIcon :path="mdiDownload" size="18" />
          Download PDF
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
import RequestStatusColumn from '@/components/common/RequestStatusColumn.vue';
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
      request.patientId = patientId;

      try {
        const patient = await patientStore.getPatient(patientId);
        request.patientName = `${patient.name} ${patient.surname}`;
      } catch (error) {
        request.patientName = 'Unknown Patient';
      }

      switch (request.status) {
        case 'pending':
          incoming.push(request);
          break;
        case 'in-progress':
          pending.push(request);
          break;
        case 'completed':
          done.push(request);
          break;
        case 'failed':
        case 'cancelled':
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

const viewTest = (test) => {
  router.push(`/patient/${test.patientId}?tab=laboratory&testId=${test.id}`);
};

const generateReport = () => {
  console.log('Generating report from', reportDateFrom.value, 'to', reportDateTo.value);
  // This would typically trigger a report generation service
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
  const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));
  reportDateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
  reportDateTo.value = today.toISOString().split('T')[0];
});

onUnmounted(() => {
  if (unsubscribeTests) {
    unsubscribeTests();
  }
});
</script>