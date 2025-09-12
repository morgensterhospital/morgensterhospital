<template>
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <!-- Left Column: Patient Info -->
    <div class="xl:col-span-1 space-y-6">
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <div v-if="loading" class="text-center text-text-muted">Loading patient...</div>
        <div v-else-if="patient">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Patient Information</h2>
            <span class="px-3 py-1 bg-primary text-background-dark rounded-full text-xs font-bold">{{ patient.hospitalNumber }}</span>
          </div>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between"><span class="text-text-muted">Name:</span> <span class="font-semibold">{{ patient.name }} {{ patient.surname }}</span></div>
            <div class="flex justify-between"><span class="text-text-muted">ID Number:</span> <span class="font-semibold">{{ patient.idNumber }}</span></div>
            <div class="flex justify-between"><span class="text-text-muted">Phone:</span> <span class="font-semibold">{{ patient.phone }}</span></div>
            <div class="flex justify-between"><span class="text-text-muted">Age:</span> <span class="font-semibold">{{ patient.age }} years</span></div>
            <div class="flex justify-between"><span class="text-text-muted">Gender:</span> <span class="font-semibold">{{ patient.gender }}</span></div>
          </div>
        </div>
      </div>
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Actions</h2>
        <div class="space-y-3">
          <button @click="viewBillingHistory" class="w-full p-3 bg-background-dark rounded-lg text-left hover:bg-primary/20">View Billing History</button>
          <button @click="viewPatientHistory" class="w-full p-3 bg-background-dark rounded-lg text-left hover:bg-primary/20">View Patient History</button>
          <button @click="viewProfile" class="w-full p-3 bg-background-dark rounded-lg text-left hover:bg-primary/20">Back to Patient Profile</button>
          <button v-if="hasPermission('admission_discharge:approve')" @click="dischargePatient" class="w-full p-3 bg-green-500/20 text-green-400 rounded-lg text-left hover:bg-green-500/30">Discharge Patient</button>
        </div>
      </div>
    </div>

    <!-- Right Column: Billing -->
    <div class="xl:col-span-2 space-y-6">
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Add Items to Bill</h2>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <select v-model="newItem.id" @change="updateItemPrice" class="md:col-span-2 w-full bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary">
            <option value="">Select Item</option>
            <option v-for="item in priceList" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
          <input v-model.number="newItem.quantity" type="number" min="1" placeholder="Qty" @input="calculateItemTotal" class="w-full bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary" />
          <input v-model.number="newItem.unitPrice" type="number" step="0.01" placeholder="Unit Price" @input="calculateItemTotal" class="w-full bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary" />
          <button @click="addItemToBill" :disabled="!canAddItem" class="w-full p-2 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center hover:bg-primary-hover disabled:opacity-50">Add</button>
        </div>
      </div>

      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Current Bill</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b border-gray-700">
              <tr>
                <th class="p-2 text-left font-semibold text-text-muted">Item</th>
                <th class="p-2 text-left font-semibold text-text-muted">Qty</th>
                <th class="p-2 text-left font-semibold text-text-muted">Unit Price</th>
                <th class="p-2 text-left font-semibold text-text-muted">Total</th>
                <th class="p-2 text-left font-semibold text-text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in billItems" :key="index" class="border-b border-gray-800">
                <td class="p-2">{{ item.description }}</td>
                <td class="p-2">{{ item.quantity }}</td>
                <td class="p-2">M{{ formatCurrency(item.unitPrice) }}</td>
                <td class="p-2 font-semibold">M{{ formatCurrency(item.totalPrice) }}</td>
                <td class="p-2"><button @click="removeItem(index)" class="text-red-500 hover:text-red-400"><MdiIcon :path="mdiTrashCanOutline" size="18" /></button></td>
              </tr>
              <tr v-if="billItems.length === 0">
                <td colspan="5" class="p-6 text-center text-text-muted">No items added to the bill yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-bold mb-4">Payment</h2>
          <div class="space-y-4">
            <div class="flex gap-4">
              <button @click="setPaymentMethod('cash')" :class="['flex-1 py-2 px-4 rounded-lg', paymentMethod === 'cash' ? 'bg-primary text-background-dark' : 'bg-background-dark hover:bg-primary/20']">Cash</button>
              <button @click="setPaymentMethod('eft')" :class="['flex-1 py-2 px-4 rounded-lg', paymentMethod === 'eft' ? 'bg-primary text-background-dark' : 'bg-background-dark hover:bg-primary/20']">EFT</button>
              <button @click="setPaymentMethod('invoice')" :class="['flex-1 py-2 px-4 rounded-lg', paymentMethod === 'invoice' ? 'bg-primary text-background-dark' : 'bg-background-dark hover:bg-primary/20']">Invoice</button>
            </div>
            <input v-if="paymentMethod === 'cash'" v-model.number="cashAmount" type="number" step="0.01" placeholder="Cash Amount" class="w-full bg-background-dark border-gray-700 rounded-md py-2 px-4" />
            <input v-if="paymentMethod === 'eft'" v-model.number="eftAmount" type="number" step="0.01" placeholder="EFT Amount" class="w-full bg-background-dark border-gray-700 rounded-md py-2 px-4" />
          </div>
        </div>
        <div class="bg-surface-dark p-6 rounded-lg shadow-lg space-y-3">
          <div class="flex justify-between text-lg"><span>Total Bill:</span> <span class="font-bold">M{{ formatCurrency(totalBill) }}</span></div>
          <div class="flex justify-between text-lg"><span>Amount Paid:</span> <span class="font-bold">M{{ formatCurrency(amountPaid) }}</span></div>
          <div class="flex justify-between text-2xl font-bold pt-3 border-t border-gray-700"><span>Balance:</span> <span>M{{ formatCurrency(balance) }}</span></div>
        </div>
      </div>

      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <button @click="processBillAndPrint" :disabled="billItems.length === 0" class="w-full py-3 bg-primary text-background-dark font-bold rounded-lg hover:bg-primary-hover disabled:opacity-50">Process Bill & Print Receipt</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import { useConfigStore } from '@/stores/configStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import { mdiChevronRight, mdiTrashCanOutline } from '@mdi/js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const patientStore = usePatientStore();
