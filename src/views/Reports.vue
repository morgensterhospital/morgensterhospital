<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Financial Reports</h1>

    <!-- Date Range Selector -->
    <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
      <h2 class="text-xl font-bold mb-4 text-center">Select Report Period</h2>
      <div class="flex flex-col md:flex-row justify-center items-center gap-4">
        <input v-model="dateFrom" type="date" class="bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary" />
        <span class="text-text-muted">to</span>
        <input v-model="dateTo" type="date" class="bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary" />
        <button @click="generateReports" :disabled="loading" class="px-6 py-2 bg-primary text-background-dark font-bold rounded-lg hover:bg-primary-hover disabled:opacity-50">
          {{ loading ? 'Generating...' : 'Generate Reports' }}
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <div class="p-6 bg-surface-dark rounded-lg">
        <div class="flex items-center gap-4">
          <MdiIcon :path="mdiCashMultiple" size="32" class="text-blue-400" />
          <div>
            <p class="text-text-muted text-sm">Total Sales</p>
            <p class="text-2xl font-bold">M{{ formatCurrency(reportData.totalSales) }}</p>
          </div>
        </div>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg">
        <div class="flex items-center gap-4">
          <MdiIcon :path="mdiCash" size="32" class="text-green-400" />
          <div>
            <p class="text-text-muted text-sm">Cash Sales</p>
            <p class="text-2xl font-bold">M{{ formatCurrency(reportData.cashSales) }}</p>
          </div>
        </div>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg">
        <div class="flex items-center gap-4">
          <MdiIcon :path="mdiCreditCard" size="32" class="text-purple-400" />
          <div>
            <p class="text-text-muted text-sm">EFT Sales</p>
            <p class="text-2xl font-bold">M{{ formatCurrency(reportData.eftSales) }}</p>
          </div>
        </div>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg">
        <div class="flex items-center gap-4">
          <MdiIcon :path="mdiClockAlert" size="32" class="text-red-400" />
          <div>
            <p class="text-text-muted text-sm">Unpaid Sales</p>
            <p class="text-2xl font-bold">M{{ formatCurrency(reportData.unpaidSales) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Lists -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h3 class="text-lg font-bold mb-4">Unpaid Patients</h3>
        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div v-if="unpaidPatients.length === 0" class="text-center py-8 text-text-muted">No unpaid patients.</div>
          <div v-for="patient in unpaidPatients" :key="patient.id" @click="viewPatientBilling(patient.id)" class="p-3 bg-background-dark rounded-md flex justify-between items-center cursor-pointer hover:bg-primary/10">
            <div>
              <p class="font-semibold">{{ patient.name }} {{ patient.surname }}</p>
              <p class="text-xs text-text-muted">{{ patient.hospitalNumber }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-red-400">M{{ formatCurrency(patient.balance) }}</p>
              <p class="text-xs text-text-muted">{{ formatDate(patient.lastInvoiceDate) }}</p>
            </div>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <button @click="downloadUnpaidPatientsPDF" class="flex-1 py-2 text-sm bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">Download PDF</button>
          <button @click="exportUnpaidPatients" class="flex-1 py-2 text-sm bg-green-500/20 text-green-300 rounded hover:bg-green-500/30">Export CSV</button>
        </div>
      </div>
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h3 class="text-lg font-bold mb-4">Top 20 Selling Items</h3>
        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div v-if="topSellingItems.length === 0" class="text-center py-8 text-text-muted">No sales data available.</div>
          <div v-for="(item, index) in topSellingItems" :key="item.id" class="p-3 bg-background-dark rounded-md flex justify-between items-center">
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold text-text-muted">{{ index + 1 }}.</span>
              <div>
                <p class="font-semibold">{{ item.name }}</p>
                <p class="text-xs text-text-muted">{{ item.quantitySold }} units sold</p>
              </div>
            </div>
            <p class="font-bold text-primary">M{{ formatCurrency(item.totalRevenue) }}</p>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <button @click="downloadTopItemsPDF" class="flex-1 py-2 text-sm bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">Download PDF</button>
          <button @click="exportTopItems" class="flex-1 py-2 text-sm bg-green-500/20 text-green-300 rounded hover:bg-green-500/30">Export CSV</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import apiService from '@/services/api';
import MdiIcon from '@/components/common/MdiIcon.vue';
import { mdiChevronRight, mdiCashMultiple, mdiCash, mdiCreditCard, mdiClockAlert, mdiDownload } from '@mdi/js';
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const dateFrom = ref('');
const dateTo = ref('');

const reportData = ref({ totalSales: 0, cashSales: 0, eftSales: 0, unpaidSales: 0 });
const unpaidPatients = ref([]);
const topSellingItems = ref([]);

const initializeDateRange = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  dateTo.value = today.toISOString().split('T')[0];
  dateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
};

const generateReports = async () => {
  loading.value = true;
  try {
    const fromDate = new Date(dateFrom.value);
    const toDate = new Date(dateTo.value);
    toDate.setHours(23, 59, 59, 999);

    const invoicesQuery = collectionGroup(db, 'invoices');
    const invoicesSnapshot = await getDocs(invoicesQuery);

    let totalSales = 0, cashSales = 0, eftSales = 0, unpaidSales = 0;
    const unpaidList = [];
    const itemsSold = {};

    for (const doc of invoicesSnapshot.docs) {
      const invoice = doc.data();
      const invoiceDate = invoice.creationDate?.toDate();
      if (invoiceDate && invoiceDate >= fromDate && invoiceDate <= toDate) {
        totalSales += invoice.totalAmount || 0;
        if (invoice.status === 'paid') {
          if (invoice.paymentMethod === 'cash') cashSales += invoice.amountPaid || 0;
          else if (invoice.paymentMethod === 'eft') eftSales += invoice.amountPaid || 0;
        } else {
          unpaidSales += invoice.balance || 0;
          const patientId = doc.ref.parent.parent.id;
          const patientDoc = await getDocs(query(collection(db, 'patients'), where('__name__', '==', patientId)));
          if (!patientDoc.empty) {
            const patient = patientDoc.docs[0].data();
            unpaidList.push({ id: patientId, name: patient.name, surname: patient.surname, hospitalNumber: patient.hospitalNumber, phone: patient.phone, balance: invoice.balance || 0, lastInvoiceDate: invoiceDate });
          }
        }
        const itemsQuery = collection(db, doc.ref.path + '/items');
        const itemsSnapshot = await getDocs(itemsQuery);
        itemsSnapshot.forEach(itemDoc => {
          const item = itemDoc.data();
          const itemId = item.id || item.description;
          if (!itemsSold[itemId]) itemsSold[itemId] = { id: itemId, name: item.description, quantitySold: 0, totalRevenue: 0, unitPrice: item.unitPrice || 0 };
          itemsSold[itemId].quantitySold += item.quantity || 0;
          itemsSold[itemId].totalRevenue += item.totalPrice || 0;
        });
      }
    }
    reportData.value = { totalSales, cashSales, eftSales, unpaidSales };
    unpaidPatients.value = unpaidList.sort((a, b) => b.balance - a.balance).slice(0, 50);
    topSellingItems.value = Object.values(itemsSold).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 20);
  } catch (error) {
    console.error('Error generating reports:', error);
    alert('Error generating reports. Please try again.');
  } finally {
    loading.value = false;
  }
};

const downloadFinancialPDF = async () => {
  loading.value = true;
  try {
    await apiService.generateReportPDF('financial_summary', dateFrom.value, dateTo.value, authStore.user.uid);
  } catch (error) {
    console.error('Error downloading financial PDF:', error);
    alert('Error generating PDF report. Please try again.');
  } finally {
    loading.value = false;
  }
};

const downloadUnpaidPatientsPDF = async () => {
  loading.value = true;
  try {
    await apiService.generateReportPDF('unpaid_patients', dateFrom.value, dateTo.value, authStore.user.uid);
  } catch (error) {
    console.error('Error downloading unpaid patients PDF:', error);
    alert('Error generating PDF report. Please try again.');
  } finally {
    loading.value = false;
  }
};

const downloadTopItemsPDF = async () => {
  loading.value = true;
  try {
    await apiService.generateReportPDF('top_selling_items', dateFrom.value, dateTo.value, authStore.user.uid);
  } catch (error) {
    console.error('Error downloading top items PDF:', error);
    alert('Error generating PDF report. Please try again.');
  } finally {
    loading.value = false;
  }
};

const viewPatientBilling = (patientId) => router.push(`/patient/${patientId}/billing`);
const exportUnpaidPatients = () => console.log('Export unpaid patients to CSV');
const exportTopItems = () => console.log('Export top items to CSV');
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
const formatDate = (date) => date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

onMounted(() => {
  initializeDateRange();
  generateReports();
});
</script>

<style scoped>
/* All styles are handled by Tailwind CSS utility classes */
</style>