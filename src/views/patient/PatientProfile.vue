<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold">Patient Profile</h1>
        <p class="text-text-muted">Viewing profile for {{ patient?.name }} {{ patient?.surname }}</p>
      </div>
      <button @click="printProfile" class="px-4 py-2 bg-surface-dark border border-gray-700 rounded-lg flex items-center gap-2 hover:bg-primary/20">
        <MdiIcon :path="mdiPrinter" size="20" />
        <span>Print Profile</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center p-12 bg-surface-dark rounded-lg">
      <p>Loading patient information...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-12 bg-red-900/50 text-red-300 rounded-lg text-center">
      <MdiIcon :path="mdiAlertCircle" size="48" class="mx-auto" />
      <h2 class="text-xl font-bold mt-4">Error Loading Patient</h2>
      <p>{{ error }}</p>
      <button @click="loadPatient" class="mt-4 px-4 py-2 bg-primary text-background-dark font-bold rounded-lg hover:bg-primary-hover">Try Again</button>
    </div>

    <!-- Patient Profile Content -->
    <div v-else-if="patient" class="space-y-6">
      <!-- Demographics -->
      <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <h2 class="text-xl font-bold">Patient Demographics</h2>
          <span class="px-3 py-1 bg-primary text-background-dark rounded-full text-xs font-bold">{{ patient.hospitalNumber }}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div><strong class="text-text-muted">Full Name:</strong> {{ patient.name }} {{ patient.surname }}</div>
          <div><strong class="text-text-muted">ID Number:</strong> {{ patient.idNumber }}</div>
          <div><strong class="text-text-muted">Phone:</strong> {{ patient.phone }}</div>
          <div><strong class="text-text-muted">Date of Birth:</strong> {{ formatDate(patient.dob) }}</div>
          <div><strong class="text-text-muted">Age:</strong> {{ patient.age }} years</div>
          <div><strong class="text-text-muted">Gender:</strong> {{ patient.gender }}</div>
          <div><strong class="text-text-muted">Country of Birth:</strong> {{ patient.countryOfBirth }}</div>
          <div><strong class="text-text-muted">Marital Status:</strong> {{ patient.maritalStatus || 'N/A' }}</div>
          <div class="lg:col-span-3"><strong class="text-text-muted">Address:</strong> {{ patient.address }}</div>
        </div>
        <div class="mt-6 pt-4 border-t border-gray-700">
          <h3 class="text-lg font-bold mb-2">Next of Kin</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div><strong class="text-text-muted">Name:</strong> {{ patient.nokName }} {{ patient.nokSurname }}</div>
            <div><strong class="text-text-muted">Phone:</strong> {{ patient.nokPhone }}</div>
            <div class="lg:col-span-3"><strong class="text-text-muted">Address:</strong> {{ patient.nokAddress }}</div>
          </div>
        </div>
      </div>

      <!-- Medical Modules -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-if="hasPermission('billing:view')" class="p-4 bg-surface-dark rounded-lg">
          <h3 class="font-bold flex items-center gap-2 mb-3"><MdiIcon :path="mdiCashMultiple" size="20" class="text-green-400" /> Billing & Invoices</h3>
          <div class="flex gap-2"><button @click="navigateTo(`/patient/${patient.id}/billing`)" class="flex-1 py-2 px-3 text-sm bg-primary text-background-dark rounded hover:bg-primary-hover">View</button></div>
        </div>
        <div v-if="hasPermission('doctors_notes:view')" class="p-4 bg-surface-dark rounded-lg">
          <h3 class="font-bold flex items-center gap-2 mb-3"><MdiIcon :path="mdiDoctor" size="20" class="text-blue-400" /> Doctor's Notes</h3>
          <div class="flex gap-2"><button @click="viewDoctorNotes" class="flex-1 py-2 px-3 text-sm bg-primary text-background-dark rounded hover:bg-primary-hover">View</button><button v-if="hasPermission('doctors_notes:create')" @click="addDoctorNote" class="flex-1 py-2 px-3 text-sm bg-background-dark rounded hover:bg-primary/20">Add</button></div>
        </div>
        <div v-if="hasPermission('nurses_notes:view')" class="p-4 bg-surface-dark rounded-lg">
          <h3 class="font-bold flex items-center gap-2 mb-3"><MdiIcon :path="mdiMotherNurse" size="20" class="text-purple-400" /> Nurse's Notes</h3>
          <div class="flex gap-2"><button @click="viewNurseNotes" class="flex-1 py-2 px-3 text-sm bg-primary text-background-dark rounded hover:bg-primary-hover">View</button><button v-if="hasPermission('nurses_notes:create')" @click="addNurseNote" class="flex-1 py-2 px-3 text-sm bg-background-dark rounded hover:bg-primary/20">Add</button></div>
        </div>
        <div v-if="hasPermission('vitals:view')" class="p-4 bg-surface-dark rounded-lg">
          <h3 class="font-bold flex items-center gap-2 mb-3"><MdiIcon :path="mdiHeart" size="20" class="text-red-400" /> Vitals</h3>
          <div class="flex gap-2"><button @click="viewVitals" class="flex-1 py-2 px-3 text-sm bg-primary text-background-dark rounded hover:bg-primary-hover">View</button><button v-if="hasPermission('vitals:create')" @click="addVitals" class="flex-1 py-2 px-3 text-sm bg-background-dark rounded hover:bg-primary/20">Add</button></div>
        </div>
        <div v-if="hasPermission('prescriptions:view')" class="p-4 bg-surface-dark rounded-lg">
          <h3 class="font-bold flex items-center gap-2 mb-3"><MdiIcon :path="mdiPill" size="20" class="text-yellow-400" /> Prescriptions</h3>
          <div class="flex gap-2"><button @click="viewPrescriptions" class="flex-1 py-2 px-3 text-sm bg-primary text-background-dark rounded hover:bg-primary-hover">View</button><button v-if="hasPermission('prescriptions:create')" @click="addPrescription" class="flex-1 py-2 px-3 text-sm bg-background-dark rounded hover:bg-primary/20">Add</button></div>
        </div>
        <div v-if="hasPermission('lab_requests:view')" class="p-4 bg-surface-dark rounded-lg">
          <h3 class="font-bold flex items-center gap-2 mb-3"><MdiIcon :path="mdiTestTube" size="20" class="text-cyan-400" /> Laboratory</h3>
          <div class="flex gap-2"><button @click="viewLabResults" class="flex-1 py-2 px-3 text-sm bg-primary text-background-dark rounded hover:bg-primary-hover">View</button><button v-if="hasPermission('lab_requests:create')" @click="requestLabTest" class="flex-1 py-2 px-3 text-sm bg-background-dark rounded hover:bg-primary/20">Request</button></div>
        </div>
        <div v-if="hasPermission('radiology_requests:view')" class="p-4 bg-surface-dark rounded-lg">
          <h3 class="font-bold flex items-center gap-2 mb-3"><MdiIcon :path="mdiRadioboxMarked" size="20" class="text-indigo-400" /> Radiology</h3>
          <div class="flex gap-2"><button @click="viewRadiologyResults" class="flex-1 py-2 px-3 text-sm bg-primary text-background-dark rounded hover:bg-primary-hover">View</button><button v-if="hasPermission('radiology_requests:create')" @click="requestXray" class="flex-1 py-2 px-3 text-sm bg-background-dark rounded hover:bg-primary/20">Request</button></div>
        </div>
        <div v-if="hasPermission('operations:view')" class="p-4 bg-surface-dark rounded-lg">
          <h3 class="font-bold flex items-center gap-2 mb-3"><MdiIcon :path="mdiScalpel" size="20" class="text-pink-400" /> Operations</h3>
          <div class="flex gap-2"><button @click="viewOperations" class="flex-1 py-2 px-3 text-sm bg-primary text-background-dark rounded hover:bg-primary-hover">View</button><button v-if="hasPermission('operations:create')" @click="addOperation" class="flex-1 py-2 px-3 text-sm bg-background-dark rounded hover:bg-primary/20">Add</button></div>
        </div>
        <div v-if="hasPermission('rehabilitation_notes:view')" class="p-4 bg-surface-dark rounded-lg">
          <h3 class="font-bold flex items-center gap-2 mb-3"><MdiIcon :path="mdiHumanHandsup" size="20" class="text-orange-400" /> Rehabilitation</h3>
          <div class="flex gap-2"><button @click="viewRehabNotes" class="flex-1 py-2 px-3 text-sm bg-primary text-background-dark rounded hover:bg-primary-hover">View</button><button v-if="hasPermission('rehabilitation_notes:create')" @click="addRehabNote" class="flex-1 py-2 px-3 text-sm bg-background-dark rounded hover:bg-primary/20">Add</button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
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
  mdiRadioboxMarked,
  mdiScalpel,
  mdiHumanHandsup, // Changed from mdiChairWheel for better representation
  mdiHospitalBuilding,
  mdiFileDocument,
  mdiHistory,
} from '@mdi/js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const patientStore = usePatientStore();