const configStore = useConfigStore();

const loading = ref(true);
const patient = ref(null);
const billItems = ref([]);
const paymentMethod = ref('');
const cashAmount = ref(0);
const eftAmount = ref(0);

const newItem = ref({
  id: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0,
});

const patientId = computed(() => route.params.id);
const priceList = computed(() => configStore.priceList);

const totalBill = computed(() => billItems.value.reduce((sum, item) => sum + item.totalPrice, 0));
const amountPaid = computed(() => {
  let paid = 0;
  if (paymentMethod.value === 'cash') paid += cashAmount.value || 0;
  if (paymentMethod.value === 'eft') paid += eftAmount.value || 0;
  return paid;
});
const balance = computed(() => totalBill.value - amountPaid.value);
const canAddItem = computed(() => newItem.value.id && newItem.value.quantity > 0 && newItem.value.unitPrice > 0);

const loadData = async () => {
  loading.value = true;
  try {
    patient.value = await patientStore.getPatient(patientId.value);
    await configStore.loadPriceList();
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
  }
};

const updateItemPrice = () => {
  const selectedItem = priceList.value.find(item => item.id === newItem.value.id);
  if (selectedItem) {
    newItem.value.description = selectedItem.name;
    newItem.value.unitPrice = selectedItem.price;
    calculateItemTotal();
  }
};

const calculateItemTotal = () => {
  newItem.value.totalPrice = (newItem.value.quantity || 0) * (newItem.value.unitPrice || 0);
};

const addItemToBill = () => {
  if (!canAddItem.value) return;
  billItems.value.push({ ...newItem.value });
  newItem.value = { id: '', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 };
};

const removeItem = (index) => {
  billItems.value.splice(index, 1);
};

const setPaymentMethod = (method) => {
  paymentMethod.value = method;
  if (method !== 'cash') cashAmount.value = 0;
  if (method !== 'eft') eftAmount.value = 0;
};

const processBillAndPrint = async () => {
  try {
    const result = await patientStore.processBilling(
      patientId.value,
      billItems.value,
      paymentMethod.value,
      amountPaid.value
    );
    window.print();
    billItems.value = [];
    paymentMethod.value = '';
    cashAmount.value = 0;
    eftAmount.value = 0;
    alert(`Bill processed successfully! Invoice ID: ${result.invoiceId}`);
  } catch (error) {
    console.error('Error processing bill:', error);
    alert('Error processing bill. Please try again.');
  }
};

const viewBillingHistory = () => console.log('View billing history');
const viewPatientHistory = () => console.log('View patient history');
const viewProfile = () => router.push(`/patient/${patientId.value}`);
const dischargePatient = () => console.log('Discharge patient');
const hasPermission = (permission) => authStore.hasPermission(permission);
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);

onMounted(loadData);
</script>

<style scoped>
/* All styles are handled by Tailwind CSS utility classes */
</style>