<template>
  <div class="reports-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">Home</router-link>
          <mdi-icon :path="mdiChevronRight" size="16" />
          <span class="breadcrumb-current">Reports</span>
        </div>
        <h1 class="page-title">FINANCIAL REPORTS</h1>
      </div>
    </div>

    <!-- Reports Content -->
    <div class="reports-content">
      <!-- Date Range Selector -->
      <div class="date-range-section">
        <div class="date-range-card">
          <h2>Report Period</h2>
          <div class="date-inputs">
            <div class="date-group">
              <label>FROM</label>
              <input 
                v-model="dateFrom" 
                type="date" 
                class="date-input"
              />
            </div>
            <div class="date-group">
              <label>TO</label>
              <input 
                v-model="dateTo" 
                type="date" 
                class="date-input"
              />
            </div>
            <m3-button 
              variant="filled" 
              @click="generateReports"
              :disabled="loading"
            >
              <span v-if="loading">Generating...</span>
              <span v-else>Generate Reports</span>
            </m3-button>
          </div>
        </div>
      </div>

      <!-- Report Categories -->
      <div class="report-categories">
        <!-- Total Sales -->
        <div class="report-card total-sales">
          <div class="report-header">
            <mdi-icon :path="mdiCashMultiple" size="48" />
            <div class="report-info">
              <h3>TOTAL SALES</h3>
              <div class="report-value">M{{ formatCurrency(reportData.totalSales) }}</div>
            </div>
          </div>
          <div class="report-actions">
            <m3-button variant="outlined" size="small" @click="viewTotalSales">
              View Details
            </m3-button>
            <m3-button variant="outlined" size="small" @click="downloadFinancialPDF">
              Download PDF
            </m3-button>
          </div>
        </div>

        <!-- Total Cash Sales -->
        <div class="report-card cash-sales">
          <div class="report-header">
            <mdi-icon :path="mdiCash" size="48" />
            <div class="report-info">
              <h3>TOTAL CASH SALES</h3>
              <div class="report-value">M{{ formatCurrency(reportData.cashSales) }}</div>
            </div>
          </div>
          <div class="report-actions">
            <m3-button variant="outlined" size="small" @click="viewCashSales">
              View Details
            </m3-button>
            <m3-button variant="outlined" size="small" @click="downloadFinancialPDF">
              Download PDF
            </m3-button>
          </div>
        </div>

        <!-- Total EFT Sales -->
        <div class="report-card eft-sales">
          <div class="report-header">
            <mdi-icon :path="mdiCreditCard" size="48" />
            <div class="report-info">
              <h3>TOTAL EFT SALES</h3>
              <div class="report-value">M{{ formatCurrency(reportData.eftSales) }}</div>
            </div>
          </div>
          <div class="report-actions">
            <m3-button variant="outlined" size="small" @click="viewEftSales">
              View Details
            </m3-button>
            <m3-button variant="outlined" size="small" @click="downloadFinancialPDF">
              Download PDF
            </m3-button>
          </div>
        </div>

        <!-- Total Unpaid Sales -->
        <div class="report-card unpaid-sales">
          <div class="report-header">
            <mdi-icon :path="mdiClockAlert" size="48" />
            <div class="report-info">
              <h3>TOTAL UNPAID SALES</h3>
              <div class="report-value">M{{ formatCurrency(reportData.unpaidSales) }}</div>
            </div>
          </div>
          <div class="report-actions">
            <m3-button variant="outlined" size="small" @click="viewUnpaidSales">
              View Details
            </m3-button>
            <m3-button variant="outlined" size="small" @click="downloadFinancialPDF">
              Download PDF
            </m3-button>
          </div>
        </div>
      </div>

      <!-- Report Lists -->
      <div class="report-lists">
        <!-- List of Unpaid Patients -->
        <div class="list-card unpaid-patients">
          <div class="list-header">
            <h3>LIST OF UNPAID PATIENTS</h3>
            <div class="list-count">{{ unpaidPatients.length }} patients</div>
          </div>
          
          <div class="list-content">
            <div v-if="unpaidPatients.length === 0" class="empty-state">
              No unpaid patients found for the selected period
            </div>
            <div v-else class="patient-list">
              <div 
                v-for="patient in unpaidPatients" 
                :key="patient.id"
                class="patient-item"
                @click="viewPatientBilling(patient.id)"
              >
                <div class="patient-info">
                  <div class="patient-name">{{ patient.name }} {{ patient.surname }}</div>
                  <div class="patient-details">{{ patient.hospitalNumber }} • {{ patient.phone }}</div>
                </div>
                <div class="patient-balance">
                  <div class="balance-amount">M{{ formatCurrency(patient.balance) }}</div>
                  <div class="balance-date">{{ formatDate(patient.lastInvoiceDate) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="list-actions">
            <m3-button variant="outlined" @click="downloadUnpaidPatientsPDF">
              Download PDF
            </m3-button>
            <m3-button variant="filled" @click="exportUnpaidPatients">
              Export CSV
            </m3-button>
          </div>
        </div>

        <!-- Top 20 Selling Items -->
        <div class="list-card top-items">
          <div class="list-header">
            <h3>TOP 20 SELLING ITEMS</h3>
            <div class="list-count">{{ topSellingItems.length }} items</div>
          </div>
          
          <div class="list-content">
            <div v-if="topSellingItems.length === 0" class="empty-state">
              No sales data found for the selected period
            </div>
            <div v-else class="items-list">
              <div 
                v-for="(item, index) in topSellingItems" 
                :key="item.id"
                class="item-row"
              >
                <div class="item-rank">{{ index + 1 }}</div>
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-details">{{ item.quantitySold }} units sold</div>
                </div>
                <div class="item-revenue">
                  <div class="revenue-amount">M{{ formatCurrency(item.totalRevenue) }}</div>
                  <div class="unit-price">M{{ formatCurrency(item.unitPrice) }} each</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="list-actions">
            <m3-button variant="outlined" @click="downloadTopItemsPDF">
              Download PDF
            </m3-button>
            <m3-button variant="filled" @click="exportTopItems">
              Export CSV
            </m3-button>
          </div>
          <m3-button 
            variant="outlined" 
            @click="downloadFinancialPDF"
            :disabled="loading"
          >
            <mdi-icon :path="mdiDownload" size="16" />
            Download PDF
          </m3-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import apiService from '@/services/api'
import MdiIcon from '@/components/common/MdiIcon.vue'
import M3Button from '@/components/common/M3Button.vue'
import {
  mdiChevronRight,
  mdiCashMultiple,
  mdiCash,
  mdiCreditCard,
  mdiClockAlert,
  mdiDownload
} from '@mdi/js'
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore'
import { db } from '@/services/firebase'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const dateFrom = ref('')
const dateTo = ref('')

const reportData = ref({
  totalSales: 0,
  cashSales: 0,
  eftSales: 0,
  unpaidSales: 0
})

const unpaidPatients = ref([])
const topSellingItems = ref([])

// Initialize date range (last 30 days)
const initializeDateRange = () => {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  dateTo.value = today.toISOString().split('T')[0]
  dateFrom.value = thirtyDaysAgo.toISOString().split('T')[0]
}

// Generate reports
const generateReports = async () => {
  try {
    loading.value = true
    
    const fromDate = new Date(dateFrom.value)
    const toDate = new Date(dateTo.value)
    toDate.setHours(23, 59, 59, 999) // End of day
    
    // Query all invoices in date range
    const invoicesQuery = collectionGroup(db, 'invoices')
    const invoicesSnapshot = await getDocs(invoicesQuery)
    
    let totalSales = 0
    let cashSales = 0
    let eftSales = 0
    let unpaidSales = 0
    const unpaidList = []
    const itemsSold = {}
    
    for (const doc of invoicesSnapshot.docs) {
      const invoice = doc.data()
      const invoiceDate = invoice.creationDate?.toDate()
      
      if (invoiceDate && invoiceDate >= fromDate && invoiceDate <= toDate) {
        totalSales += invoice.totalAmount || 0
        
        if (invoice.status === 'paid') {
          if (invoice.paymentMethod === 'cash') {
            cashSales += invoice.amountPaid || 0
          } else if (invoice.paymentMethod === 'eft') {
            eftSales += invoice.amountPaid || 0
          }
        } else {
          unpaidSales += invoice.balance || 0
          
          // Get patient info for unpaid list
          const patientId = doc.ref.parent.parent.id
          try {
            const patientDoc = await getDocs(query(collection(db, 'patients'), where('__name__', '==', patientId)))
            if (!patientDoc.empty) {
              const patient = patientDoc.docs[0].data()
              unpaidList.push({
                id: patientId,
                name: patient.name,
                surname: patient.surname,
                hospitalNumber: patient.hospitalNumber,
                phone: patient.phone,
                balance: invoice.balance || 0,
                lastInvoiceDate: invoiceDate
              })
            }
          } catch (error) {
            console.error('Error fetching patient:', error)
          }
        }
        
        // Get invoice items for top selling items
        try {
          const itemsQuery = collection(db, doc.ref.path + '/items')
          const itemsSnapshot = await getDocs(itemsQuery)
          
          itemsSnapshot.forEach(itemDoc => {
            const item = itemDoc.data()
            const itemId = item.id || item.description
            
            if (!itemsSold[itemId]) {
              itemsSold[itemId] = {
                id: itemId,
                name: item.description,
                quantitySold: 0,
                totalRevenue: 0,
                unitPrice: item.unitPrice || 0
              }
            }
            
            itemsSold[itemId].quantitySold += item.quantity || 0
            itemsSold[itemId].totalRevenue += item.totalPrice || 0
          })
        } catch (error) {
          console.error('Error fetching invoice items:', error)
        }
      }
    }
    
    // Update report data
    reportData.value = {
      totalSales,
      cashSales,
      eftSales,
      unpaidSales
    }
    
    // Sort and limit unpaid patients
    unpaidPatients.value = unpaidList
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 50) // Limit to top 50
    
    // Sort and limit top selling items
    topSellingItems.value = Object.values(itemsSold)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 20)
    
  } catch (error) {
    console.error('Error generating reports:', error)
    alert('Error generating reports. Please try again.')
  } finally {
    loading.value = false
  }
}

