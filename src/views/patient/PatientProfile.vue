<template>
  <div class="patient-profile">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">Home</router-link>
          <mdi-icon :path="mdiChevronRight" size="16" />
          <span class="breadcrumb-current">Patient Profile</span>
        </div>
        <h1 class="page-title">PATIENT PROFILE</h1>
      </div>
      
      <div class="header-actions">
        <m3-button variant="outlined" @click="printProfile">
          <mdi-icon :path="mdiPrinter" size="20" />
          Print Profile
        </m3-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading patient information...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <mdi-icon :path="mdiAlertCircle" size="48" color="#DC2626" />
      <h2>Error Loading Patient</h2>
      <p>{{ error }}</p>
      <m3-button variant="filled" @click="loadPatient">
        Try Again
      </m3-button>
    </div>

    <!-- Patient Profile Content -->
    <div v-else-if="patient" class="profile-content">
      <!-- Patient Demographics Card -->
      <div class="demographics-card">
        <div class="card-header">
          <h2>Patient Demographics</h2>
          <div class="patient-id">{{ patient.hospitalNumber }}</div>
        </div>
        
        <div class="demographics-grid">
          <div class="demo-item">
            <label>Full Name</label>
            <span>{{ patient.name }} {{ patient.surname }}</span>
          </div>
          <div class="demo-item">
            <label>ID Number</label>
            <span>{{ patient.idNumber }}</span>
          </div>
          <div class="demo-item">
            <label>Phone Number</label>
            <span>{{ patient.phone }}</span>
          </div>
          <div class="demo-item">
            <label>Date of Birth</label>
            <span>{{ formatDate(patient.dob) }}</span>
          </div>
          <div class="demo-item">
            <label>Age</label>
            <span>{{ patient.age }} years</span>
          </div>
          <div class="demo-item">
            <label>Gender</label>
            <span>{{ patient.gender }}</span>
          </div>
          <div class="demo-item">
            <label>Country of Birth</label>
            <span>{{ patient.countryOfBirth }}</span>
          </div>
          <div class="demo-item">
            <label>Marital Status</label>
            <span>{{ patient.maritalStatus || 'Not specified' }}</span>
          </div>
          <div class="demo-item full-width">
            <label>Address</label>
            <span>{{ patient.address }}</span>
          </div>
        </div>

        <!-- Next of Kin Section -->
        <div class="nok-section">
          <h3>Next of Kin Information</h3>
          <div class="demographics-grid">
            <div class="demo-item">
              <label>N.O.K Name</label>
              <span>{{ patient.nokName }} {{ patient.nokSurname }}</span>
            </div>
            <div class="demo-item">
              <label>N.O.K Phone</label>
              <span>{{ patient.nokPhone }}</span>
            </div>
            <div class="demo-item full-width">
              <label>N.O.K Address</label>
              <span>{{ patient.nokAddress }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Medical Modules Grid -->
      <div class="modules-grid">
        <!-- Billing Module -->
        <div v-if="hasPermission('billing:view')" class="module-card billing">
          <div class="module-header">
            <mdi-icon :path="mdiCashMultiple" size="32" />
            <h3>BILLING AND INVOICES</h3>
          </div>
          <div class="module-actions">
            <m3-button 
              variant="filled" 
              size="small" 
              @click="navigateTo(`/patient/${patient.id}/billing`)"
            >
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('billing:edit')"
              variant="outlined" 
              size="small"
              @click="navigateTo(`/patient/${patient.id}/billing?mode=edit`)"
            >
              EDIT
            </m3-button>
            <m3-button 
              v-if="hasPermission('billing:create')"
              variant="outlined" 
              size="small"
              @click="navigateTo(`/patient/${patient.id}/billing?mode=new`)"
            >
              SAVE
            </m3-button>
          </div>
        </div>

        <!-- Doctor's Notes Module -->
        <div v-if="hasPermission('doctors_notes:view')" class="module-card doctors-notes">
          <div class="module-header">
            <mdi-icon :path="mdiDoctor" size="32" />
            <h3>DOCTORS NOTES</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewDoctorNotes">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('doctors_notes:edit')"
              variant="outlined" 
              size="small"
              @click="editDoctorNotes"
            >
              EDIT
            </m3-button>
            <m3-button 
              v-if="hasPermission('doctors_notes:create')"
              variant="outlined" 
              size="small"
              @click="addDoctorNote"
            >
              ADD
            </m3-button>
          </div>
        </div>

        <!-- Nurse's Notes Module -->
        <div v-if="hasPermission('nurses_notes:view')" class="module-card nurses-notes">
          <div class="module-header">
            <mdi-icon :path="mdiMotherNurse" size="32" />
            <h3>NURSES NOTES</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewNurseNotes">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('nurses_notes:edit')"
              variant="outlined" 
              size="small"
              @click="editNurseNotes"
            >
              EDIT
            </m3-button>
            <m3-button 
              v-if="hasPermission('nurses_notes:create')"
              variant="outlined" 
              size="small"
              @click="addNurseNote"
            >
              ADD
            </m3-button>
          </div>
        </div>

        <!-- Vitals Module -->
        <div v-if="hasPermission('vitals:view')" class="module-card vitals">
          <div class="module-header">
            <mdi-icon :path="mdiHeart" size="32" />
            <h3>VITALS</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewVitals">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('vitals:create')"
              variant="outlined" 
              size="small"
              @click="addVitals"
            >
              ADD
            </m3-button>
          </div>
        </div>

        <!-- Prescriptions Module -->
        <div v-if="hasPermission('prescriptions:view')" class="module-card prescriptions">
          <div class="module-header">
            <mdi-icon :path="mdiPill" size="32" />
            <h3>PRESCRIPTIONS</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewPrescriptions">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('prescriptions:edit')"
              variant="outlined" 
              size="small"
              @click="editPrescriptions"
            >
              EDIT
            </m3-button>
            <m3-button 
              v-if="hasPermission('prescriptions:create')"
              variant="outlined" 
              size="small"
              @click="addPrescription"
            >
              ADD
            </m3-button>
            <m3-button 
              v-if="hasPermission('prescriptions:dispense')"
              variant="outlined" 
              size="small"
              @click="dispenseMedication"
            >
              DISPENSE
            </m3-button>
          </div>
        </div>

        <!-- Laboratory Module -->
        <div v-if="hasPermission('lab_requests:view')" class="module-card laboratory">
          <div class="module-header">
            <mdi-icon :path="mdiTestTube" size="32" />
            <h3>LABORATORY</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewLabResults">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('lab_requests:create')"
              variant="outlined" 
              size="small"
              @click="requestLabTest"
            >
              REQUEST
            </m3-button>
            <m3-button 
              v-if="hasPermission('lab_results:create')"
              variant="outlined" 
              size="small"
              @click="enterLabResults"
            >
              ENTER RESULTS
            </m3-button>
          </div>
        </div>

        <!-- Radiology Module -->
        <div v-if="hasPermission('radiology_requests:view')" class="module-card radiology">
          <div class="module-header">
            <mdi-icon :path="mdiRadiobox" size="32" />
            <h3>RADIOLOGY</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewRadiologyResults">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('radiology_requests:create')"
              variant="outlined" 
              size="small"
              @click="requestXray"
            >
              REQUEST
            </m3-button>
            <m3-button 
              v-if="hasPermission('radiology_results:create')"
              variant="outlined" 
              size="small"
              @click="enterRadiologyResults"
            >
              ENTER RESULTS
            </m3-button>
          </div>
        </div>

        <!-- Operations/Surgeries Module -->
        <div v-if="hasPermission('operations:view')" class="module-card operations">
          <div class="module-header">
            <mdi-icon :path="mdiScalpel" size="32" />
            <h3>OPERATIONS/SURGERIES</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewOperations">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('operations:create')"
              variant="outlined" 
              size="small"
              @click="addOperation"
            >
              ADD
            </m3-button>
          </div>
        </div>

        <!-- Rehabilitation Module -->
        <div v-if="hasPermission('rehabilitation_notes:view')" class="module-card rehabilitation">
          <div class="module-header">
            <mdi-icon :path="mdiPhysicalTherapy" size="32" />
            <h3>REHABILITATION NOTES</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewRehabNotes">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('rehabilitation_notes:edit')"
              variant="outlined" 
              size="small"
              @click="editRehabNotes"
            >
              EDIT
            </m3-button>
            <m3-button 
              v-if="hasPermission('rehabilitation_notes:create')"
              variant="outlined" 
              size="small"
              @click="addRehabNote"
            >
              ADD
            </m3-button>
          </div>
        </div>

        <!-- Admission/Discharge Module -->
        <div v-if="hasPermission('admission_discharge:view')" class="module-card admission">
          <div class="module-header">
            <mdi-icon :path="mdiHospitalBuilding" size="32" />
            <h3>ADMISSION AND DISCHARGE SUMMARIES</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewAdmissionDischarge">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('admission_discharge:create')"
              variant="outlined" 
              size="small"
              @click="addAdmissionDischarge"
            >
              ADD
            </m3-button>
            <m3-button 
              v-if="hasPermission('admission_discharge:approve')"
              variant="outlined" 
              size="small"
              @click="approveDischarge"
            >
              APPROVE
            </m3-button>
          </div>
        </div>

        <!-- Consent Forms Module -->
        <div v-if="hasPermission('consent_forms:view')" class="module-card consent">
          <div class="module-header">
            <mdi-icon :path="mdiFileDocument" size="32" />
            <h3>CONSENT FORMS</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewConsentForms">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('consent_forms:create')"
              variant="outlined" 
              size="small"
              @click="addConsentForm"
            >
              ADD
            </m3-button>
          </div>
        </div>
      </div>

      <!-- Patient History Button -->
      <div class="patient-history-section">
        <m3-button 
          variant="filled" 
          size="large" 
          :icon="mdiHistory"
          @click="viewPatientHistory"
          class="history-button"
        >
          PATIENT HISTORY
        </m3-button>
      </div>

      <!-- Print Notice -->
      <div class="print-notice">
        <p>ALL SECTIONS CAN BE PRINTED SEPARATELY</p>
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
import M3Button from '@/components/common/M3Button.vue'
import {
  mdiChevronRight,
  mdiPrinter,
  mdiAlertCircle,
  mdiCashMultiple,
  mdiDoctor,
  mdiMotherNurse,
  mdiHeart,
  mdiPill,
  mdiTestTube,
  mdiRadiobox,
  mdiScalpel,
  mdiPhysicalTherapy,
  mdiHospitalBuilding,
  mdiFileDocument,
  mdiHistory
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

const editDoctorNotes = () => {
  console.log('Edit doctor notes')
  // Implement edit functionality
}

const addDoctorNote = () => {
  console.log('Add doctor note')
  // Implement add functionality
}

const viewNurseNotes = () => {
  console.log('View nurse notes')
}

const editNurseNotes = () => {
  console.log('Edit nurse notes')
}

const addNurseNote = () => {
  console.log('Add nurse note')
}

const viewVitals = () => {
  console.log('View vitals')
}

const addVitals = () => {
  console.log('Add vitals')
}

const viewPrescriptions = () => {
  console.log('View prescriptions')
}

const editPrescriptions = () => {
  console.log('Edit prescriptions')
}

const addPrescription = () => {
  console.log('Add prescription')
}

const dispenseMedication = () => {
  console.log('Dispense medication')
}

const viewLabResults = () => {
  console.log('View lab results')
}

const requestLabTest = () => {
  console.log('Request lab test')
}

const enterLabResults = () => {
  console.log('Enter lab results')
}

const viewRadiologyResults = () => {
  console.log('View radiology results')
}

const requestXray = () => {
  console.log('Request X-ray')
}

const enterRadiologyResults = () => {
  console.log('Enter radiology results')
}

const viewOperations = () => {
  console.log('View operations')
}

const addOperation = () => {
  console.log('Add operation')
}

const viewRehabNotes = () => {
  console.log('View rehab notes')
}

const editRehabNotes = () => {
  console.log('Edit rehab notes')
}

const addRehabNote = () => {
  console.log('Add rehab note')
}

const viewAdmissionDischarge = () => {
  console.log('View admission/discharge')
}

const addAdmissionDischarge = () => {
  console.log('Add admission/discharge')
}

const approveDischarge = () => {
  console.log('Approve discharge')
}

const viewConsentForms = () => {
  console.log('View consent forms')
}

const addConsentForm = () => {
  console.log('Add consent form')
}

const viewPatientHistory = () => {
  console.log('View patient history')
}

const printProfile = () => {
  window.print()
}

onMounted(() => {
  loadPatient()
})
</script>

<style scoped>
.patient-profile {
  min-height: 100vh;
  background: #F7F9FC;
}

.page-header {
  background: white;
  padding: 24px 32px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.header-actions {
  display: flex;
  gap: 12px;
}

.loading-container,
.error-container {
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

.error-container h2 {
  color: #DC2626;
  margin: 16px 0 8px 0;
}

.profile-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.demographics-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #E5E7EB;
}

.card-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.patient-id {
  background: #0066B2;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.demographics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.demo-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.demo-item.full-width {
  grid-column: 1 / -1;
}

.demo-item label {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.demo-item span {
  font-size: 16px;
  color: #1F2937;
  font-weight: 500;
}

.nok-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

.nok-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 20px 0;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.module-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.module-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.module-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.module-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Module-specific colors */
.module-card.billing .module-header {
  color: #059669;
}

.module-card.doctors-notes .module-header {
  color: #0066B2;
}

.module-card.nurses-notes .module-header {
  color: #7C3AED;
}

.module-card.vitals .module-header {
  color: #DC2626;
}

.module-card.prescriptions .module-header {
  color: #F59E0B;
}

.module-card.laboratory .module-header {
  color: #3B82F6;
}

.module-card.radiology .module-header {
  color: #8B5CF6;
}

.module-card.operations .module-header {
  color: #EF4444;
}

.module-card.rehabilitation .module-header {
  color: #10B981;
}

.module-card.admission .module-header {
  color: #6366F1;
}

.module-card.consent .module-header {
  color: #84CC16;
}

.patient-history-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.history-button {
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  min-width: 300px;
}

.print-notice {
  text-align: center;
  margin-top: 24px;
  padding: 16px;
  background: #F3F4F6;
  border-radius: 8px;
}

.print-notice p {
  font-size: 12px;
  color: #6B7280;
  margin: 0;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-content {
    padding: 16px;
  }

  .demographics-card {
    padding: 24px 16px;
  }

  .demographics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modules-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .module-card {
    padding: 20px 16px;
  }

  .module-actions {
    flex-direction: column;
  }

  .page-header {
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
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .history-button {
    min-width: 100%;
  }
}
</style>