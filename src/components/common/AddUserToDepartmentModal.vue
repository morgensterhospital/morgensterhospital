<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    <div class="glass-card p-8 rounded-lg shadow-lg w-full max-w-2xl">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-primary flex items-center">
          <MdiIcon :path="mdiAccountPlus" size="28" class="mr-3" />
          Add User to {{ department }}
        </h2>
        <button @click="close" class="text-text-muted hover:text-white text-3xl">&times;</button>
      </div>
      <form @submit.prevent="submitForm" class="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField v-model="user.name" label="First Name" :icon="mdiAccount" required />
          <InputField v-model="user.surname" label="Surname" :icon="mdiAccount" required />
        </div>
        <InputField v-model="user.email" label="Email" type="email" :icon="mdiEmail" required />
        <InputField v-model="user.password" label="Password" type="password" :icon="mdiLock" required />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField v-model="user.idNumber" label="ID Number" :icon="mdiCardAccountDetails" />
          <InputField v-model="user.phoneNumber" label="Phone Number" :icon="mdiPhone" />
        </div>
        <InputField v-model="user.role" label="Role" :icon="mdiAccountTie" required />

        <div class="mt-8 flex justify-end space-x-4">
          <button type="button" @click="close" class="px-6 py-2 text-text-muted rounded-md hover:bg-surface-dark">Cancel</button>
          <button type="submit" class="futuristic-button">
            <MdiIcon :path="mdiAccountCheck" size="20" class="mr-2" />
            Create User
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import MdiIcon from './MdiIcon.vue';
import InputField from './InputField.vue';
import {
  mdiAccountPlus,
  mdiAccount,
  mdiEmail,
  mdiLock,
  mdiCardAccountDetails,
  mdiPhone,
  mdiAccountTie,
  mdiAccountCheck
} from '@mdi/js';

const props = defineProps({
  show: Boolean,
  department: String,
});

const emit = defineEmits(['close', 'create-user']);

const createInitialUser = () => ({
  name: '',
  surname: '',
  email: '',
  password: '',
  idNumber: '',
  phoneNumber: '',
  role: '',
});

const user = ref(createInitialUser());

const close = () => {
  emit('close');
};

const submitForm = () => {
  emit('create-user', { ...user.value, department: props.department });
};

// Reset form when modal is closed or opened
watch(() => props.show, (newVal) => {
  if (!newVal) {
    user.value = createInitialUser();
  }
});
</script>