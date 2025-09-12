<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-text-light">New Patient Registration</h1>
    <div class="p-8 bg-surface-dark rounded-lg">
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Patient Demographics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <M3TextField v-model="form.name" label="Name" required />
          <M3TextField v-model="form.surname" label="Surname" required />
          <M3TextField v-model="form.idNumber" label="ID Number" required />
          <M3TextField v-model="form.phone" label="Phone Number" type="tel" required />
          <M3TextField v-model="form.dob" label="Date of Birth" type="date" required @input="calculateAge" />
          <M3TextField v-model="form.age" label="Age" readonly />
        </div>

        <!-- Address and Personal Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="md:col-span-2">
            <M3TextField v-model="form.address" label="Residential Address" type="textarea" :rows="3" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-2">Gender *</label>
            <select v-model="form.gender" class="w-full p-3 bg-background-dark border border-gray-600 rounded-lg" required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <M3TextField v-model="form.countryOfBirth" label="Country of Birth" required />
          <div>
            <label class="block text-sm font-medium text-text-muted mb-2">Marital Status</label>
            <select v-model="form.maritalStatus" class="w-full p-3 bg-background-dark border border-gray-600 rounded-lg">
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
        </div>

        <!-- Next of Kin Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <M3TextField v-model="form.nokName" label="N.O.K Name" required />
            <M3TextField v-model="form.nokSurname" label="N.O.K Surname" required />
            <M3TextField v-model="form.nokPhone" label="N.O.K Phone Number" type="tel" required />
            <div class="md:col-span-2">
                <M3TextField v-model="form.nokAddress" label="N.O.K Address" type="textarea" :rows="3" required />
            </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4">
            <M3Button variant="outlined" @click="resetForm" :disabled="loading">Reset</M3Button>
            <M3Button type="submit" variant="filled" :disabled="loading">
                <span v-if="loading">Registering...</span>
                <span v-else>Register Patient</span>
            </M3Button>
        </div>
      </form>
    </div>
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="success-modal" @click.stop>
        <div class="success-icon">
          <MdiIcon :path="mdiCheckCircle" size="64" color="#16A34A" />
        </div>
        <h2>Patient Registered Successfully!</h2>
        <p>
          <strong>{{ registeredPatient.name }} {{ registeredPatient.surname }}</strong>
          has been registered with hospital number:
          <strong>{{ registeredPatient.hospitalNumber }}</strong>
        </p>
        <div class="modal-actions">
          <M3Button variant="outlined" @click="closeSuccessModal">
            Register Another
          </M3Button>
          <M3Button variant="filled" @click="viewPatientProfile">
            View Profile
          </M3Button>
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

    // Prepare patient data
    const patientData = {
      idNumber: form.idNumber.trim(),
      name: form.name.trim(),
      surname: form.surname.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      dob: new Date(form.dob),
      gender: form.gender,
      countryOfBirth: form.countryOfBirth.trim(),
      maritalStatus: form.maritalStatus,
      nokName: form.nokName.trim(),
      nokSurname: form.nokSurname.trim(),
      nokPhone: form.nokPhone.trim(),
      nokAddress: form.nokAddress.trim()
    }

    // Register patient
    const newPatient = await patientStore.registerPatient(patientData)

    // Store registered patient info
    registeredPatient.value = newPatient;

    showSuccessModal.value = true

  } catch (error) {
    console.error('Registration error:', error)
    alert('Failed to register patient. Please try again.')
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
}

.success-modal {
  background: #2d3748;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  text-align: center;
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
  color: #a0aec0;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
