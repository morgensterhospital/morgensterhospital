<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-text-light">
          Welcome, {{ authStore.user?.displayName || 'Account Assistant' }}!
        </h1>
        <p class="text-text-muted">Here is your financial overview.</p>
      </div>
      <div class="flex items-center space-x-4">
        <div class="p-4 bg-surface-dark rounded-lg text-center">
          <p class="text-sm text-text-muted">Date</p>
          <p class="text-lg font-semibold text-text-light">{{ currentDate }}</p>
        </div>
        <div class="p-4 bg-surface-dark rounded-lg text-center">
          <p class="text-sm text-text-muted">Time</p>
          <p class="text-lg font-semibold text-text-light">{{ currentTime }}</p>
        </div>
      </div>
    </div>

    <!-- Patient Search -->
    <div class="p-6 bg-surface-dark rounded-lg mt-6">
        <h2 class="text-lg font-semibold mb-4">Find a Patient's Financial Record</h2>
        <div class="relative">
          <m3-text-field
            v-model="searchQuery"
            placeholder="Search by name or hospital number..."
            :icon-leading="mdiMagnify"
            variant="outlined"
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
                <p class="text-sm text-text-muted">
                  ID: {{ patient.hospitalNumber }} &bull; Age: {{ patient.age }}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

    <!-- Financial Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="p-6 bg-surface-dark rounded-lg">
        <div class="flex items-center justify-between">
          <p class="text-sm text-text-muted">Clerks Supervised</p>
          <MdiIcon :path="mdiAccountSupervisor" size="24" class="text-primary" />
        </div>
        <p class="text-3xl font-bold mt-2">{{ supervisoryStats.clerksSupervised }}</p>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg">
        <div class="flex items-center justify-between">
          <p class="text-sm text-text-muted">Pending Approvals</p>
          <MdiIcon :path="mdiClockAlert" size="24" class="text-yellow-400" />
        </div>
        <p class="text-3xl font-bold mt-2">{{ supervisoryStats.pendingApprovals }}</p>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg">
        <div class="flex items-center justify-between">
          <p class="text-sm text-text-muted">Today's Cash Sales</p>
          <MdiIcon :path="mdiCashMultiple" size="24" class="text-green-400" />
        </div>
        <p class="text-3xl font-bold mt-2">M{{ formatCurrency(supervisoryStats.todayCashSales) }}</p>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg">
        <div class="flex items-center justify-between">
          <p class="text-sm text-text-muted">Reports Generated</p>
          <MdiIcon :path="mdiFileDocument" size="24" class="text-indigo-400" />
        </div>
        <p class="text-3xl font-bold mt-2">{{ supervisoryStats.reportsGenerated }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quick Actions -->
      <div class="p-6 bg-surface-dark rounded-lg">
        <h2 class="text-lg font-semibold mb-4">Core Functions</h2>
        <div class="space-y-4">
          <m3-button @click="navigateTo('/reports')" variant="filled" full-width>
            <MdiIcon :path="mdiChartLine" size="24" class="mr-3" />
            Reports & Analytics
          </m3-button>
          <m3-button @click="printCashSales" variant="filled" full-width>
            <MdiIcon :path="mdiPrinter" size="24" class="mr-3" />
            Print Cash Sales
          </m3-button>
          <m3-button @click="navigateTo('/approvals')" variant="filled" full-width>
            <MdiIcon :path="mdiCheckDecagram" size="24" class="mr-3" />
            Approve Balances
          </m3-button>
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
import MdiIcon from '@/components/common/MdiIcon.vue'
import M3Button from '@/components/common/M3Button.vue'
import M3TextField from '@/components/common/M3TextField.vue'
import {
  mdiChartLine,
  mdiMagnify,
  mdiPrinter,
  mdiCheckDecagram,
  mdiAccountSupervisor,
  mdiClockAlert,
  mdiCashMultiple,
  mdiFileDocument,
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()

const searchQuery = ref('')
const searchResults = ref([])
const currentDate = ref('')
const currentTime = ref('')
const supervisoryStats = ref({
  clerksSupervised: 5,
  pendingApprovals: 12,
  todayCashSales: 8500.00,
  reportsGenerated: 24
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

// Print cash sales report
const printCashSales = () => {
  // Generate and print cash sales report
  console.log('Printing cash sales report...')
  // Implement print functionality
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
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
