<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-text-light">New Patient Registration</h1>
      <M3Button variant="outlined" @click="resetForm" :disabled="loading">
        <MdiIcon :path="mdiBroom" class="mr-2" />
        Clear Form
      </M3Button>
    </div>
    <div class="p-8 bg-surface-dark rounded-lg shadow-lg">
      <form @submit.prevent="handleSubmit" class="space-y-12">
        <!-- Patient Information Section -->
        <div>
          <h2 class="text-xl font-semibold text-primary mb-6 border-b-2 border-primary/20 pb-3">Patient Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <M3TextField v-model="form.name" label="First Name" required />
            <M3TextField v-model="form.surname" label="Last Name" required />
            <M3TextField v-model="form.idNumber" label="ID Number" required />
            <M3TextField v-model="form.phone" label="Phone Number" type="tel" required />
            <M3TextField v-model="form.dob" label="Date of Birth" type="date" required @input="calculateAge" />
            <M3TextField v-model="form.age" label="Age" readonly helper-text="Calculated automatically" />
            <div>
              <label class="block text-sm font-medium text-text-muted mb-2">Gender *</label>
              <select v-model="form.gender" class="w-full p-4 bg-background-dark border border-gray-600 rounded-lg" required>
                <option disabled value="">Please select one</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text-muted mb-2">Marital Status</label>
              <select v-model="form.maritalStatus" class="w-full p-4 bg-background-dark border border-gray-600 rounded-lg">
                <option disabled value="">Please select one</option>
                <option>Single</option>
                <option>Married</option>
                <option>Divorced</option>
                <option>Widowed</option>
              </select>
            </div>
            <M3TextField v-model="form.countryOfBirth" label="Country of Birth" required />
            <div class="md:col-span-2">
              <M3TextField v-model="form.address" label="Residential Address" type="textarea" :rows="3" required />
            </div>
          </div>
        </div>

        <!-- Next of Kin Information Section -->
        <div>
          <h2 class="text-xl font-semibold text-primary mb-6 border-b-2 border-primary/20 pb-3">Next of Kin</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <M3TextField v-model="form.nokName" label="First Name" required />
            <M3TextField v-model="form.nokSurname" label="Last Name" required />
            <M3TextField v-model="form.nokPhone" label="Phone Number" type="tel" required />
            <div class="md:col-span-2">
              <M3TextField v-model="form.nokAddress" label="Residential Address" type="textarea" :rows="3" required />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end pt-8 border-t border-gray-700">
          <M3Button type="submit" variant="filled" size="large" :disabled="loading">
            <span v-if="loading">
              <MdiIcon :path="mdiLoading" class="animate-spin mr-2" />
              Registering...
            </span>
            <span v-else>
              <MdiIcon :path="mdiAccountPlus" class="mr-2" />
              Register Patient
            </span>
          </M3Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { usePatientStore } from '@/stores/patientStore'
import { useNotificationStore } from '@/stores/notificationStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import M3Button from '@/components/common/M3Button.vue'
import M3TextField from '@/components/common/M3TextField.vue'
import { mdiLoading, mdiAccountPlus, mdiBroom } from '@mdi/js'

const patientStore = usePatientStore()
const notificationStore = useNotificationStore()

const loading = ref(false)

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

  if (form.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(form.phone)) {
    errors.phone = 'Please enter a valid phone number'
    isValid = false
  }

  if (form.nokPhone && !/^\+?[\d\s\-\(\)]{10,}$/.test(form.nokPhone)) {
    errors.nokPhone = 'Please enter a valid phone number'
    isValid = false
  }

  const age = parseInt(form.age)
  if (age < 0 || age > 150) {
    errors.dob = 'Please enter a valid date of birth'
    isValid = false
  }

  return isValid
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

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    notificationStore.showNotification('Please fill in all required fields correctly.', 'error');
    return
  }

  try {
    loading.value = true

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

    const newPatient = await patientStore.registerPatient(patientData)

    notificationStore.showNotification(`Patient ${newPatient.name} ${newPatient.surname} registered successfully!`, 'success');
    resetForm();

  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error.response?.data?.error || error.message || 'An unknown error occurred.';
    notificationStore.showNotification(`Error: ${errorMessage}`, 'error');
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  form.countryOfBirth = 'Lesotho'
})
</script>

<style scoped>
/* Scoped styles can be kept if there are specific styles for this component, otherwise can be removed. */
</style>
