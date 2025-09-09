<template>
  <div class="dashboard">
    <!-- Page Header -->
    <div class="dashboard-header">
      <div class="header-info">
        <h1 class="page-title">MORGENSTER HOSPITAL MANAGEMENT SYSTEM</h1>
        <div class="user-info">
          LOGGED IN AS: {{ authStore.user?.displayName || 'USER' }}: ADMIN
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
      <!-- Left Section - Navigation & Actions -->
      <div class="left-section">
        <div class="main-actions">
          <m3-button
            variant="filled"
            size="large"
            full-width
            :icon="mdiAccountGroup"
            @click="navigateTo('/users')"
            class="main-action-btn"
          >
            USER MANAGEMENT
          </m3-button>

          <m3-button
            variant="filled"
            size="large"
            full-width
            :icon="mdiAccountPlus"
            @click="navigateTo('/patient/register')"
            class="main-action-btn"
          >
            NEW PATIENT REGISTRATION
          </m3-button>

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

          <m3-button
            variant="filled"
            size="large"
            full-width
            :icon="mdiChartLine"
            @click="navigateTo('/reports')"
            class="main-action-btn"
          >
            REPORTS
          </m3-button>

          <m3-button
            variant="filled"
            size="large"
            full-width
            :icon="mdiCog"
            @click="navigateTo('/settings')"
            class="main-action-btn"
          >
            SYSTEM SETTINGS
          </m3-button>
        </div>
      </div>

      <!-- Right Section - Stats & DateTime -->
      <div class="right-section">
        <!-- Date and Time -->
        <div class="datetime-section">
          <div class="datetime-card">
            <div class="datetime-label">DATE</div>
            <div class="datetime-value">{{ currentDate }}</div>
          </div>
          <div class="datetime-card">
            <div class="datetime-label">TIME</div>
            <div class="datetime-value">{{ currentTime }}</div>
          </div>
        </div>

        <!-- System Stats -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-card primary">
              <div class="stat-icon">
                <mdi-icon :path="mdiAccountGroup" size="32" />
              </div>
              <div class="stat-content">
                <div class="stat-label">TOTAL USERS</div>
                <div class="stat-value">{{ systemStats.totalUsers }}</div>
              </div>
            </div>

            <div class="stat-card success">
              <div class="stat-icon">
                <mdi-icon :path="mdiAccountPlus" size="32" />
              </div>
              <div class="stat-content">
                <div class="stat-label">TOTAL PATIENTS</div>
                <div class="stat-value">{{ systemStats.totalPatients }}</div>
              </div>
            </div>

            <div class="stat-card warning">
              <div class="stat-icon">
                <mdi-icon :path="mdiHospitalBuilding" size="32" />
              </div>
              <div class="stat-content">
                <div class="stat-label">ACTIVE DEPARTMENTS</div>
                <div class="stat-value">{{ systemStats.activeDepartments }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Welcome Message -->
        <div class="welcome-section">
          <div class="welcome-card">
            <h3>CLIENT NAME AND LOGO</h3>
            <p>WELCOME MESSAGE</p>
          </div>
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
import MdiIcon from '@/components/common/MdiIcon.vue'
import M3Button from '@/components/common/M3Button.vue'
import M3TextField from '@/components/common/M3TextField.vue'
import {
  mdiAccountGroup,
  mdiAccountPlus,
  mdiChartLine,
  mdiMagnify,
  mdiCog,
  mdiHospitalBuilding
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()

const searchQuery = ref('')
const searchResults = ref([])
const currentDate = ref('')
const currentTime = ref('')
const systemStats = ref({
  totalUsers: 147,
  totalPatients: 0,
  activeDepartments: 8
})

let timeInterval = null

// Initialize datetime display
const updateDateTime = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  currentTime.value = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
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

// Navigation helper
const navigateTo = (path) => {
  router.push(path)
}

onMounted(() => {
  updateDateTime()
  timeInterval = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.left-section,
.right-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Main Actions */
.main-actions {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-action-btn {
  height: 64px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Search Section */
.search-section {
  position: relative;
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

/* DateTime Section */
.datetime-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.datetime-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.datetime-label {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.datetime-value {
  font-size: 18px;
  font-weight: 700;
  color: #0066B2;
}

/* Stats Section */
.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, #0066B2 0%, #0052A3 100%);
  color: white;
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);
  color: white;
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #1F2937;
  line-height: 1;
}

/* Welcome Section */
.welcome-section {
  margin-top: auto;
}

.welcome-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.welcome-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #0066B2;
  margin: 0 0 12px 0;
}

.welcome-card p {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
    gap: 24px;
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

  .datetime-section {
    grid-template-columns: 1fr;
  }

  .main-action-btn {
    height: 56px;
    font-size: 14px;
  }
}
</style>