const loading = ref(true);
const error = ref('');
const patient = ref(null);

const patientId = computed(() => route.params.id);

const loadPatient = async () => {
  loading.value = true;
  error.value = '';
  try {
    patient.value = await patientStore.getPatient(patientId.value);
  } catch (err) {
    error.value = err.message || 'Failed to load patient information';
    console.error('Error loading patient:', err);
  } finally {
    loading.value = false;
  }
};

const hasPermission = (permission) => authStore.hasPermission(permission);
const navigateTo = (path) => router.push(path);
const formatDate = (date) => {
  if (!date) return 'N/A';
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Placeholder functions for module actions
const viewDoctorNotes = () => console.log('View doctor notes');
const addDoctorNote = () => console.log('Add doctor note');
const viewNurseNotes = () => console.log('View nurse notes');
const addNurseNote = () => console.log('Add nurse note');
const viewVitals = () => console.log('View vitals');
const addVitals = () => console.log('Add vitals');
const viewPrescriptions = () => console.log('View prescriptions');
const addPrescription = () => console.log('Add prescription');
const viewLabResults = () => console.log('View lab results');
const requestLabTest = () => console.log('Request lab test');
const viewRadiologyResults = () => console.log('View radiology results');
const requestXray = () => console.log('Request X-ray');
const viewOperations = () => console.log('View operations');
const addOperation = () => console.log('Add operation');
const viewRehabNotes = () => console.log('View rehab notes');
const addRehabNote = () => console.log('Add rehab note');
const printProfile = () => window.print();

onMounted(loadPatient);
</script>

<style scoped>
/* All styles are handled by Tailwind CSS utility classes */
</style>
