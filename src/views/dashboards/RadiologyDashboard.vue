<template>
  <div class="dashboard">
    <!-- Page Header -->
    <div class="dashboard-header">
      <div class="header-info">
        <h1 class="page-title">MORGENSTER HOSPITAL MANAGEMENT SYSTEM</h1>
        <div class="user-info">
          LOGGED IN AS: {{ authStore.user?.displayName || 'USER' }}: XRAY OPERATOR
        </div>
      </div>
      
      <div class="header-actions">
        <m3-button variant="outlined" @click="navigateTo('/stationery')">
          STATIONERY
        </m3-button>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Patient Search -->
      <div class="search-section">
        <m3-text-field
          v-model="searchQuery"
          placeholder="SEARCH PATIENT NAME AND SURNAME"
          :icon-leading="mdiMagnify"
          variant="outlined"
          @input="handleSearch"
        />
        
        <div v-if="searchResults.length > 0" class="search-results">
          <div
            v-for="patient in searchResults"
            :key="patient.id"
            class="search-result-item"
            @click="selectPatient(patient)"
          >
            <div class="patient-name">
              {{ patient.name }} {{ patient.surname }}
            </div>
            <div class="patient-details">
              {{ patient.hospitalNumber }} • {{ patient.age }} years
            </div>
          </div>
        </div>
      </div>

      <!-- X-ray Status Containers -->
      <div class="xray-status-grid">
        <!-- Incoming X-rays -->
        <div class="status-container incoming">
          <div class="status-header">
            <mdi-icon :path="mdiClockOutline" size="24" />
            <h3>INCOMING XRAYS</h3>
            <span class="count">{{ incomingXrays.length }}</span>
          </div>
          <div class="xray-list">
            <div
              v-for="xray in incomingXrays"
              :key="xray.id"
              class="xray-item"
              @click="viewXray(xray)"
            >
              <div class="xray-patient">{{ xray.patientName }}</div>
              <div class="xray-name">{{ xray.xrayType }}</div>
              <div class="xray-time">{{ formatTime(xray.timestamp) }}</div>
            </div>
          </div>
        </div>

        <!-- Pending X-rays -->
        <div class="status-container pending">
          <div class="status-header">
            <mdi-icon :path="mdiClockAlert" size="24" />
            <h3>PENDING XRAYS</h3>
            <span class="count">{{ pendingXrays.length }}</span>
          </div>
          <div class="xray-list">
            <div
              v-for="xray in pendingXrays"
              :key="xray.id"
              class="xray-item"
              @click="viewXray(xray)"
            >
              <div class="xray-patient">{{ xray.patientName }}</div>
              <div class="xray-name">{{ xray.xrayType }}</div>
              <div class="xray-time">{{ formatTime(xray.timestamp) }}</div>
            </div>
          </div>
        </div>

        <!-- Done X-rays -->
        <div class="status-container done">
          <div class="status-header">
            <mdi-icon :path="mdiCheckCircle" size="24" />
            <h3>DONE XRAYS</h3>
            <span class="count">{{ doneXrays.length }}</span>
          </div>
          <div class="xray-list">
            <div
              v-for="xray in doneXrays"
              :key="xray.id"
              class="xray-item"
              @click="viewXray(xray)"
            >
              <div class="xray-patient">{{ xray.patientName }}</div>
              <div class="xray-name">{{ xray.xrayType }}</div>
              <div class="xray-results">{{ xray.resultDetails }}</div>
              <div class="xray-time">{{ formatTime(xray.resultTimestamp) }}</div>
            </div>
          </div>
        </div>

        <!-- Failed X-rays -->
        <div class="status-container failed">
          <div class="status-header">
            <mdi-icon :path="mdiCloseCircle" size="24" />
            <h3>FAILED XRAYS</h3>
            <span class="count">{{ failedXrays.length }}</span>
          </div>
          <div class="xray-list">
            <div
              v-for="xray in failedXrays"
              :key="xray.id"
              class="xray-item"
              @click="viewXray(xray)"
            >
              <div class="xray-patient">{{ xray.patientName }}</div>
              <div class="xray-name">{{ xray.xrayType }}</div>
              <div class="xray-results">{{ xray.resultDetails }}</div>
              <div class="xray-time">{{ formatTime(xray.resultTimestamp) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports Section -->
      <div class="reports-section">
        <div class="reports-card">
          <h3>REPORTS</h3>
          <div class="date-range">
            <m3-text-field
              v-model="reportDateFrom"
              label="FROM"
              type="date"
              variant="outlined"
              size="small"
            />
            <m3-text-field
              v-model="reportDateTo"
              label="TO"
              type="date"
              variant="outlined"
              size="small"
            />
            <m3-button variant="filled" @click="generateReport">
              BY XRAY TYPE
            </m3-button>
            <m3-button variant="outlined" @click="downloadRadiologyReportPDF">
              <mdi-icon :path="mdiDownload" size="16" />
              Download PDF
            </m3-button>
          </div>
          <p class="print-note">ALL SECTIONS CAN BE PRINTED SEPARATELY</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import apiService from '@/services/api'
import MdiIcon from '@/components/common/MdiIcon.vue'
import M3Button from '@/components/common/M3Button.vue'
import M3TextField from '@/components/common/M3TextField.vue'
import {
  mdiMagnify,
  mdiClockOutline,
  mdiClockAlert,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiDownload
} from '@mdi/js'
import { collection, query, where, onSnapshot, collectionGroup } from 'firebase/firestore'
import { db } from '@/services/firebase'

const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()

const searchQuery = ref('')
const searchResults = ref([])
const reportDateFrom = ref('')
const reportDateTo = ref('')

// X-ray status arrays
const incomingXrays = ref([])
const pendingXrays = ref([])
const doneXrays = ref([])
const failedXrays = ref([])

let unsubscribeXrays = null

// Load radiology requests from all patients
const loadRadiologyRequests = () => {
  const radiologyRequestsQuery = collectionGroup(db, 'radiology_requests')
  
  unsubscribeXrays = onSnapshot(radiologyRequestsQuery, async (snapshot) => {
    const incoming = []
    const pending = []
    const done = []
    const failed = []

    for (const doc of snapshot.docs) {
      const request = { id: doc.id, ...doc.data() }
      
      // Get patient name from the parent document
      const patientId = doc.ref.parent.parent.id
      try {
        const patient = await patientStore.getPatient(patientId)
        request.patientName = `${patient.name} ${patient.surname}`
      } catch (error) {
        request.patientName = 'Unknown Patient'
      }

      // Categorize by status
      switch (request.status) {
        case 'pending':
          if (request.resultDetails) {
            pending.push(request)
          } else {
            incoming.push(request)
          }
          break
        case 'completed':
          done.push(request)
          break
        case 'failed':
          failed.push(request)
          break
        default:
          incoming.push(request)
      }
    }

    incomingXrays.value = incoming
    pendingXrays.value = pending
    doneXrays.value = done
    failedXrays.value = failed
  })
}

// Handle patient search
const handleSearch = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  try {
    const results = await patientStore.searchPatients(searchQuery.value)
    searchResults.value = results
  } catch (error) {
    console.error('Search error:', error)
  }
}

// Navigate to patient profile
const selectPatient = (patient) => {
  router.push(`/patient/${patient.id}`)
  searchQuery.value = ''
  searchResults.value = []
}

// View X-ray details
const viewXray = (xray) => {
  // Navigate to patient profile with X-ray context
  const patientId = xray.patientId || 'unknown'
  router.push(`/patient/${patientId}?tab=radiology&xrayId=${xray.id}`)
}

// Navigation helper
const navigateTo = (path) => {
  router.push(path)
}

// Format timestamp
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Generate report
const generateReport = () => {
  console.log('Generating X-ray report from', reportDateFrom.value, 'to', reportDateTo.value)
}

// Download radiology report PDF
const downloadRadiologyReportPDF = async () => {
  try {
    await apiService.generateReportPDF('radiology_report', reportDateFrom.value, reportDateTo.value, authStore.user.uid)
  } catch (error) {
    console.error('Error downloading radiology report PDF:', error)
    alert('Error generating PDF report. Please try again.')
  }
}

onMounted(() => {
  loadRadiologyRequests()
  
  // Set default date range (last 30 days)
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  reportDateFrom.value = thirtyDaysAgo.toISOString().split('T')[0]
  reportDateTo.value = today.toISOString().split('T')[0]
})

onUnmounted(() => {
  if (unsubscribeXrays) {
    unsubscribeXrays()
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #F7F9FC;
  font-family: 'Roboto', sans-serif;
}

.dashboard-header {
  background: white;
  padding: 24px 32px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #0066B2;
  margin: 0 0 8px 0;
}

.user-info {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.dashboard-content {
  padding: 32px;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Search Section */
.search-section {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
}

.search-result-item {
  padding: 16px;
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background: #F9FAFB;
}

.search-result-item:last-child {
  border-bottom: none;
}

.patient-name {
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.patient-details {
  font-size: 14px;
  color: #6B7280;
}

/* X-ray Status Grid */
.xray-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.status-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.status-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #E5E7EB;
}

.status-header h3 {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
}

.count {
  background: #F3F4F6;
  color: #6B7280;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
}

.xray-list {
  flex: 1;
  overflow-y: auto;
}

.xray-item {
  padding: 16px 20px;
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.xray-item:hover {
  background: #F9FAFB;
}

.xray-item:last-child {
  border-bottom: none;
}

.xray-patient {
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.xray-name {
  font-size: 14px;
  color: #0066B2;
  margin-bottom: 4px;
}

.xray-results {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 4px;
  font-style: italic;
}

.xray-time {
  font-size: 12px;
  color: #9CA3AF;
}

/* Status-specific colors */
.status-container.incoming .status-header {
  background: #FEF3C7;
  color: #92400E;
}

.status-container.pending .status-header {
  background: #FEE2E2;
  color: #991B1B;
}

.status-container.done .status-header {
  background: #D1FAE5;
  color: #065F46;
}

.status-container.failed .status-header {
  background: #FEE2E2;
  color: #991B1B;
}

/* Reports Section */
.reports-section {
  margin-top: 32px;
}

.reports-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.reports-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #0066B2;
}

.date-range {
  display: flex;
  gap: 16px;
  align-items: end;
  margin-bottom: 16px;
}

.print-note {
  font-size: 12px;
  color: #6B7280;
  margin: 0;
  text-align: center;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-content {
    padding: 24px 16px;
  }

  .dashboard-header {
    padding: 16px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .page-title {
    font-size: 20px;
  }

  .xray-status-grid {
    grid-template-columns: 1fr;
  }

  .date-range {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>