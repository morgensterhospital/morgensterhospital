<template>
  <div class="billing-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">Home</router-link>
          <mdi-icon :path="mdiChevronRight" size="16" />
          <router-link :to="`/patient/${patientId}`" class="breadcrumb-link">Patient Profile</router-link>
          <mdi-icon :path="mdiChevronRight" size="16" />
          <span class="breadcrumb-current">Billing</span>
        </div>
        <h1 class="page-title">PATIENT BILLING</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading billing information...</p>
    </div>

    <!-- Main Billing Content -->
    <div v-else class="billing-content">
      <!-- Patient Information Panel -->
      <div class="patient-info-panel">
        <div class="patient-card">
          <div class="patient-header">
            <h2>Patient Information</h2>
            <div class="hospital-number">{{ patient?.hospitalNumber }}</div>
          </div>
          
          <div class="patient-details">
            <div class="detail-item">
              <label>Name</label>
              <span>{{ patient?.name }} {{ patient?.surname }}</span>
            </div>
            <div class="detail-item">
              <label>ID Number</label>
              <span>{{ patient?.idNumber }}</span>
            </div>
            <div class="detail-item">
              <label>Phone</label>
              <span>{{ patient?.phone }}</span>
            </div>
            <div class="detail-item">
              <label>Age</label>
              <span>{{ patient?.age }} years</span>
            </div>
            <div class="detail-item">
              <label>Gender</label>
              <span>{{ patient?.gender }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Billing Panel -->
      <div class="billing-panel">
        <!-- Add Item Section -->
        <div class="add-item-section">
          <h2>Add Items to Bill</h2>
          
          <div class="item-form">
            <div class="form-row">
              <div class="form-group">
                <label>Item</label>
                <select v-model="newItem.id" @change="updateItemPrice" class="form-select">
                  <option value="">Select Item</option>
                  <option 
                    v-for="item in priceList" 
                    :key="item.id" 
                    :value="item.id"
                  >
                    {{ item.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Quantity</label>
                <input 
                  v-model.number="newItem.quantity" 
                  type="number" 
                  min="1" 
                  class="form-input"
                  @input="calculateItemTotal"
                />
              </div>
              
              <div class="form-group">
                <label>Unit Price (M)</label>
                <input 
                  v-model.number="newItem.unitPrice" 
                  type="number" 
                  step="0.01" 
                  class="form-input"
                  @input="calculateItemTotal"
                />
              </div>
              
              <div class="form-group">
                <label>Total Price (M)</label>
                <input 
                  v-model.number="newItem.totalPrice" 
                  type="number" 
                  step="0.01" 
                  class="form-input"
                  readonly
                />
              </div>
              
              <div class="form-group">
                <m3-button 
                  variant="filled" 
                  @click="addItemToBill"
                  :disabled="!canAddItem"
                >
                  ADD TO BILL
                </m3-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bill Items Table -->
        <div class="bill-items-section">
          <h2>Current Bill Items</h2>
          
          <div class="bill-table-container">
            <table class="bill-table">
              <thead>
                <tr>
                  <th>Item #</th>
                  <th>Item Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in billItems" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.description }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>M{{ formatCurrency(item.unitPrice) }}</td>
                  <td>M{{ formatCurrency(item.totalPrice) }}</td>
                  <td>
                    <m3-button 
                      variant="outlined" 
                      size="small" 
                      color="error"
                      @click="removeItem(index)"
                    >
                      DELETE
                    </m3-button>
                  </td>
                </tr>
                <tr v-if="billItems.length === 0">
                  <td colspan="6" class="empty-state">
                    No items added to bill yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Payment Section -->
        <div class="payment-section">
          <h2>Payment Processing</h2>
          
          <div class="payment-methods">
            <div class="payment-method">
              <m3-button 
                variant="filled" 
                :class="{ active: paymentMethod === 'cash' }"
                @click="setPaymentMethod('cash')"
              >
                CASH
              </m3-button>
              <input 
                v-if="paymentMethod === 'cash'"
                v-model.number="cashAmount" 
                type="number" 
                step="0.01" 
                placeholder="Cash Amount"
                class="payment-input"
              />
            </div>
            
            <div class="payment-method">
              <m3-button 
                variant="filled" 
                :class="{ active: paymentMethod === 'eft' }"
                @click="setPaymentMethod('eft')"
              >
                EFT
              </m3-button>
              <input 
                v-if="paymentMethod === 'eft'"
                v-model.number="eftAmount" 
                type="number" 
                step="0.01" 
                placeholder="EFT Amount"
                class="payment-input"
              />
            </div>
            
            <div class="payment-method">
              <m3-button 
                variant="outlined" 
                :class="{ active: paymentMethod === 'invoice' }"
                @click="setPaymentMethod('invoice')"
              >
                INVOICE
              </m3-button>
            </div>
          </div>
        </div>

        <!-- Bill Summary -->
        <div class="bill-summary">
          <div class="summary-row">
            <label>Total Bill:</label>
            <span class="amount">M{{ formatCurrency(totalBill) }}</span>
          </div>
          <div class="summary-row">
            <label>Amount Paid:</label>
            <span class="amount">M{{ formatCurrency(amountPaid) }}</span>
          </div>
          <div class="summary-row balance">
            <label>Balance:</label>
            <span class="amount">M{{ formatCurrency(balance) }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <m3-button variant="outlined" @click="viewBillingHistory">
            BILLING HISTORY
          </m3-button>
          <m3-button variant="outlined" @click="viewPatientHistory">
            PATIENT HISTORY
          </m3-button>
          <m3-button 
            variant="filled" 
            @click="processBillAndPrint"
            :disabled="billItems.length === 0"
          >
            PROCESS BILL AND PRINT RECEIPT
          </m3-button>
          <m3-button variant="outlined" @click="viewProfile">
            VIEW PROFILE
          </m3-button>
          <m3-button 
            v-if="hasPermission('admission_discharge:approve')"
            variant="outlined" 
            color="success"
            @click="dischargePatient"
          >
            DISCHARGE
          </m3-button>
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
import M3Button from '@/components/common/M3Button.vue'
import { mdiChevronRight } from '@mdi/js'

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
const viewBillingHistory = () => {
  console.log('View billing history')
}

const viewPatientHistory = () => {
  console.log('View patient history')
}

const viewProfile = () => {
  router.push(`/patient/${patientId.value}`)
}

const dischargePatient = () => {
  console.log('Discharge patient')
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

<style scoped>
.billing-page {
  min-height: 100vh;
  background: #F7F9FC;
}

.page-header {
  background: white;
  padding: 24px 32px;
  border-bottom: 1px solid #E5E7EB;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.breadcrumb-link {
  color: #0066B2;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-current {
  color: #6B7280;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #0066B2;
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E5E7EB;
  border-top: 4px solid #0066B2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.billing-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 32px;
  padding: 32px;
  max-width: 1600px;
  margin: 0 auto;
}

.patient-info-panel {
  position: sticky;
  top: 32px;
  height: fit-content;
}

.patient-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.patient-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.patient-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.hospital-number {
  background: #0066B2;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
}

.patient-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
}

.detail-item span {
  font-size: 14px;
  color: #1F2937;
  font-weight: 500;
}

.billing-panel {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.add-item-section,
.bill-items-section,
.payment-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.add-item-section h2,
.bill-items-section h2,
.payment-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 20px 0;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 16px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-select,
.form-input {
  padding: 12px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #0066B2;
}

.bill-table-container {
  overflow-x: auto;
}

.bill-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.bill-table th,
.bill-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
}

.bill-table th {
  background: #F9FAFB;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.bill-table td {
  font-size: 14px;
  color: #1F2937;
}

.empty-state {
  text-align: center;
  color: #6B7280;
  font-style: italic;
  padding: 32px;
}

.payment-methods {
  display: flex;
  gap: 24px;
  align-items: center;
}

.payment-method {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.payment-input {
  padding: 8px 12px;
  border: 2px solid #E5E7EB;
  border-radius: 6px;
  font-size: 14px;
  width: 120px;
  text-align: center;
}

.payment-input:focus {
  outline: none;
  border-color: #0066B2;
}

.bill-summary {
  background: #F9FAFB;
  padding: 24px;
  border-radius: 8px;
  border: 2px solid #E5E7EB;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.summary-row.balance {
  border-top: 2px solid #E5E7EB;
  margin-top: 8px;
  padding-top: 16px;
  font-weight: 600;
  font-size: 18px;
}

.summary-row label {
  font-weight: 500;
  color: #374151;
}

.summary-row .amount {
  font-weight: 600;
  color: #0066B2;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .billing-content {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .patient-info-panel {
    position: static;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .payment-methods {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .payment-method {
    flex-direction: row;
    justify-content: space-between;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>