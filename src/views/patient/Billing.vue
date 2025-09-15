<template>
  <div class="bg-background-dark min-h-screen text-text-light font-sans p-4 md:p-8">
    <!-- Header -->
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-text-light">Patient Billing</h1>
        <p class="text-text-muted">Creating and managing patient invoices.</p>
      </div>
      <button @click="viewProfile" class="flex items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
        <MdiIcon :path="mdiAccount" size="20" class="mr-2 text-primary" />
        Back to Profile
      </button>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <MdiIcon :path="mdiLoading" class="animate-spin text-4xl text-primary" />
    </div>

    <!-- Main Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Patient Info & Bill Summary -->
      <div class="lg:col-span-1 space-y-8">
        <!-- Patient Info -->
        <div class="bg-surface-dark rounded-lg p-6 shadow-lg">
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-semibold text-text-light">Patient Information</h2>
            <span class="px-3 py-1 bg-primary/20 text-primary text-sm font-bold rounded-full">{{ patient?.hospitalNumber }}</span>
          </div>
          <div class="mt-6 space-y-4">
            <div>
              <label class="text-sm font-medium text-text-muted">Name</label>
              <p class="mt-1 text-text-light">{{ patient?.name }} {{ patient?.surname }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-text-muted">Phone</label>
              <p class="mt-1 text-text-light">{{ patient?.phone }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-text-muted">Age</label>
              <p class="mt-1 text-text-light">{{ patient?.age }} years</p>
            </div>
          </div>
        </div>

        <!-- Bill Summary -->
        <div class="bg-surface-dark rounded-lg p-6 shadow-lg">
          <h2 class="text-xl font-semibold text-text-light mb-4">Bill Summary</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center text-lg">
              <span class="text-text-muted">Total Bill:</span>
              <span class="font-bold text-text-light">M{{ formatCurrency(totalBill) }}</span>
            </div>
            <div class="flex justify-between items-center text-lg">
              <span class="text-text-muted">Amount Paid:</span>
              <span class="font-bold text-green-400">M{{ formatCurrency(amountPaid) }}</span>
            </div>
            <div class="flex justify-between items-center text-xl font-bold border-t border-gray-700 pt-4 mt-4">
              <span class="text-primary">Balance:</span>
              <span class="text-primary">M{{ formatCurrency(balance) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Billing Actions -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Add Item -->
        <div class="bg-surface-dark rounded-lg p-6 shadow-lg">
          <h2 class="text-xl font-semibold text-text-light mb-4">Add Items to Bill</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div class="md:col-span-2 lg:col-span-2">
              <label class="text-sm font-medium text-text-muted">Item</label>
              <select v-model="newItem.id" @change="updateItemPrice" class="mt-1 w-full bg-background-dark border-gray-600 rounded-md shadow-sm text-text-light focus:ring-primary focus:border-primary">
                <option value="">Select Item</option>
                <option v-for="item in priceList" :key="item.id" :value="item.id">{{ item.name }}</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-text-muted">Qty</label>
              <input v-model.number="newItem.quantity" type="number" min="1" @input="calculateItemTotal" class="mt-1 w-full bg-background-dark border-gray-600 rounded-md shadow-sm text-text-light focus:ring-primary focus:border-primary">
            </div>
            <div>
              <label class="text-sm font-medium text-text-muted">Unit Price</label>
              <input v-model.number="newItem.unitPrice" type="number" step="0.01" @input="calculateItemTotal" class="mt-1 w-full bg-background-dark border-gray-600 rounded-md shadow-sm text-text-light focus:ring-primary focus:border-primary">
            </div>
            <button @click="addItemToBill" :disabled="!canAddItem" class="h-10 px-4 bg-primary hover:bg-primary-hover text-background-dark font-semibold rounded-lg transition-colors disabled:opacity-50">Add</button>
          </div>
        </div>

        <!-- Bill Items -->
        <div class="bg-surface-dark rounded-lg p-6 shadow-lg">
          <h2 class="text-xl font-semibold text-text-light mb-4">Current Bill Items</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-text-muted">
              <thead class="text-xs text-text-light uppercase bg-surface-dark/50">
                <tr>
                  <th scope="col" class="px-4 py-3">Item</th>
                  <th scope="col" class="px-4 py-3 text-center">Qty</th>
                  <th scope="col" class="px-4 py-3 text-right">Unit Price</th>
                  <th scope="col" class="px-4 py-3 text-right">Total</th>
                  <th scope="col" class="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="billItems.length === 0">
                  <td colspan="5" class="text-center py-8 text-text-muted">No items added to bill yet.</td>
                </tr>
                <tr v-for="(item, index) in billItems" :key="index" class="border-b border-gray-700 hover:bg-surface-dark/40">
                  <td class="px-4 py-3 font-medium text-text-light">{{ item.description }}</td>
                  <td class="px-4 py-3 text-center">{{ item.quantity }}</td>
                  <td class="px-4 py-3 text-right">M{{ formatCurrency(item.unitPrice) }}</td>
                  <td class="px-4 py-3 text-right font-semibold text-primary">M{{ formatCurrency(item.totalPrice) }}</td>
                  <td class="px-4 py-3 text-center">
                    <button @click="removeItem(index)" class="text-red-400 hover:text-red-500">
                      <MdiIcon :path="mdiDelete" size="20" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Payment -->
        <div class="bg-surface-dark rounded-lg p-6 shadow-lg">
          <h2 class="text-xl font-semibold text-text-light mb-4">Payment Processing</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-sm font-medium text-text-muted">Payment Method</label>
              <div class="mt-2 flex space-x-2">
                <button @click="setPaymentMethod('cash')" :class="paymentMethod === 'cash' ? 'bg-primary text-background-dark' : 'bg-primary/10 text-primary'" class="px-4 py-2 rounded-lg transition-colors">Cash</button>
                <button @click="setPaymentMethod('eft')" :class="paymentMethod === 'eft' ? 'bg-primary text-background-dark' : 'bg-primary/10 text-primary'" class="px-4 py-2 rounded-lg transition-colors">EFT</button>
                <button @click="setPaymentMethod('invoice')" :class="paymentMethod === 'invoice' ? 'bg-primary text-background-dark' : 'bg-primary/10 text-primary'" class="px-4 py-2 rounded-lg transition-colors">Invoice</button>
              </div>
            </div>
            <div v-if="paymentMethod === 'cash' || paymentMethod === 'eft'">
              <label class="text-sm font-medium text-text-muted">Amount</label>
              <input v-if="paymentMethod === 'cash'" v-model.number="cashAmount" type="number" step="0.01" class="mt-1 w-full bg-background-dark border-gray-600 rounded-md shadow-sm text-text-light focus:ring-primary focus:border-primary" placeholder="Cash Amount">
              <input v-if="paymentMethod === 'eft'" v-model.number="eftAmount" type="number" step="0.01" class="mt-1 w-full bg-background-dark border-gray-600 rounded-md shadow-sm text-text-light focus:ring-primary focus:border-primary" placeholder="EFT Amount">
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <button @click="processBillAndPrint" :disabled="billItems.length === 0" class="px-6 py-3 bg-primary hover:bg-primary-hover text-background-dark font-bold rounded-lg transition-colors disabled:opacity-50">
              Process Bill & Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import { useConfigStore } from '@/stores/configStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import { mdiChevronRight, mdiAccount, mdiLoading, mdiDelete } from '@mdi/js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()
const configStore = useConfigStore()

const loading = ref(true)
const patient = ref(null)
const billItems = ref([])
const paymentMethod = ref('')
const cashAmount = ref(0)
const eftAmount = ref(0)

const newItem = ref({
  id: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0
})

const patientId = computed(() => route.params.id)
const priceList = computed(() => configStore.priceList)

const totalBill = computed(() => {
  return billItems.value.reduce((sum, item) => sum + item.totalPrice, 0)
})

const amountPaid = computed(() => {
  let paid = 0
  if (paymentMethod.value === 'cash') paid += cashAmount.value || 0
  if (paymentMethod.value === 'eft') paid += eftAmount.value || 0
  return paid
})

const balance = computed(() => {
  return totalBill.value - amountPaid.value
})

const canAddItem = computed(() => {
  return newItem.value.id &&
         newItem.value.quantity > 0 &&
         newItem.value.unitPrice > 0
})

// Load data
const loadData = async () => {
  try {
    loading.value = true

    // Load patient data
    const patientData = await patientStore.getPatient(patientId.value)
    patient.value = patientData

    // Load price list
    await configStore.loadPriceList()

  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

// Update item price when item is selected
const updateItemPrice = () => {
  const selectedItem = priceList.value.find(item => item.id === newItem.value.id)
  if (selectedItem) {
    newItem.value.description = selectedItem.name
    newItem.value.unitPrice = selectedItem.price
    calculateItemTotal()
  }
}

// Calculate item total
const calculateItemTotal = () => {
  newItem.value.totalPrice = newItem.value.quantity * newItem.value.unitPrice
}

// Add item to bill
const addItemToBill = () => {
  if (!canAddItem.value) return

  billItems.value.push({
    id: newItem.value.id,
    description: newItem.value.description,
    quantity: newItem.value.quantity,
    unitPrice: newItem.value.unitPrice,
    totalPrice: newItem.value.totalPrice
  })

  // Reset form
  newItem.value = {
    id: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0
  }
}

// Remove item from bill
const removeItem = (index) => {
  billItems.value.splice(index, 1)
}

// Set payment method
const setPaymentMethod = (method) => {
  paymentMethod.value = method
  if (method !== 'cash') cashAmount.value = 0
  if (method !== 'eft') eftAmount.value = 0
}

// Process bill and print receipt
const processBillAndPrint = async () => {
  try {
    // Process billing through API
    const result = await patientStore.processBilling(
      patientId.value,
      billItems.value,
      paymentMethod.value,
      amountPaid.value
    )

    // Print receipt (implement print functionality)
    window.print()

    // Reset form
    billItems.value = []
    paymentMethod.value = ''
    cashAmount.value = 0
    eftAmount.value = 0

    alert(`Bill processed successfully! Invoice ID: ${result.invoiceId}`)

  } catch (error) {
    console.error('Error processing bill:', error)
    alert('Error processing bill. Please try again.')
  }
}

// Action handlers
const viewProfile = () => {
  router.push(`/patient/${patientId.value}`)
}

// Permission check
const hasPermission = (permission) => {
  return authStore.hasPermission(permission)
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

onMounted(() => {
  loadData()
})
</script>