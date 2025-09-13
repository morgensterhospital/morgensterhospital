<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-background-dark rounded-lg shadow-xl w-full max-w-7xl max-h-full flex flex-col">
      <BillingHistoryModal v-if="isBillingHistoryOpen" :patientId="patient.id" @close="isBillingHistoryOpen = false" />
      <div v-if="showReceipt" class="hidden">
        <Receipt :patient="patient" :items="billItems" :totalBill="totalBill" :amountPaid="amountPaid" :balance="balance" ref="receipt" />
      </div>
      <header class="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 class="text-xl font-bold text-text-light">Billing and Invoices</h2>
        <button @click="$emit('close')" class="text-text-muted hover:text-white">
          <MdiIcon :path="mdiClose" size="24" />
        </button>
      </header>
      <div class="p-6 overflow-y-auto flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Patient Details -->
        <div class="lg:col-span-1">
          <div class="p-6 bg-surface-dark rounded-lg">
            <h3 class="text-lg font-semibold text-primary mb-4">Patient Details</h3>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-text-muted">Hospital Number</p>
                <p class="text-text-light">{{ patient.hospitalNumber }}</p>
              </div>
              <div>
                <p class="text-sm text-text-muted">Full Name</p>
                <p class="text-text-light">{{ patient.name }} {{ patient.surname }}</p>
              </div>
              <div>
                <p class="text-sm text-text-muted">Age</p>
                <p class="text-text-light">{{ patient.age }}</p>
              </div>
              <div>
                <p class="text-sm text-text-muted">Gender</p>
                <p class="text-text-light">{{ patient.gender }}</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Right Column: Billing -->
        <div class="lg:col-span-2">
          <h3 class="text-lg font-semibold text-primary mb-4">Billing</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="relative">
                <input type="text" v-model="searchTerm" @input="handleSearch" placeholder="Enter Item" class="w-full p-3 bg-background-dark border border-gray-600 rounded-lg">
                <ul v-if="suggestions.length" class="absolute z-10 w-full bg-surface-dark border border-gray-600 rounded-lg mt-1">
                  <li v-for="item in suggestions" :key="item.id" @click="selectItem(item)" class="p-3 hover:bg-primary/20 cursor-pointer">
                    {{ item.name }}
                  </li>
                </ul>
              </div>
              <input type="number" v-model="quantity" placeholder="Quantity" class="w-full p-3 bg-background-dark border border-gray-600 rounded-lg">
            </div>
            <div class="flex items-center space-x-4">
              <label class="text-text-muted">Payment Method:</label>
              <M3Button :variant="paymentMethod === 'Cash' ? 'filled' : 'outlined'" @click="paymentMethod = 'Cash'">Cash</M3Button>
              <M3Button :variant="paymentMethod === 'EFT' ? 'filled' : 'outlined'" @click="paymentMethod = 'EFT'">EFT</M3Button>
              <M3Button :variant="paymentMethod === 'Invoice' ? 'filled' : 'outlined'" @click="paymentMethod = 'Invoice'">Invoice</M3Button>
            </div>
            <M3Button @click="addToBill" class="w-full">Add to Bill</M3Button>
          </div>
          <!-- Items Table -->
          <div class="mt-8 bg-surface-dark rounded-lg p-4">
            <table class="billing-table">
              <thead>
                <tr>
                  <th>Item No.</th>
                  <th>Description</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in billItems" :key="index">
                  <td>{{ item.id }}</td>
                  <td>{{ item.name }}</td>
                  <td class="text-center">{{ item.quantity }}</td>
                  <td class="text-right">{{ item.price.toFixed(2) }}</td>
                  <!-- FIX: Your items already have a total, use that. Renamed to totalPrice for clarity -->
                  <td class="text-right">{{ item.totalPrice.toFixed(2) }}</td>
                  <td class="text-center">
                    <button @click="removeFromBill(index)" class="text-red-500 hover:text-red-400">
                      <MdiIcon :path="mdiDelete" />
                    </button>
                  </td>
                </tr>
                <tr v-if="billItems.length === 0">
                  <td colspan="6" class="p-8 text-center text-text-muted">No items added to the bill yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Summary -->
          <div class="mt-8 flex justify-end">
            <div class="w-full max-w-sm space-y-4">
              <div class="flex justify-between">
                <span class="font-semibold">Total Bill:</span>
                <span>{{ totalBill.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-semibold">Amount Paid:</span>
                <input type="number" v-model="amountPaid" class="w-32 p-2 bg-background-dark border border-gray-600 rounded-lg">
              </div>
              <div class="flex justify-between">
                <span class="font-semibold">Balance:</span>
                <span>{{ balance.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer class="p-4 border-t border-gray-700 flex justify-between">
        <div>
          <M3Button variant="outlined" @click="$emit('close')">Go Back</M3Button>
          <M3Button variant="outlined" class="ml-4" @click="isBillingHistoryOpen = true">Billing History</M3Button>
          <M3Button variant="outlined" class="ml-4">Reports</M3Button>
        </div>
        <M3Button variant="filled" @click="processBill" :disabled="billingStore.loading">
          {{ billingStore.loading ? 'Processing...' : 'Process Bill' }}
        </M3Button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useBillingStore } from '@/stores/billingStore';
// You will likely need an auth store to get the current user's ID
// import { useAuthStore } from '@/stores/authStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import M3Button from '@/components/common/M3Button.vue';
import Receipt from '@/components/common/Receipt.vue';
import BillingHistoryModal from '@/components/common/BillingHistoryModal.vue';
import { mdiClose, mdiDelete } from '@mdi/js';

const props = defineProps({
  patient: {
    type: Object,
    required: true,
  },
});

const billingStore = useBillingStore();
// const authStore = useAuthStore(); // Example of using an auth store

const searchTerm = ref('');
const suggestions = ref([]);
const quantity = ref(1);
const paymentMethod = ref('Cash');
const billItems = ref([]);
const amountPaid = ref(0);

const totalBill = computed(() => billItems.value.reduce((sum, item) => sum + item.totalPrice, 0));
const balance = computed(() => totalBill.value - amountPaid.value);

const handleSearch = async () => {
  if (searchTerm.value.length < 2) {
    suggestions.value = [];
    return;
  }
  suggestions.value = await billingStore.searchItems(searchTerm.value);
};

const selectedItem = ref(null);

const selectItem = (item) => {
  selectedItem.value = item;
  searchTerm.value = item.name;
  suggestions.value = [];
};

const addToBill = () => {
  if (!selectedItem.value || quantity.value <= 0) {
    return;
  }
  const item = {
    id: selectedItem.value.id,
    name: selectedItem.value.name,
    quantity: Number(quantity.value),
    price: Number(selectedItem.value.price),
    // Changed 'total' to 'totalPrice' to match backend expectation
    totalPrice: Number(quantity.value) * Number(selectedItem.value.price),
  };
  billItems.value.push(item);
  searchTerm.value = '';
  quantity.value = 1;
  selectedItem.value = null;
};

const removeFromBill = (index) => {
  billItems.value.splice(index, 1);
};

const showReceipt = ref(false);
const receipt = ref(null);
const isBillingHistoryOpen = ref(false);

const processBill = async () => {
  if (billItems.value.length === 0) {
    alert("Cannot process an empty bill.");
    return;
  }

  // --- IMPORTANT: Get the real user ID ---
  // Replace this with your actual authentication logic
  // const currentUserId = authStore.currentUser.uid;
  const currentUserId = 'REPLACE_WITH_ACTUAL_LOGGED_IN_USER_ID';

  try {
    const result = await billingStore.processBill({
      // FIX: Changed props.patientId to props.patient.id
      patientId: props.patient.id, 
      items: billItems.value,
      paymentMethod: paymentMethod.value,
      amountPaid: Number(amountPaid.value),
      processedBy: currentUserId 
    });

    console.log('Bill processed successfully:', result);

    // This logic seems to be for printing, which won't work in a headless environment
    // like a serverless function. Printing should be handled entirely on the client.
    // I am keeping your original logic here.
    showReceipt.value = true;
    await nextTick();

    if (confirm('Do you want to print a receipt?')) {
      // You might need a dedicated print function for the receipt component
      // This is a placeholder for how you might trigger it.
       window.print(); 
    }

    showReceipt.value = false;
    // Reset state after successful processing
    billItems.value = [];
    amountPaid.value = 0;
    alert('Bill processed successfully!');
    // emit('close'); // Optionally close the modal after success

  } catch (error) {
    console.error('Failed to process bill:', error);
    alert(`Failed to process bill: ${error.message}`);
  }
};
</script>

<style scoped>
.billing-table {
  @apply w-full text-left;
}
.billing-table th {
  @apply p-3 text-sm font-semibold text-text-muted border-b-2 border-gray-700;
}
.billing-table td {
  @apply p-3 border-b border-gray-800;
}
.billing-table tbody tr:last-child td {
  @apply border-b-0;
}
</style>
