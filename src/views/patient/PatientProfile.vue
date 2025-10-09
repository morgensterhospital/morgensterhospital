<template>
  <div class="min-h-screen bg-gray-100 dark:bg-background transition-colors duration-500">
    <!-- Page Header -->
    <div class="bg-white dark:bg-card/20 backdrop-blur-sm p-6 md:p-8 border-b border-gray-200 dark:border-accent/20 flex justify-between items-center shadow-md sticky top-0 z-10">
      <div>
        <div class="flex items-center gap-2 mb-1 text-sm text-gray-500 dark:text-text-main/60">
          <router-link to="/" class="hover:text-accent">Home</router-link>
          <mdi-icon :path="mdiChevronRight" size="16" />
          <span class="font-semibold text-gray-700 dark:text-text-main">Patient Profile</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-accent">PATIENT PROFILE</h1>
      </div>
      <div class="flex items-center gap-4">
        <m3-button variant="outlined" @click="printProfile" class="dark:text-accent dark:border-accent/50 hover:dark:bg-accent/10">
          <mdi-icon :path="mdiPrinter" size="20" />
          <span class="hidden md:inline ml-2">Print Profile</span>
        </m3-button>
        <!-- Dark Mode Toggle -->
        <button @click="toggleDarkMode" class="p-2 rounded-full text-gray-500 dark:text-accent hover:bg-gray-200 dark:hover:bg-accent/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-offset-background">
          <mdi-icon :path="isDarkMode ? mdiWhiteBalanceSunny : mdiMoonWaningCrescent" size="24" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div class="w-12 h-12 border-4 border-t-accent rounded-full animate-spin mb-4"></div>
      <p class="text-lg font-semibold text-gray-700 dark:text-text-main">Loading patient information...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
      <mdi-icon :path="mdiAlertCircle" size="48" class="text-red-500" />
      <h2 class="text-2xl font-bold text-red-600 dark:text-red-400 mt-4 mb-2">Error Loading Patient</h2>
      <p class="text-gray-600 dark:text-text-main/80">{{ error }}</p>
      <m3-button variant="filled" @click="loadPatient" class="mt-6 bg-accent text-black">
        Try Again
      </m3-button>
    </div>

    <PatientProfileDetails v-else-if="patient" :patient="patient" @open-notes-modal="openNotesModal" />
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
import { useRoute } from 'vue-router'
import { usePatientStore } from '@/stores/patientStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import M3Button from '@/components/common/M3Button.vue'
import NotesListModal from '@/components/common/NotesListModal.vue'
import PatientProfileDetails from '@/components/patient/PatientProfileDetails.vue'
import {
  mdiChevronRight, mdiPrinter, mdiAlertCircle, mdiMoonWaningCrescent, mdiWhiteBalanceSunny
} from '@mdi/js'

const route = useRoute()
const patientStore = usePatientStore()

const loading = ref(true)
const error = ref('')
const patient = ref(null)
const isNotesListModalVisible = ref(false)
const noteTypeForModal = ref('');
const patientId = computed(() => route.params.id)
const isDarkMode = ref(false)

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

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

const openNotesModal = (noteType) => {
  noteTypeForModal.value = noteType;
  isNotesListModalVisible.value = true;
}

const closeNotesModal = () => {
  isNotesListModalVisible.value = false;
  noteTypeForModal.value = '';
}

const printProfile = () => window.print()

onMounted(() => {
  // Check for saved theme preference
  if (localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDarkMode.value = false
    document.documentElement.classList.remove('dark')
  }

  loadPatient()
})
</script>