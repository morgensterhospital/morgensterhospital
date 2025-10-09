<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-surface-dark rounded-lg shadow-lg p-6 w-full max-w-lg">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-text-light">Add User to {{ department }}</h2>
        <button @click="close" class="text-text-muted hover:text-text-light text-3xl">&times;</button>
      </div>
      <form @submit.prevent="submitForm" class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-text-muted">First Name</label>
            <input v-model="user.name" type="text" id="name" required class="mt-1 block w-full bg-background-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
          </div>
          <div>
            <label for="surname" class="block text-sm font-medium text-text-muted">Surname</label>
            <input v-model="user.surname" type="text" id="surname" required class="mt-1 block w-full bg-background-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
          </div>
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-text-muted">Email</label>
          <input v-model="user.email" type="email" id="email" required class="mt-1 block w-full bg-background-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-text-muted">Password</label>
          <input v-model="user.password" type="password" id="password" required class="mt-1 block w-full bg-background-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
        </div>
        <div>
          <label for="idNumber" class="block text-sm font-medium text-text-muted">ID Number</label>
          <input v-model="user.idNumber" type="text" id="idNumber" class="mt-1 block w-full bg-background-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
        </div>
        <div>
          <label for="phoneNumber" class="block text-sm font-medium text-text-muted">Phone Number</label>
          <input v-model="user.phoneNumber" type="text" id="phoneNumber" class="mt-1 block w-full bg-background-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
        </div>
        <div>
          <label for="role" class="block text-sm font-medium text-text-muted">Role</label>
          <input v-model="user.role" type="text" id="role" required class="mt-1 block w-full bg-background-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
        </div>
        <div class="mt-6 flex justify-end space-x-4">
          <button type="button" @click="close" class="px-4 py-2 text-text-muted rounded-md hover:bg-gray-700">Cancel</button>
          <button type="submit" class="px-6 py-2 bg-primary text-white rounded-md shadow hover:bg-primary-dark transition-colors">Create User</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';

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