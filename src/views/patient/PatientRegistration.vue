<template>
  <div class="p-6 bg-background-dark min-h-screen">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-4xl font-bold text-text-light tracking-wider">New Patient Registration</h1>
      <div class="flex items-center text-sm text-text-muted">
        <router-link to="/" class="hover:text-primary">Home</router-link>
        <MdiIcon :path="mdiChevronRight" size="16" class="mx-2" />
        <span>Patient Registration</span>
      </div>
    </div>

    <!-- Registration Form -->
    <form @submit.prevent="handleSubmit" class="glass-card p-8 space-y-8">

      <FormSection title="Hospital Information" :icon="mdiHospitalBuilding">
        <InputField v-model="form.hospitalNumber" label="Hospital Number" :icon="mdiPound" readonly placeholder="Auto-generated upon registration" />
      </FormSection>

      <FormSection title="Patient Demographics" :icon="mdiAccountBox">
        <div class="grid md:grid-cols-2 gap-6">
          <InputField v-model="form.idNumber" label="ID Number" :icon="mdiCardAccountDetails" required :error="errors.idNumber" />
          <InputField v-model="form.name" label="Name" :icon="mdiAccount" required :error="errors.name" />
          <InputField v-model="form.surname" label="Surname" :icon="mdiAccount" required :error="errors.surname" />
          <InputField v-model="form.phone" label="Phone Number" type="tel" :icon="mdiPhone" required :error="errors.phone" />
        </div>
      </FormSection>

      <FormSection title="Address & Personal Information" :icon="mdiHomeAccount">
        <InputField v-model="form.address" label="Residential Address" type="textarea" :icon="mdiMapMarker" required :error="errors.address" />
        <div class="grid md:grid-cols-3 gap-6 mt-6">
          <InputField v-model="form.dob" label="Date of Birth" type="date" :icon="mdiCalendar" required :error="errors.dob" @input="calculateAge" />
          <InputField v-model="form.age" label="Age" readonly :icon="mdiNumeric" placeholder="Calculated from DOB" />
          <SelectField v-model="form.gender" label="Gender" :icon="mdiGenderMaleFemale" :options="['Male', 'Female', 'Other']" required :error="errors.gender" />
        </div>
        <div class="grid md:grid-cols-2 gap-6 mt-6">
          <InputField v-model="form.countryOfBirth" label="Country of Birth" :icon="mdiEarth" required :error="errors.countryOfBirth" />
          <SelectField v-model="form.maritalStatus" label="Marital Status" :icon="mdiRing" :options="['Single', 'Married', 'Divorced', 'Widowed']" />
        </div>
      </FormSection>

      <FormSection title="Next of Kin Information" :icon="mdiAccountMultiple">
        <div class="grid md:grid-cols-2 gap-6">
          <InputField v-model="form.nokName" label="N.O.K Name" :icon="mdiAccount" required :error="errors.nokName" />
          <InputField v-model="form.nokSurname" label="N.O.K Surname" :icon="mdiAccount" required :error="errors.nokSurname" />
        </div>
        <div class="grid md:grid-cols-2 gap-6 mt-6">
          <InputField v-model="form.nokPhone" label="N.O.K Phone Number" type="tel" :icon="mdiPhone" required :error="errors.nokPhone" />
          <InputField v-model="form.nokAddress" label="N.O.K Address" type="textarea" :icon="mdiMapMarker" required :error="errors.nokAddress" />
        </div>
      </FormSection>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-4 pt-6 border-t border-border-futuristic">
        <button type="button" @click="resetForm" :disabled="loading" class="px-6 py-2 text-text-muted rounded-md hover:bg-surface-dark">
          Reset
        </button>
        <button type="submit" :disabled="loading" class="futuristic-button">
          <MdiIcon v-if="!loading" :path="mdiAccountPlus" size="20" class="mr-2" />
          <MdiIcon v-if="loading" :path="mdiLoading" size="20" class="mr-2 animate-spin" />
          {{ loading ? 'Registering...' : 'Register Patient' }}
        </button>
      </div>
    </form>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div class="glass-card p-8 rounded-lg text-center max-w-lg w-full">
        <div class="mx-auto bg-green-500/20 text-green-400 rounded-full h-20 w-20 flex items-center justify-center mb-6">
          <MdiIcon :path="mdiCheckCircle" size="48" />
        </div>
        <h2 class="text-3xl font-bold text-green-400 mb-4">Success!</h2>
        <p class="text-text-light text-lg">
          <strong>{{ registeredPatient.name }} {{ registeredPatient.surname }}</strong>
          has been registered.
        </p>
        <p class="text-text-muted mt-2">
          Hospital Number: <strong>{{ registeredPatient.hospitalNumber }}</strong>
        </p>
        <div class="mt-8 flex justify-center space-x-4">
          <button @click="closeSuccessModal" class="px-6 py-2 text-text-muted rounded-md hover:bg-surface-dark">
            Register Another
          </button>
          <button @click="viewPatientProfile" class="futuristic-button">
            View Profile
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patientStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import InputField from '@/components/common/InputField.vue'
import SelectField from '@/components/common/SelectField.vue'
import FormSection from '@/components/common/FormSection.vue'
import {
  mdiChevronRight,
  mdiAccountPlus,
  mdiCheckCircle,
  mdiLoading,
  mdiHospitalBuilding,
  mdiPound,
  mdiAccountBox,
  mdiCardAccountDetails,
  mdiAccount,
  mdiPhone,
  mdiHomeAccount,
  mdiMapMarker,
  mdiCalendar,
  mdiNumeric,
  mdiGenderMaleFemale,
  mdiEarth,
  mdiRing,
  mdiAccountMultiple
} from '@mdi/js'

