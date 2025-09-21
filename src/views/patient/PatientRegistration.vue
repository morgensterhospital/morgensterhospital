<template>
  <div class="patient-registration">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">Home</router-link>
          <mdi-icon :path="mdiChevronRight" size="16" />
          <span class="breadcrumb-current">Patient Registration</span>
        </div>
        <h1 class="page-title">NEW PATIENT REGISTRATION</h1>
      </div>
    </div>

    <!-- Registration Form -->
    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="registration-form">
        <!-- Hospital Number (Auto-generated) -->
        <div class="form-section">
          <h2 class="section-title">Hospital Information</h2>
          <div class="form-grid">
            <m3-text-field
              v-model="form.hospitalNumber"
              label="Hospital Number"
              variant="outlined"
              readonly
              helper-text="Auto-generated upon registration"
            />
          </div>
        </div>

        <!-- Patient Demographics -->
        <div class="form-section">
          <h2 class="section-title">Patient Demographics</h2>
          <div class="form-grid">
            <m3-text-field
              v-model="form.idNumber"
              label="ID Number"
              variant="outlined"
              required
              :error="errors.idNumber"
            />

            <m3-text-field
              v-model="form.name"
              label="Name"
              variant="outlined"
              required
              :error="errors.name"
            />

            <m3-text-field
              v-model="form.surname"
              label="Surname"
              variant="outlined"
              required
              :error="errors.surname"
            />

            <m3-text-field
              v-model="form.phone"
              label="Phone Number"
              variant="outlined"
              type="tel"
              required
              :error="errors.phone"
            />
          </div>
        </div>

        <!-- Address & Personal Info -->
        <div class="form-section">
          <h2 class="section-title">Address & Personal Information</h2>
          <div class="form-grid">
            <div class="form-group full-width">
              <m3-text-field
                v-model="form.address"
                label="Residential Address"
                variant="outlined"
                type="textarea"
                :rows="3"
                required
                :error="errors.address"
              />
            </div>

            <m3-text-field
              v-model="form.dob"
              label="Date of Birth"
              variant="outlined"
              type="date"
              required
              :error="errors.dob"
              @input="calculateAge"
            />

            <m3-text-field
              v-model="form.age"
              label="Age"
              variant="outlined"
              readonly
              helper-text="Calculated from date of birth"
            />

            <div class="form-group">
              <label class="form-label">Gender *</label>
              <select
                v-model="form.gender"
                class="form-select"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <span v-if="errors.gender" class="error-text">{{ errors.gender }}</span>
            </div>

            <m3-text-field
              v-model="form.countryOfBirth"
              label="Country of Birth"
              variant="outlined"
              required
              :error="errors.countryOfBirth"
            />

            <div class="form-group">
              <label class="form-label">Marital Status</label>
              <select
                v-model="form.maritalStatus"
                class="form-select"
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Next of Kin Information -->
        <div class="form-section">
          <h2 class="section-title">Next of Kin Information</h2>
          <div class="form-grid">
            <m3-text-field
              v-model="form.nokName"
              label="N.O.K Name"
              variant="outlined"
              required
              :error="errors.nokName"
            />

            <m3-text-field
              v-model="form.nokSurname"
              label="N.O.K Surname"
              variant="outlined"
              required
              :error="errors.nokSurname"
            />

            <m3-text-field
              v-model="form.nokPhone"
              label="N.O.K Phone Number"
              variant="outlined"
              type="tel"
              required
              :error="errors.nokPhone"
            />

            <div class="form-group full-width">
              <m3-text-field
                v-model="form.nokAddress"
                label="N.O.K Address"
                variant="outlined"
                type="textarea"
                :rows="3"
                required
                :error="errors.nokAddress"
              />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <m3-button
            variant="outlined"
            @click="resetForm"
            :disabled="loading"
          >
            Reset Form
          </m3-button>

          <m3-button
            type="submit"
            variant="filled"
            :disabled="loading"
            :icon="loading ? mdiLoading : mdiAccountPlus"
          >
            <span v-if="loading">Registering...</span>
            <span v-else>Register Patient</span>
          </m3-button>
        </div>
      </form>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="success-modal" @click.stop>
        <div class="success-icon">
          <mdi-icon :path="mdiCheckCircle" size="64" color="#16A34A" />
        </div>
        <h2>Patient Registered Successfully!</h2>
        <p>
          <strong>{{ registeredPatient.name }} {{ registeredPatient.surname }}</strong>
          has been registered with hospital number:
          <strong>{{ registeredPatient.hospitalNumber }}</strong>
        </p>
        <div class="modal-actions">
          <m3-button variant="outlined" @click="closeSuccessModal">
            Register Another
          </m3-button>
          <m3-button variant="filled" @click="viewPatientProfile">
            View Profile
          </m3-button>
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
import M3Button from '@/components/common/M3Button.vue'
import M3TextField from '@/components/common/M3TextField.vue'
import {
  mdiChevronRight,
  mdiAccountPlus,
  mdiCheckCircle,
  mdiLoading
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
