<template>
  <div class="p-4">
    <BillingModal v-if="isBillingModalOpen" :patient="patient" @close="closeModal" />
    <InfoModal v-if="isInfoModalOpen" :title="modalTitle" :has-data="modalHasData" @close="closeModal" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Patient Details -->
      <div class="lg:col-span-1 space-y-6">
        <div class="p-6 bg-surface-dark rounded-lg">
          <h3 class="text-lg font-semibold text-primary mb-4">Patient Details</h3>
          <div class="space-y-3">
            <div v-for="field in patientDetails" :key="field.label">
              <p class="text-sm text-text-muted">{{ field.label }}</p>
              <p class="text-text-light">{{ field.value }}</p>
            </div>
          </div>
        </div>
        <div class="p-6 bg-surface-dark rounded-lg">
          <h3 class="text-lg font-semibold text-primary mb-4">Next of Kin</h3>
          <div class="space-y-3">
            <div v-for="field in nokDetails" :key="field.label">
              <p class="text-sm text-text-muted">{{ field.label }}</p>
              <p class="text-text-light">{{ field.value }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Column: Information Cards -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Admission Status Card -->
        <div class="p-4 bg-surface-dark rounded-lg flex justify-between items-center">
          <h3 class="text-lg font-semibold text-text-light">Admission Status</h3>
          <span class="px-3 py-1 rounded-full text-sm font-medium" :class="admissionStatusClass">
            {{ patient.admissionStatus || 'Unknown' }}
          </span>
        </div>
        <!-- Action Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="card in actionCards" :key="card.title" class="p-4 bg-surface-dark rounded-lg flex items-center space-x-4">
            <MdiIcon :path="card.icon" size="24" :class="card.color" />
            <div class="flex-grow">
              <h4 class="font-semibold text-text-light">{{ card.title }}</h4>
            </div>
            <M3Button variant="outlined" size="small" @click="card.action">VIEW</M3Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue';
import MdiIcon from '@/components/common/MdiIcon.vue';
import M3Button from '@/components/common/M3Button.vue';
import BillingModal from '@/components/common/BillingModal.vue';
import InfoModal from '@/components/common/InfoModal.vue';
import {
  mdiCashMultiple,
  mdiDoctor,
  mdiMotherNurse,
  mdiNeedle,
  mdiTestTube,
  mdiRadioactive,
  mdiPill,
  mdiFileDocumentCheckOutline,
  mdiBed,
  mdiClipboardPulseOutline
} from '@mdi/js';

const props = defineProps({
  patient: {
    type: Object,
    required: true,
  },
});

const { patient } = toRefs(props);

const patientDetails = computed(() => [
  { label: 'Hospital Number', value: patient.value.hospitalNumber },
  { label: 'Full Name', value: `${patient.value.name || ''} ${patient.value.surname || ''}` },
  { label: 'Phone Number', value: patient.value.phone },
  { label: 'Residential Address', value: patient.value.address },
  { label: 'Date of Birth', value: patient.value.dob ? new Date(patient.value.dob.seconds * 1000).toLocaleDateString() : '' },
  { label: 'Age', value: patient.value.age },
  { label: 'Gender', value: patient.value.gender },
  { label: 'Country of Birth', value: patient.value.countryOfBirth },
  { label: 'Marital Status', value: patient.value.maritalStatus },
]);

const nokDetails = computed(() => [
  { label: 'Name', value: `${patient.value.nokName || ''} ${patient.value.nokSurname || ''}` },
  { label: 'Phone Number', value: patient.value.nokPhone },
  { label: 'Address', value: patient.value.nokAddress },
]);

const admissionStatusClass = computed(() => {
  const status = patient.value.admissionStatus || 'Unknown';
  if (status === 'Admitted') return 'bg-green-500/20 text-green-400';
  if (status === 'Discharged') return 'bg-red-500/20 text-red-400';
  return 'bg-gray-500/20 text-gray-400';
});

const isBillingModalOpen = ref(false);
const isInfoModalOpen = ref(false);
const modalTitle = ref('');
const modalHasData = ref(false);

const openBillingModal = () => {
  isBillingModalOpen.value = true;
};

const openInfoModal = (title, hasData = false) => {
  modalTitle.value = title;
  modalHasData.value = hasData;
  isInfoModalOpen.value = true;
};

const closeModal = () => {
  isBillingModalOpen.value = false;
  isInfoModalOpen.value = false;
};

const actionCards = ref([
    { title: 'Billing and Invoices', icon: mdiCashMultiple, color: 'text-green-400', action: openBillingModal },
    { title: "Doctor's Notes", icon: mdiDoctor, color: 'text-blue-400', action: () => openInfoModal("Doctor's Notes") },
    { title: "Nurse's Notes", icon: mdiMotherNurse, color: 'text-purple-400', action: () => openInfoModal("Nurse's Notes") },
    { title: "Operations/Surgeries", icon: mdiNeedle, color: 'text-red-400', action: () => openInfoModal("Operations/Surgeries") },
    { title: 'Laboratory', icon: mdiTestTube, color: 'text-yellow-400', action: () => openInfoModal('Laboratory') },
    { title: 'Radiology', icon: mdiRadioactive, color: 'text-indigo-400', action: () => openInfoModal('Radiology') },
    { title: 'Prescriptions', icon: mdiPill, color: 'text-orange-400', action: () => openInfoModal('Prescriptions') },
    { title: 'Consent Forms', icon: mdiFileDocumentCheckOutline, color: 'text-pink-400', action: () => openInfoModal('Consent Forms') },
    { title: 'Admission & Discharge', icon: mdiBed, color: 'text-teal-400', action: () => openInfoModal('Admission & Discharge') },
]);


</script>