// View handlers
const viewTotalSales = () => {
  console.log('View total sales details')
}

const viewCashSales = () => {
  console.log('View cash sales details')
}

const viewEftSales = () => {
  console.log('View EFT sales details')
}

const viewUnpaidSales = () => {
  console.log('View unpaid sales details')
}

// PDF Download handlers
const downloadFinancialPDF = async () => {
  try {
    loading.value = true
    await apiService.generateReportPDF('financial_summary', dateFrom.value, dateTo.value, authStore.user.uid)
  } catch (error) {
    console.error('Error downloading financial PDF:', error)
    alert('Error generating PDF report. Please try again.')
  } finally {
    loading.value = false
  }
}

const downloadUnpaidPatientsPDF = async () => {
  try {
    loading.value = true
    await apiService.generateReportPDF('unpaid_patients', dateFrom.value, dateTo.value, authStore.user.uid)
  } catch (error) {
    console.error('Error downloading unpaid patients PDF:', error)
    alert('Error generating PDF report. Please try again.')
  } finally {
    loading.value = false
  }
}

const downloadTopItemsPDF = async () => {
  try {
    loading.value = true
    await apiService.generateReportPDF('top_selling_items', dateFrom.value, dateTo.value, authStore.user.uid)
  } catch (error) {
    console.error('Error downloading top items PDF:', error)
    alert('Error generating PDF report. Please try again.')
  } finally {
    loading.value = false
  }
}

