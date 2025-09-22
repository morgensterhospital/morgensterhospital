<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-surface-dark rounded-lg shadow-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-text-light">Add User to {{ department }}</h2>
        <button @click="close" class="text-text-muted hover:text-text-light">&times;</button>
      </div>
      <form @submit.prevent="submitForm">
        <div class="space-y-4">
          <div>
            <label for="fullName" class="block text-sm font-medium text-text-muted">Full Name</label>
            <input v-model="user.fullName" type="text" id="fullName" required class="mt-1 block w-full bg-background-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-text-muted">Email</label>
            <input v-model="user.email" type="email" id="email" required class="mt-1 block w-full bg-background-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-text-muted">Password</label>
            <input v-model="user.password" type="password" id="password" required class="mt-1 block w-full bg-background-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button type="button" @click="close" class="px-4 py-2 text-text-muted rounded-md mr-2">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Create User</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: Boolean,
  department: String,
});

const emit = defineEmits(['close', 'create-user']);

const user = ref({
  fullName: '',
  email: '',
  password: '',
});

const close = () => {
  emit('close');
};

const submitForm = () => {
  emit('create-user', { ...user.value, department: props.department });
  // Reset form
  user.value.fullName = '';
  user.value.email = '';
  user.value.password = '';
};
</script>
