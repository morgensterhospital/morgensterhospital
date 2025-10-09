<template>
  <div class="profile-content">
    <!-- Patient Demographics Card -->
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
      <!-- Other modules... -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import M3Button from '@/components/common/M3Button.vue'
import {
  mdiCashMultiple, mdiDoctor, mdiMotherNurse
} from '@mdi/js'

const props = defineProps({
  patient: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const authStore = useAuthStore()

const hasPermission = (permission) => authStore.hasPermission(permission)
const navigateTo = (path) => router.push(path)

const formatDate = (date) => {
  if (!date) return 'Not specified'
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const emit = defineEmits(['open-notes-modal']);
const openNotesModal = (noteType) => {
  emit('open-notes-modal', noteType);
}
</script>

<style scoped>
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
.module-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.module-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.module-header h3 { font-size: 14px; font-weight: 600; color: #1F2937; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
.module-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.module-card.billing .module-header { color: #059669; }
.module-card.doctors-notes .module-header { color: #0066B2; }
.module-card.nurses-notes .module-header { color: #7C3AED; }
</style>