<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
    <!-- Patient Demographics Card -->
    <div class="bg-card/50 dark:bg-card/80 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-lg border border-accent/10 transition-all duration-300 hover:shadow-aqua-glow">
      <div class="flex justify-between items-center pb-4 mb-4 border-b border-accent/20">
        <h2 class="text-2xl font-bold text-text-main">Patient Demographics</h2>
        <div class="bg-accent text-black font-bold text-sm px-4 py-1 rounded-full">{{ patient.hospitalNumber }}</div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-text-main">
        <div v-for="item in demographics" :key="item.label" :class="item.fullWidth ? 'md:col-span-2 lg:col-span-3' : ''">
          <label class="text-xs uppercase font-semibold text-accent/70">{{ item.label }}</label>
          <p class="text-base">{{ item.value }}</p>
        </div>
      </div>
      <div class="mt-8 pt-6 border-t border-accent/20">
        <h3 class="text-xl font-bold text-text-main mb-4">Next of Kin Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-text-main">
          <div v-for="item in nok" :key="item.label" :class="item.fullWidth ? 'md:col-span-2' : ''">
            <label class="text-xs uppercase font-semibold text-accent/70">{{ item.label }}</label>
            <p class="text-base">{{ item.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Medical Modules Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="(card, index) in moduleCards" v-if="hasPermission(card.permission)" :key="card.title"
           class="bg-card/50 dark:bg-card/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-accent/10 transition-all duration-300 hover:scale-105 hover:shadow-aqua-glow animate-fade-in-up"
           :style="{ animationDelay: `${index * 100}ms` }">
        <div class="flex items-center gap-4 mb-4">
          <MdiIcon :path="card.icon" size="32" class="text-accent" />
          <h3 class="text-lg font-bold uppercase tracking-wider text-text-main">{{ card.title }}</h3>
        </div>
        <div class="flex flex-wrap gap-2">
          <button v-for="action in card.actions" v-if="hasPermission(action.permission)" :key="action.label" @click="action.handler"
                  :class="[action.primary ? 'bg-accent text-black' : 'bg-transparent border border-accent text-accent', 'px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-aqua-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-background']">
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import {
  mdiCashMultiple, mdiDoctor, mdiMotherNurse, mdiStethoscope, mdiPill,
  mdiFileDocumentEditOutline, mdiFileChartOutline, mdiBeaker, mdiRadiologyBox, mdiRun
} from '@mdi/js'

const props = defineProps({
  patient: { type: Object, required: true },
})

const router = useRouter()
const authStore = useAuthStore()
const emit = defineEmits(['open-notes-modal'])

const hasPermission = (permission) => !permission || authStore.hasPermission(permission)
const navigateTo = (path) => router.push(path)
const openNotesModal = (noteType) => emit('open-notes-modal', noteType)

const formatDate = (date) => {
  if (!date) return 'Not specified'
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const demographics = computed(() => [
  { label: 'Full Name', value: `${props.patient.name} ${props.patient.surname}` },
  { label: 'ID Number', value: props.patient.idNumber },
  { label: 'Phone Number', value: props.patient.phone },
  { label: 'Date of Birth', value: formatDate(props.patient.dob) },
  { label: 'Age', value: `${props.patient.age} years` },
  { label: 'Gender', value: props.patient.gender },
  { label: 'Country of Birth', value: props.patient.countryOfBirth },
  { label: 'Marital Status', value: props.patient.maritalStatus || 'Not specified' },
  { label: 'Address', value: props.patient.address, fullWidth: true },
])

const nok = computed(() => [
  { label: 'N.O.K Name', value: `${props.patient.nokName} ${props.patient.nokSurname}` },
  { label: 'N.O.K Phone', value: props.patient.nokPhone },
  { label: 'N.O.K Address', value: props.patient.nokAddress, fullWidth: true },
])

const moduleCards = computed(() => [
  { title: 'Billing and Invoices', icon: mdiCashMultiple, permission: 'billing:view', actions: [
    { label: 'View', handler: () => navigateTo(`/patient/${props.patient.id}/billing`), primary: true },
    { label: 'Edit', handler: () => navigateTo(`/patient/${props.patient.id}/billing?mode=edit`), permission: 'billing:edit' },
  ]},
  { title: 'Doctor\'s Notes', icon: mdiDoctor, permission: 'doctors_notes:view', actions: [
    { label: 'View', handler: () => openNotesModal('doctor'), primary: true },
    { label: 'Edit/Save', handler: () => openNotesModal('doctor'), permission: 'doctors_notes:edit' },
  ]},
  { title: 'Nurse\'s Notes', icon: mdiMotherNurse, permission: 'nurses_notes:view', actions: [
    { label: 'View', handler: () => openNotesModal('nurse'), primary: true },
    { label: 'Add/Save', handler: () => openNotesModal('nurse'), permission: 'nurses_notes:create' },
    { label: 'Use Stationery', handler: () => {}, permission: 'nurses_notes:use_stationery' },
  ]},
  { title: 'Operations/Surgeries', icon: mdiStethoscope, permission: 'operations:view', actions: [
    { label: 'View', handler: () => openNotesModal('operation'), primary: true },
    { label: 'Add/Save', handler: () => openNotesModal('operation'), permission: 'operations:create' },
    { label: 'Edit/Save', handler: () => openNotesModal('operation'), permission: 'operations:edit' },
  ]},
  { title: 'Prescriptions', icon: mdiPill, permission: 'prescriptions:view', actions: [
    { label: 'View', handler: () => openNotesModal('prescription'), primary: true },
    { label: 'Add/Save', handler: () => openNotesModal('prescription'), permission: 'prescriptions:create' },
    { label: 'Edit/Save', handler: () => openNotesModal('prescription'), permission: 'prescriptions:edit' },
    { label: 'Print', handler: () => {}, permission: 'prescriptions:print' },
  ]},
  { title: 'Consent Forms', icon: mdiFileDocumentEditOutline, permission: 'consent_forms:view', actions: [
    { label: 'View', handler: () => openNotesModal('consent'), primary: true },
    { label: 'Add/Save', handler: () => openNotesModal('consent'), permission: 'consent_forms:create' },
    { label: 'Edit/Save', handler: () => openNotesModal('consent'), permission: 'consent_forms:edit' },
    { label: 'Print', handler: () => {}, permission: 'consent_forms:print' },
  ]},
  { title: 'Admission & Discharge', icon: mdiFileChartOutline, permission: 'admission_discharge:view', actions: [
    { label: 'View', handler: () => openNotesModal('admission'), primary: true },
    { label: 'Add/Save', handler: () => openNotesModal('admission'), permission: 'admission_discharge:create' },
    { label: 'Edit/Save', handler: () => openNotesModal('admission'), permission: 'admission_discharge:edit' },
  ]},
  { title: 'Laboratory', icon: mdiBeaker, permission: 'laboratory:view', actions: [
    { label: 'View', handler: () => openNotesModal('lab'), primary: true },
    { label: 'Receive & Post', handler: () => openNotesModal('lab'), permission: 'lab_requests:update' },
  ]},
  { title: 'Radiology', icon: mdiRadiologyBox, permission: 'radiology:view', actions: [
    { label: 'View', handler: () => openNotesModal('radiology'), primary: true },
    { label: 'Receive & Post', handler: () => openNotesModal('radiology'), permission: 'radiology_requests:update' },
  ]},
  { title: 'Rehabilitation Notes', icon: mdiRun, permission: 'rehabilitation_notes:view', actions: [
    { label: 'View', handler: () => openNotesModal('rehab'), primary: true },
    { label: 'Add/Edit', handler: () => openNotesModal('rehab'), permission: 'rehabilitation_notes:create' },
  ]},
])
</script>