<template>
  <div class="bg-background-dark min-h-screen text-text-light font-sans p-4 md:p-8">
    <!-- Header -->
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-text-light">Patient Profile</h1>
        <p class="text-text-muted">Viewing patient details and medical records.</p>
      </div>
      <button @click="printProfile" class="flex items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
        <MdiIcon :path="mdiPrinter" size="20" class="mr-2 text-primary" />
        Print Profile
      </button>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <MdiIcon :path="mdiLoading" class="animate-spin text-4xl text-primary" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
      <p><strong>Error:</strong> {{ error }}</p>
      <button @click="loadPatient" class="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-background-dark font-semibold rounded-lg transition-colors">
        Try Again
      </button>
    </div>

    <!-- Profile Content -->
    <div v-else-if="patient" class="space-y-8">
      <!-- Patient Demographics -->
      <div class="bg-surface-dark rounded-lg p-6 shadow-lg">
        <div class="flex justify-between items-start">
          <h2 class="text-xl font-semibold text-text-light">Patient Demographics</h2>
          <span class="px-3 py-1 bg-primary/20 text-primary text-sm font-bold rounded-full">{{ patient.hospitalNumber }}</span>
        </div>
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Patient Info -->
          <div>
            <label class="text-sm font-medium text-text-muted">Full Name</label>
            <p class="mt-1 text-text-light">{{ patient.name }} {{ patient.surname }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-text-muted">ID Number</label>
            <p class="mt-1 text-text-light">{{ patient.idNumber }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-text-muted">Phone Number</label>
            <p class="mt-1 text-text-light">{{ patient.phone }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-text-muted">Date of Birth</label>
            <p class="mt-1 text-text-light">{{ formatDate(patient.dob) }} ({{ patient.age }} years)</p>
          </div>
          <div>
            <label class="text-sm font-medium text-text-muted">Gender</label>
            <p class="mt-1 text-text-light">{{ patient.gender }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-text-muted">Marital Status</label>
            <p class="mt-1 text-text-light">{{ patient.maritalStatus || 'N/A' }}</p>
          </div>
          <div class="lg:col-span-3">
            <label class="text-sm font-medium text-text-muted">Address</label>
            <p class="mt-1 text-text-light">{{ patient.address }}</p>
          </div>
          <!-- Next of Kin -->
          <div class="lg:col-span-3 border-t border-gray-700 pt-6 mt-6">
            <h3 class="text-lg font-semibold text-text-light mb-4">Next of Kin</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="text-sm font-medium text-text-muted">Full Name</label>
                <p class="mt-1 text-text-light">{{ patient.nokName }} {{ patient.nokSurname }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-text-muted">Phone Number</label>
                <p class="mt-1 text-text-light">{{ patient.nokPhone }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="text-sm font-medium text-text-muted">Address</label>
                <p class="mt-1 text-text-light">{{ patient.nokAddress }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Medical Modules -->
      <div class="bg-surface-dark rounded-lg p-6 shadow-lg">
        <h2 class="text-xl font-semibold text-text-light mb-6">Medical Records & Actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <!-- Module Card -->
          <button v-if="hasPermission('billing:view')" @click="navigateTo(`/patient/${patient.id}/billing`)" class="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-left transition-colors">
            <MdiIcon :path="mdiCashMultiple" size="24" class="mb-2 text-primary" />
            <p class="font-semibold">Billing</p>
            <p class="text-xs text-text-muted">View and manage invoices</p>
          </button>
          <button v-if="hasPermission('doctors_notes:view')" @click="viewDoctorNotes" class="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-left transition-colors">
            <MdiIcon :path="mdiDoctor" size="24" class="mb-2 text-primary" />
            <p class="font-semibold">Doctor's Notes</p>
            <p class="text-xs text-text-muted">View clinical notes</p>
          </button>
          <button v-if="hasPermission('nurses_notes:view')" @click="viewNurseNotes" class="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-left transition-colors">
            <MdiIcon :path="mdiMotherNurse" size="24" class="mb-2 text-primary" />
            <p class="font-semibold">Nurse's Notes</p>
            <p class="text-xs text-text-muted">View nursing records</p>
          </button>
          <button v-if="hasPermission('vitals:view')" @click="viewVitals" class="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-left transition-colors">
            <MdiIcon :path="mdiHeart" size="24" class="mb-2 text-primary" />
            <p class="font-semibold">Vitals</p>
            <p class="text-xs text-text-muted">View vital signs history</p>
          </button>
          <button v-if="hasPermission('prescriptions:view')" @click="viewPrescriptions" class="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-left transition-colors">
            <MdiIcon :path="mdiPill" size="24" class="mb-2 text-primary" />
            <p class="font-semibold">Prescriptions</p>
            <p class="text-xs text-text-muted">View medication history</p>
          </button>
          <button v-if="hasPermission('lab_requests:view')" @click="viewLabResults" class="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-left transition-colors">
            <MdiIcon :path="mdiTestTube" size="24" class="mb-2 text-primary" />
            <p class="font-semibold">Laboratory</p>
            <p class="text-xs text-text-muted">View lab results</p>
          </button>
          <button v-if="hasPermission('radiology_requests:view')" @click="viewRadiologyResults" class="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-left transition-colors">
            <MdiIcon :path="mdiRadioboxMarked" size="24" class="mb-2 text-primary" />
            <p class="font-semibold">Radiology</p>
            <p class="text-xs text-text-muted">View imaging results</p>
          </button>
          <button v-if="hasPermission('operations:view')" @click="viewOperations" class="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-left transition-colors">
            <MdiIcon :path="mdiScalpel" size="24" class="mb-2 text-primary" />
            <p class="font-semibold">Operations</p>
            <p class="text-xs text-text-muted">View surgical history</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import {
  mdiPrinter,
  mdiAlertCircle,
  mdiCashMultiple,
  mdiDoctor,
  mdiMotherNurse,
  mdiHeart,
  mdiPill,
  mdiTestTube,
  mdiRadioboxMarked,
  mdiScalpel,
  mdiLoading
} from '@mdi/js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()

const loading = ref(true)
const error = ref('')
const patient = ref(null)

const patientId = computed(() => route.params.id)

// Load patient data
const loadPatient = async () => {
  try {
    loading.value = true
    error.value = ''

    const patientData = await patientStore.getPatient(patientId.value)
    patient.value = patientData
  } catch (err) {
    error.value = err.message || 'Failed to load patient information'
    console.error('Error loading patient:', err)
  } finally {
    loading.value = false
  }
}

// Permission check
const hasPermission = (permission) => {
  return authStore.hasPermission(permission)
}

// Navigation helper
const navigateTo = (path) => {
  router.push(path)
}

// Format date helper
const formatDate = (date) => {
  if (!date) return 'Not specified'
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Module action handlers
const viewDoctorNotes = () => {
  console.log('View doctor notes')
  // Implement modal or navigation to doctor notes
}

const viewNurseNotes = () => {
  console.log('View nurse notes')
}

const viewVitals = () => {
  console.log('View vitals')
}

const viewPrescriptions = () => {
  console.log('View prescriptions')
}

const viewLabResults = () => {
  console.log('View lab results')
}

const viewRadiologyResults = () => {
  console.log('View radiology results')
}

const viewOperations = () => {
  console.log('View operations')
}

const printProfile = () => {
  window.print()
}

onMounted(() => {
  loadPatient()
})
</script>
