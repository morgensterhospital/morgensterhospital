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
      <!-- Demographics Card -->
      <div class="demographics-card">
        <div class="card-header">
          <h2>Patient Demographics</h2>
          <div class="patient-id">{{ patient.hospitalNumber }}</div>
        </div>
        <div class="demographics-grid">
          <div class="demo-item"><label>Full Name</label><span>{{ patient.name }} {{ patient.surname }}</span></div>
          <div class="demo-item"><label>ID Number</label><span>{{ patient.idNumber }}</span></div>
          <div class="demo-item"><label>Phone Number</label><span>{{ patient.phone }}</span></div>
          <div class="demo-item"><label>Date of Birth</label><span>{{ formatDate(patient.dob) }}</span></div>
          <div class="demo-item"><label>Age</label><span>{{ patient.age }} years</span></div>
          <div class="demo-item"><label>Gender</label><span>{{ patient.gender }}</span></div>
          <div class="demo-item"><label>Country of Birth</label><span>{{ patient.countryOfBirth }}</span></div>
          <div class="demo-item"><label>Marital Status</label><span>{{ patient.maritalStatus || 'Not specified' }}</span></div>
          <div class="demo-item full-width"><label>Address</label><span>{{ patient.address }}</span></div>
        </div>
        <div class="nok-section">
          <h3>Next of Kin Information</h3>
          <div class="demographics-grid">
            <div class="demo-item"><label>N.O.K Name</label><span>{{ patient.nokName }} {{ patient.nokSurname }}</span></div>
            <div class="demo-item"><label>N.O.K Phone</label><span>{{ patient.nokPhone }}</span></div>
            <div class="demo-item full-width"><label>N.O.K Address</label><span>{{ patient.nokAddress }}</span></div>
          </div>
        </div>
      </div>

      <!-- Medical Modules Grid -->
      <div class="modules-grid">
        <!-- Billing -->
        <div v-if="hasPermission('billing:view')" class="module-card billing">
          <div class="module-header"><mdi-icon :path="mdiCashMultiple" size="32" /><h3>BILLING AND INVOICES</h3></div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="navigateTo(`/patient/${patient.id}/billing`)">VIEW</m3-button>
            <m3-button v-if="authStore.userRole === 'Accountant'" variant="outlined" size="small" @click="navigateTo(`/patient/${patient.id}/billing?mode=edit`)">EDIT</m3-button>
          </div>
        </div>
        <!-- Doctor's Notes -->
        <div v-if="hasPermission('doctors_notes:view')" class="module-card doctors-notes">
          <div class="module-header"><mdi-icon :path="mdiDoctor" size="32" /><h3>DOCTOR'S NOTES</h3></div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="openNotesModal('doctor')">VIEW</m3-button>
            <m3-button v-if="hasPermission('doctors_notes:create')" variant="outlined" size="small" @click="openNotesModal('doctor')">ADD / EDIT</m3-button>
          </div>
        </div>
        <!-- Nurse's Notes -->
        <div v-if="hasPermission('nurses_notes:view')" class="module-card nurses-notes">
          <div class="module-header"><mdi-icon :path="mdiMotherNurse" size="32" /><h3>NURSE'S NOTES</h3></div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="openNotesModal('nurse')">VIEW</m3-button>
            <m3-button v-if="hasPermission('nurses_notes:create')" variant="outlined" size="small" @click="openNotesModal('nurse')">ADD / EDIT</m3-button>
          </div>
        </div>
        <!-- Vitals -->
        <div v-if="hasPermission('vitals:view')" class="module-card vitals">
          <div class="module-header"><mdi-icon :path="mdiHeart" size="32" /><h3>VITALS</h3></div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="navigateTo(`/patient/${patient.id}/vitals`)">VIEW</m3-button>
            <m3-button v-if="hasPermission('vitals:create')" variant="outlined" size="small" @click="navigateTo(`/patient/${patient.id}/vitals`)">ADD</m3-button>
          </div>
        </div>
        <!-- Prescriptions -->
        <div v-if="hasPermission('prescriptions:view')" class="module-card prescriptions">
          <div class="module-header"><mdi-icon :path="mdiPill" size="32" /><h3>PRESCRIPTIONS</h3></div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="navigateTo(`/patient/${patient.id}/prescriptions`)">VIEW</m3-button>
            <m3-button v-if="hasPermission('prescriptions:edit')" variant="outlined" size="small" @click="navigateTo(`/patient/${patient.id}/prescriptions`)">EDIT</m3-button>
          </div>
        </div>
        <!-- Laboratory -->
        <div v-if="hasPermission('lab_requests:view')" class="module-card laboratory">
          <div class="module-header"><mdi-icon :path="mdiTestTube" size="32" /><h3>LABORATORY</h3></div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="navigateTo(`/patient/${patient.id}/laboratory`)">VIEW</m3-button>
            <m3-button v-if="hasPermission('lab_requests:create')" variant="outlined" size="small" @click="navigateTo(`/patient/${patient.id}/laboratory`)">REQUEST</m3-button>
          </div>
        </div>
        <!-- Other modules... -->
      </div>

      <div class="patient-history-section">
        <m3-button variant="filled" size="large" :icon="mdiHistory" @click="navigateTo(`/patient/${patient.id}/history`)">PATIENT HISTORY</m3-button>
      </div>
      <div class="print-notice"><p>ALL SECTIONS CAN BE PRINTED SEPARATELY</p></div>
    </div>
  </div>

  <NotesListModal
    v-if="patient"
    :show="isNotesListModalVisible"
    :patient="patient"
    :note-type="noteTypeForModal"
    @close="closeNotesModal"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import M3Button from '@/components/common/M3Button.vue'