const router = useRouter()
const patientStore = usePatientStore()

const loading = ref(false)
const showSuccessModal = ref(false)
const registeredPatient = ref({})

// Form data
const form = reactive({
  hospitalNumber: 'Auto-generated',
  idNumber: '',
  name: '',
  surname: '',
  phone: '',
  address: '',
  dob: '',
  age: '',
  gender: '',
  countryOfBirth: '',
  maritalStatus: '',
  nokName: '',
  nokSurname: '',
  nokPhone: '',
  nokAddress: ''
})

// Form errors
const errors = reactive({})

// Calculate age from date of birth
const calculateAge = () => {
  if (form.dob) {
    const today = new Date()
    const birthDate = new Date(form.dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    form.age = age.toString()
  }
}

// Validate form
const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key])

  let isValid = true

  // Required field validation
  const requiredFields = [
    'idNumber', 'name', 'surname', 'phone', 'address',
    'dob', 'gender', 'countryOfBirth', 'nokName',
    'nokSurname', 'nokPhone', 'nokAddress'
  ]

  requiredFields.forEach(field => {
    if (!form[field] || form[field].trim() === '') {
      errors[field] = 'This field is required'
      isValid = false
    }
  })

  // Phone validation
  if (form.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(form.phone)) {
    errors.phone = 'Please enter a valid phone number'
    isValid = false
  }

  if (form.nokPhone && !/^\+?[\d\s\-\(\)]{10,}$/.test(form.nokPhone)) {
    errors.nokPhone = 'Please enter a valid phone number'
    isValid = false
  }

  // Age validation
  const age = parseInt(form.age)
  if (age < 0 || age > 150) {
    errors.dob = 'Please enter a valid date of birth'
    isValid = false
  }

  return isValid
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    
    // UPDATED: Prepare patient data with proper date format and no registeredBy
    const patientData = {
      idNumber: form.idNumber.trim(),
      name: form.name.trim(),
      surname: form.surname.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      dob: form.dob, // Send as string, not Date object
      gender: form.gender,
      countryOfBirth: form.countryOfBirth.trim(),
      maritalStatus: form.maritalStatus,
      nokName: form.nokName.trim(),
      nokSurname: form.nokSurname.trim(),
      nokPhone: form.nokPhone.trim(),
      nokAddress: form.nokAddress.trim()
    }

    // UPDATED: Register patient without registeredBy parameter
    const result = await patientStore.registerPatient(patientData)

    // Store registered patient info from the API response
    registeredPatient.value = {
      id: result.patient.id,
      name: result.patient.name,
      surname: result.patient.surname,
      hospitalNumber: result.patient.hospitalNumber
    }

    showSuccessModal.value = true

  } catch (error) {
    console.error('Registration error:', error)
    // Show more specific error message if available
    const errorMessage = error.message || 'Failed to register patient. Please try again.'
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

// Reset form
const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (key === 'hospitalNumber') {
      form[key] = 'Auto-generated'
    } else {
      form[key] = ''
    }
  })
  Object.keys(errors).forEach(key => delete errors[key])
}

// Close success modal and reset form
const closeSuccessModal = () => {
  showSuccessModal.value = false
  resetForm()
}

// Navigate to patient profile
const viewPatientProfile = () => {
  router.push(`/patient/${registeredPatient.value.id}`)
}

onMounted(() => {
  // Set default country
  form.countryOfBirth = 'Lesotho'
})
</script>

<style scoped>
.patient-registration {
  min-height: 100vh;
  background: #F7F9FC;
}

.page-header {
  background: white;
  padding: 24px 32px;
  border-bottom: 1px solid #E5E7EB;
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

.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
}

.registration-form {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #E5E7EB;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-select {
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: white;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #0066B2;
  box-shadow: 0 0 0 3px rgba(0, 102, 178, 0.1);
}

.error-text {
  font-size: 12px;
  color: #DC2626;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

/* Success Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.success-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.success-icon {
  margin-bottom: 20px;
}

.success-modal h2 {
  font-size: 24px;
  font-weight: 700;
  color: #16A34A;
  margin: 0 0 16px 0;
}

.success-modal p {
  color: #6B7280;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-container {
    padding: 16px;
  }

  .registration-form {
    padding: 24px 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }

  .page-header {
    padding: 16px 20px;
  }

  .page-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .success-modal {
    margin: 10px;
    padding: 24px 20px;
  }

  .page-title {
    font-size: 20px;
  }
}
</style>