const viewPatientBilling = (patientId) => {
  router.push(`/patient/${patientId}/billing`)
}

// Export handlers
const exportUnpaidPatients = () => {
  console.log('Export unpaid patients to CSV')
  // Implement CSV export
}

const exportTopItems = () => {
  console.log('Export top items to CSV')
  // Implement CSV export
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

// Format date
const formatDate = (date) => {
  if (!date) return ''
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(() => {
  initializeDateRange()
  generateReports()
})
</script>

<style scoped>
.reports-page {
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

.reports-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.date-range-section {
  display: flex;
  justify-content: center;
}

.date-range-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 500px;
}

.date-range-card h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 20px 0;
  text-align: center;
}

.date-inputs {
  display: flex;
  gap: 20px;
  align-items: end;
  justify-content: center;
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
}

.date-input {
  padding: 12px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.date-input:focus {
  outline: none;
  border-color: #0066B2;
}

.report-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.report-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.report-info h3 {
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.report-value {
  font-size: 28px;
  font-weight: 800;
  color: #1F2937;
}

.report-actions {
  display: flex;
  gap: 8px;
}

/* Report card specific colors */
.report-card.total-sales .report-header {
  color: #0066B2;
}

.report-card.cash-sales .report-header {
  color: #059669;
}

.report-card.eft-sales .report-header {
  color: #7C3AED;
}

.report-card.unpaid-sales .report-header {
  color: #DC2626;
}

.report-lists {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.list-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.list-count {
  background: #F3F4F6;
  color: #6B7280;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.list-content {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  padding: 40px 24px;
  text-align: center;
  color: #6B7280;
  font-style: italic;
}

.patient-list,
.items-list {
  padding: 16px 0;
}

.patient-item,
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.patient-item:hover,
.item-row:hover {
  background: #F9FAFB;
}

.patient-item:last-child,
.item-row:last-child {
  border-bottom: none;
}

.patient-info,
.item-info {
  flex: 1;
}

.patient-name,
.item-name {
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.patient-details,
.item-details {
  font-size: 12px;
  color: #6B7280;
}

.patient-balance,
.item-revenue {
  text-align: right;
}

.balance-amount,
.revenue-amount {
  font-weight: 600;
  color: #DC2626;
  margin-bottom: 4px;
}

.balance-date,
.unit-price {
  font-size: 12px;
  color: #6B7280;
}

.item-rank {
  width: 32px;
  height: 32px;
  background: #0066B2;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  margin-right: 16px;
}

.list-actions {
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .reports-content {
    padding: 16px;
  }

  .date-range-card {
    min-width: auto;
    width: 100%;
  }

  .date-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .report-categories {
    grid-template-columns: 1fr;
  }

  .report-lists {
    grid-template-columns: 1fr;
  }

  .patient-item,
  .item-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .patient-balance,
  .item-revenue {
    text-align: left;
    width: 100%;
  }
}
</style>