import NotesListModal from '@/components/common/NotesListModal.vue'
import {
  mdiChevronRight, mdiPrinter, mdiAlertCircle, mdiCashMultiple, mdiDoctor,
  mdiMotherNurse, mdiHeart, mdiPill, mdiTestTube, mdiRadioboxMarked, mdiScalpel,
  mdiPhysicalTherapy, mdiHospitalBuilding, mdiFileDocument, mdiHistory
} from '@mdi/js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()

const loading = ref(true)
const error = ref('')
const patient = ref(null)
const isNotesListModalVisible = ref(false)
const noteTypeForModal = ref('');
const patientId = computed(() => route.params.id)

const loadPatient = async () => {
  try {
    loading.value = true
    error.value = ''
    const patientData = await patientStore.getPatient(patientId.value)
    patient.value = patientData
  } catch (err) {
    error.value = err.message || 'Failed to load patient information'
  } finally {
    loading.value = false
  }
}

const hasPermission = (permission) => authStore.hasPermission(permission)
const navigateTo = (path) => router.push(path)

const formatDate = (date) => {
  if (!date) return 'Not specified'
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const openNotesModal = (noteType) => {
  noteTypeForModal.value = noteType;
  isNotesListModalVisible.value = true;
}

const closeNotesModal = () => {
  isNotesListModalVisible.value = false;
  noteTypeForModal.value = '';
}

const printProfile = () => window.print()

onMounted(loadPatient)
</script>

<style scoped>
.patient-profile { min-height: 100vh; background: #F7F9FC; }
.page-header { background: white; padding: 24px 32px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; }
.breadcrumb-link { color: #0066B2; text-decoration: none; }
.breadcrumb-link:hover { text-decoration: underline; }
.breadcrumb-current { color: #6B7280; }
.page-title { font-size: 28px; font-weight: 700; color: #0066B2; margin: 0; }
.header-actions { display: flex; gap: 12px; }
.loading-container, .error-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; }
.loading-spinner { width: 48px; height: 48px; border: 4px solid #E5E7EB; border-top: 4px solid #0066B2; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.error-container h2 { color: #DC2626; margin: 16px 0 8px 0; }
.profile-content { max-width: 1400px; margin: 0 auto; padding: 32px; display: flex; flex-direction: column; gap: 32px; }
.demographics-card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #E5E7EB; }
.card-header h2 { font-size: 24px; font-weight: 600; color: #1F2937; margin: 0; }
.patient-id { background: #0066B2; color: white; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; }
.demographics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.demo-item { display: flex; flex-direction: column; gap: 4px; }
.demo-item.full-width { grid-column: 1 / -1; }
.demo-item label { font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; }
.demo-item span { font-size: 16px; color: #1F2937; font-weight: 500; }
.nok-section { margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB; }
.nok-section h3 { font-size: 18px; font-weight: 600; color: #1F2937; margin: 0 0 20px 0; }
.modules-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
.module-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: transform 0.2s ease, box-shadow 0.2s ease; }
.module-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.module-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.module-header h3 { font-size: 14px; font-weight: 600; color: #1F2937; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
.module-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.module-card.billing .module-header { color: #059669; }
.module-card.doctors-notes .module-header { color: #0066B2; }
.module-card.nurses-notes .module-header { color: #7C3AED; }
.module-card.vitals .module-header { color: #DC2626; }
.module-card.prescriptions .module-header { color: #F59E0B; }
.module-card.laboratory .module-header { color: #3B82F6; }
.module-card.radiology .module-header { color: #8B5CF6; }
.module-card.operations .module-header { color: #EF4444; }
.module-card.rehabilitation .module-header { color: #10B981; }
.module-card.admission .module-header { color: #6366F1; }
.module-card.consent .module-header { color: #84CC16; }
.patient-history-section { display: flex; justify-content: center; margin-top: 32px; }
.history-button { height: 56px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; min-width: 300px; }
.print-notice { text-align: center; margin-top: 24px; padding: 16px; background: #F3F4F6; border-radius: 8px; }
.print-notice p { font-size: 12px; color: #6B7280; margin: 0; font-style: italic; text-transform: uppercase; letter-spacing: 0.5px; }
@media (max-width: 768px) { .profile-content { padding: 16px; } .demographics-card { padding: 24px 16px; } .demographics-grid { grid-template-columns: 1fr; gap: 16px; } .modules-grid { grid-template-columns: 1fr; gap: 16px; } .module-card { padding: 20px 16px; } .module-actions { flex-direction: column; } .page-header { padding: 16px 20px; flex-direction: column; align-items: flex-start; gap: 16px; } .header-actions { width: 100%; justify-content: flex-end; } .page-title { font-size: 24px; } }
@media (max-width: 480px) { .card-header { flex-direction: column; align-items: flex-start; gap: 12px; } .history-button { min-width: 100%; } }
</style>