<template>
  <div class="space-y-8">
    <!-- Patient Demographics Card -->
    <div class="glass-card p-8">
      <div class="flex justify-between items-center mb-6 pb-4 border-b border-border-futuristic">
        <h2 class="text-2xl font-bold text-primary flex items-center">
          <MdiIcon :path="mdiAccountBox" size="28" class="mr-3" />
          Patient Demographics
        </h2>
        <div class="text-lg font-mono text-accent bg-surface-dark/50 px-4 py-1 rounded">#{{ patient.hospitalNumber }}</div>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoItem icon="mdiAccount" label="Full Name" :value="`${patient.name} ${patient.surname}`" />
        <InfoItem icon="mdiCardAccountDetails" label="ID Number" :value="patient.idNumber" />
        <InfoItem icon="mdiPhone" label="Phone Number" :value="patient.phone" />
        <InfoItem icon="mdiCalendar" label="Date of Birth" :value="formatDate(patient.dob)" />
        <InfoItem icon="mdiNumeric" label="Age" :value="`${patient.age} years`" />
        <InfoItem icon="mdiGenderMaleFemale" label="Gender" :value="patient.gender" />
        <InfoItem icon="mdiEarth" label="Country of Birth" :value="patient.countryOfBirth" />
        <InfoItem icon="mdiRing" label="Marital Status" :value="patient.maritalStatus || 'N/A'" />
        <InfoItem icon="mdiMapMarker" label="Address" :value="patient.address" class="lg:col-span-3" />
      </div>
      <div class="mt-8 pt-6 border-t border-border-futuristic">
        <h3 class="text-xl font-semibold text-primary mb-4 flex items-center">
          <MdiIcon :path="mdiAccountMultiple" size="24" class="mr-3" />
          Next of Kin
        </h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoItem icon="mdiAccount" label="N.O.K Name" :value="`${patient.nokName} ${patient.nokSurname}`" />
          <InfoItem icon="mdiPhone" label="N.O.K Phone" :value="patient.nokPhone" />
          <InfoItem icon="mdiMapMarker" label="N.O.K Address" :value="patient.nokAddress" class="lg:col-span-3" />
        </div>
      </div>
    </div>

    <!-- Medical Modules Grid -->
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      <ModuleCard v-if="hasPermission('billing:view')" title="Billing & Invoices" :icon="mdiCashMultiple" color="text-green-400">
        <button class="futuristic-button" @click="navigateTo(`/patient/${patient.id}/billing`)">View</button>
        <button v-if="authStore.userRole === 'Accountant'" class="futuristic-button !bg-accent" @click="navigateTo(`/patient/${patient.id}/billing?mode=edit`)">Edit</button>
      </ModuleCard>

      <ModuleCard v-if="hasPermission('doctors_notes:view')" title="Doctor's Notes" :icon="mdiDoctor" color="text-blue-400">
        <button class="futuristic-button" @click="openNotesModal('doctor')">View</button>
        <button v-if="hasPermission('doctors_notes:create')" class="futuristic-button !bg-accent" @click="openNotesModal('doctor')">Add/Edit</button>
      </ModuleCard>

      <ModuleCard v-if="hasPermission('nurses_notes:view')" title="Nurse's Notes" :icon="mdiMotherNurse" color="text-purple-400">
        <button class="futuristic-button" @click="openNotesModal('nurse')">View</button>
        <button v-if="hasPermission('nurses_notes:create')" class="futuristic-button !bg-accent" @click="openNotesModal('nurse')">Add/Edit</button>
      </ModuleCard>

      <!-- Placeholder for other modules -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import InfoItem from '@/components/common/InfoItem.vue'
import ModuleCard from '@/components/common/ModuleCard.vue'
import {
  mdiCashMultiple, mdiDoctor, mdiMotherNurse, mdiAccountBox, mdiAccount,
  mdiCardAccountDetails, mdiPhone, mdiCalendar, mdiNumeric, mdiGenderMaleFemale,
  mdiEarth, mdiRing, mdiMapMarker, mdiAccountMultiple
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