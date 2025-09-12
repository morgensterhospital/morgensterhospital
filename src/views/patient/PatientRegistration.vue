<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">New Patient Registration</h1>
    <form @submit.prevent="handleSubmit" class="bg-surface-dark p-6 rounded-lg shadow-lg">
      <div class="space-y-8 divide-y divide-gray-700">
        <div>
          <h2 class="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Hospital Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-text-muted">Hospital Number</label>
              <input type="text" :value="form.hospitalNumber" readonly class="mt-1 block w-full bg-background-dark border-gray-600 rounded-md shadow-sm py-2 px-3 text-text-muted" />
            </div>
          </div>
        </div>

        <div class="pt-8">
          <h2 class="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Patient Demographics</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input v-model="form.idNumber" type="text" placeholder="ID Number" required class="w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary" />
            <input v-model="form.name" type="text" placeholder="Name" required class="w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary" />
            <input v-model="form.surname" type="text" placeholder="Surname" required class="w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary" />
            <input v-model="form.phone" type="tel" placeholder="Phone Number" required class="w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary" />
            <input v-model="form.dob" type="date" placeholder="Date of Birth" required @input="calculateAge" class="w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary" />
            <input v-model="form.age" type="text" placeholder="Age" readonly class="w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 text-text-muted" />
            <select v-model="form.gender" required class="w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input v-model="form.countryOfBirth" type="text" placeholder="Country of Birth" required class="w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary" />
            <select v-model="form.maritalStatus" class="w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary">
              <option value="">Select Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
            <textarea v-model="form.address" placeholder="Residential Address" rows="3" required class="md:col-span-3 w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary"></textarea>
          </div>
        </div>

        <div class="pt-8">
          <h2 class="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Next of Kin</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input v-model="form.nokName" type="text" placeholder="N.O.K. Name" required class="w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary" />
            <input v-model="form.nokSurname" type="text" placeholder="N.O.K. Surname" required class="w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary" />
            <input v-model="form.nokPhone" type="tel" placeholder="N.O.K. Phone Number" required class="w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary" />
            <textarea v-model="form.nokAddress" placeholder="N.O.K. Address" rows="3" required class="md:col-span-3 w-full bg-background-dark border-gray-600 rounded-md py-2 px-3 focus:ring-primary focus:border-primary"></textarea>
          </div>
        </div>

        <div class="pt-8 flex justify-end gap-4">
          <button type="button" @click="resetForm" :disabled="loading" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">Reset Form</button>
          <button type="submit" :disabled="loading" class="px-4 py-2 bg-primary text-background-dark font-bold rounded-lg hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2">
            <MdiIcon v-if="loading" :path="mdiLoading" size="20" class="animate-spin" />
            <MdiIcon v-else :path="mdiAccountPlus" size="20" />
            <span>{{ loading ? 'Registering...' : 'Register Patient' }}</span>
          </button>
        </div>
      </div>
    </form>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" @click="closeSuccessModal">
      <div class="bg-surface-dark rounded-lg shadow-xl w-full max-w-md p-6 text-center" @click.stop>
        <MdiIcon :path="mdiCheckCircle" size="64" class="mx-auto text-green-500" />
        <h2 class="text-2xl font-bold mt-4">Patient Registered!</h2>
        <p class="mt-2 text-text-muted">
          <strong>{{ registeredPatient.name }} {{ registeredPatient.surname }}</strong> has been registered with hospital number: <strong>{{ registeredPatient.hospitalNumber }}</strong>
        </p>
        <div class="mt-6 flex gap-4">
          <button @click="closeSuccessModal" class="flex-1 py-2 px-4 bg-gray-700 rounded-lg hover:bg-gray-600">Register Another</button>
          <button @click="viewPatientProfile" class="flex-1 py-2 px-4 bg-primary text-background-dark font-bold rounded-lg hover:bg-primary-hover">View Profile</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePatientStore } from '@/stores/patientStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import { mdiChevronRight, mdiAccountPlus, mdiCheckCircle, mdiLoading } from '@mdi/js';

const router = useRouter();
const patientStore = usePatientStore();

const loading = ref(false);
const showSuccessModal = ref(false);
const registeredPatient = ref({});

const form = reactive({
  hospitalNumber: 'Auto-generated',
  idNumber: '', name: '', surname: '', phone: '', address: '',
  dob: '', age: '', gender: '', countryOfBirth: '', maritalStatus: '',
  nokName: '', nokSurname: '', nokPhone: '', nokAddress: ''
});

const errors = reactive({});

const calculateAge = () => {
  if (form.dob) {
    const today = new Date();
    const birthDate = new Date(form.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    form.age = age.toString();
  }
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const patientData = { ...form };
    delete patientData.hospitalNumber;
    delete patientData.age;
    patientData.dob = new Date(form.dob);
    
    const patientId = await patientStore.registerPatient(patientData);
    registeredPatient.value = {
      id: patientId,
      name: form.name,
      surname: form.surname,
      hospitalNumber: 'MHS' + new Date().getFullYear().toString().slice(-2) + Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    };
    showSuccessModal.value = true;
  } catch (error) {
    console.error('Registration error:', error);
    alert('Failed to register patient. Please try again.');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.keys(form).forEach(key => {
    form[key] = key === 'hospitalNumber' ? 'Auto-generated' : '';
  });
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  resetForm();
};

const viewPatientProfile = () => {
  router.push(`/patient/${registeredPatient.value.id}`);
};

onMounted(() => {
  form.countryOfBirth = 'Lesotho';
});
</script>

<style scoped>
/* All styles are handled by Tailwind CSS utility classes */
</style>