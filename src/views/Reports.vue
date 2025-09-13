<template>
  <div class="bg-gray-900 min-h-screen text-gray-200 font-sans">
    <!-- Header -->
    <header class="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <h1 class="text-xl font-bold text-white tracking-wider">Accountant Reports</h1>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <input type="date" v-model="dateFrom" class="bg-gray-700 border-gray-600 rounded-md px-3 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <span class="text-gray-500">to</span>
              <input type="date" v-model="dateTo" class="bg-gray-700 border-gray-600 rounded-md px-3 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <button @click="fetchReportData" :disabled="loading" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
              <MdiIcon v-if="loading" :path="mdiLoading" class="animate-spin mr-2" />
              <span>{{ loading ? 'Generating...' : 'Generate Report' }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>

code
Code
download
content_copy
expand_less

<!-- Main Content -->
<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div v-if="error" class="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-8">
    <p><strong>Error:</strong> {{ error }}</p>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Total Sales -->
    <div class="bg-gray-800/60 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-between">
      <div>
        <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Sales</h3>
        <p class="text-3xl font-bold text-white mt-2">${{ formatCurrency(reportData.totalSales) }}</p>
      </div>
      <div class="flex space-x-2 mt-4">
        <button @click="openModal('Total Sales', reportData.salesTransactions)" class="bg-gray-700 hover:bg-gray-600 text-xs font-bold py-1 px-3 rounded-md w-full">View</button>
        <button @click="downloadPdf('sales_summary', reportData.salesTransactions)" class="bg-gray-700 hover:bg-gray-600 text-xs font-bold py-1 px-3 rounded-md w-full">Download PDF</button>
      </div>
    </div>
    <!-- Total Cash -->
    <div class="bg-gray-800/60 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-between">
      <div>
        <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Cash</h3>
        <p class="text-3xl font-bold text-green-400 mt-2">${{ formatCurrency(reportData.totalCash) }}</p>
      </div>
      <div class="flex space-x-2 mt-4">
        <button @click="openModal('Total Cash', reportData.cashTransactions)" class="bg-gray-700 hover:bg-gray-600 text-xs font-bold py-1 px-3 rounded-md w-full">View</button>
        <button @click="downloadPdf('cash_summary', reportData.cashTransactions)" class="bg-gray-700 hover:bg-gray-600 text-xs font-bold py-1 px-3 rounded-md w-full">Download PDF</button>
      </div>
    </div>
    <!-- Total EFT -->
    <div class="bg-gray-800/60 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-between">
      <div>
        <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wider">Total EFT</h3>
        <p class="text-3xl font-bold text-blue-400 mt-2">${{ formatCurrency(reportData.totalEft) }}</p>
      </div>
      <div class="flex space-x-2 mt-4">
        <button @click="openModal('Total EFT', reportData.eftTransactions)" class="bg-gray-700 hover:bg-gray-600 text-xs font-bold py-1 px-3 rounded-md w-full">View</button>
        <button @click="downloadPdf('eft_summary', reportData.eftTransactions)" class="bg-gray-700 hover:bg-gray-600 text-xs font-bold py-1 px-3 rounded-md w-full">Download PDF</button>
      </div>
    </div>
    <!-- Total Unpaid -->
    <div class="bg-gray-800/60 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-between">
      <div>
        <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Unpaid</h3>
        <p class="text-3xl font-bold text-red-400 mt-2">${{ formatCurrency(reportData.totalUnpaid) }}</p>
      </div>
      <div class="flex space-x-2 mt-4">
        <button @click="openModal('Total Unpaid', reportData.unpaidTransactions)" class="bg-gray-700 hover:bg-gray-600 text-xs font-bold py-1 px-3 rounded-md w-full">View</button>
        <button @click="downloadPdf('unpaid_summary', reportData.unpaidTransactions)" class="bg-gray-700 hover:bg-gray-600 text-xs font-bold py-1 px-3 rounded-md w-full">Download PDF</button>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Unpaid Patients List -->
    <div class="bg-gray-800/60 p-6 rounded-lg shadow-lg border border-gray-700">
      <h3 class="text-lg font-semibold text-white mb-4">Unpaid Patients</h3>
      <div class="overflow-y-auto max-h-96">
        <ul v-if="reportData.unpaidTransactions.length > 0" class="space-y-3">
          <li v-for="transaction in reportData.unpaidTransactions" :key="transaction.patientId" @click="viewPatientProfile(transaction.patientId)" class="p-3 bg-gray-900/50 rounded-lg flex justify-between items-center border border-gray-700 hover:border-indigo-500 transition-all cursor-pointer">
            <div>
              <p class="font-semibold text-indigo-400">{{ transaction.patientName }}</p>
              <p class="text-sm text-gray-400">{{ formatDate(transaction.date) }}</p>
            </div>
            <p class="text-md font-mono text-red-400">${{ formatCurrency(transaction.amount) }}</p>
          </li>
        </ul>
        <div v-else class="text-center py-12 text-gray-500">
          <p>No unpaid patients for the selected period.</p>
        </div>
      </div>
    </div>

    <!-- Top Selling Items -->
    <div class="bg-gray-800/60 p-6 rounded-lg shadow-lg border border-gray-700">
      <h3 class="text-lg font-semibold text-white mb-4">Top Selling Items</h3>
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-400">
        <thead class="text-xs text-gray-300 uppercase bg-gray-700/50">
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">Item Name</th>
            <th scope="col" class="px-6 py-3 text-center">Quantity Sold</th>
            <th scope="col" class="px-6 py-3 text-right">Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="text-center py-8">
              <MdiIcon :path="mdiLoading" class="animate-spin text-4xl mx-auto" />
            </td>
          </tr>
          <tr v-else-if="reportData.topSellingItems.length === 0">
            <td colspan="4" class="text-center py-8 text-gray-500">No data for the selected period.</td>
          </tr>
          <tr v-for="(item, index) in reportData.topSellingItems" :key="item.id" class="border-b border-gray-700 hover:bg-gray-700/40">
            <td class="px-6 py-4 font-bold">{{ index + 1 }}</td>
            <td class="px-6 py-4 font-medium text-white">{{ item.name }}</td>
            <td class="px-6 py-4 text-center">{{ item.quantitySold }}</td>
            <td class="px-6 py-4 text-right font-mono">${{ formatCurrency(item.totalRevenue) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
  </div>
</main>

<!-- Details Modal -->
<ReportDetailsModal
  v-if="isModalOpen"
  :title="modalTitle"
  :transactions="modalTransactions"
  @close="isModalOpen = false"
  @view-patient="viewPatientProfile"
/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MdiIcon from '@/components/common/MdiIcon.vue';
import ReportDetailsModal from '@/components/common/ReportDetailsModal.vue';
import { mdiLoading } from '@mdi/js';
import apiService from '@/services/api'; // Import the real apiService

const router = useRouter();
const loading = ref(false);
const error = ref(null);
const dateFrom = ref('');
const dateTo = ref('');

const reportData = ref({
  totalSales: 0,
  totalCash: 0,
  totalEft: 0,
  totalUnpaid: 0,
  topSellingItems: [],
  salesTransactions: [],
  cashTransactions: [],
  eftTransactions: [],
  unpaidTransactions: [],
});

const isModalOpen = ref(false);
const modalTitle = ref('');
const modalTransactions = ref([]);

const openModal = (title, transactions) => {
  modalTitle.value = title;
  modalTransactions.value = transactions;
  isModalOpen.value = true;
};

const viewPatientProfile = (patientId) => {
  router.push(`/patient/${patientId}`);
};

const downloadPdf = async (reportType, transactions) => {
  try {
    // This will be fully implemented in a later step
    await apiService.generateReportPDF(reportType, transactions);
  } catch (err) {
    console.error(`Failed to download ${reportType} PDF:`, err);
    alert(`Could not generate PDF. ${err.message}`);
  }
};

const initializeDateRange = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));
  dateTo.value = today.toISOString().split('T')[0];
  dateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
};

const fetchReportData = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Replace the mock apiService with the real one
    // The getAccountantReport method needs to be added to the real apiService
    const data = await apiService.getAccountantReport({
      startDate: dateFrom.value,
      endDate: dateTo.value,
    });
    reportData.value = data;
  } catch (err) {
    error.value = err.message || 'An unknown error occurred.';
    console.error("Failed to fetch report data:", err);
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0.00';
  return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

onMounted(() => {
  initializeDateRange();
  // fetchReportData(); // Don't fetch on load, wait for user to click button
});
</script>

<style scoped>
/* Scoped styles can go here if needed, but we are using Tailwind CSS utility classes directly in the template. */
</style>
