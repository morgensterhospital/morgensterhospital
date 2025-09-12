<template>
  <div class="flex items-center justify-center min-h-screen bg-background-dark">
    <div class="w-full max-w-md p-8 space-y-8 bg-surface-dark rounded-2xl shadow-lg">
      <div class="text-center">
        <MdiIcon :path="mdiHospital" size="48" class="mx-auto text-primary" />
        <h1 class="mt-4 text-2xl font-bold text-text-light">Morgenster HMS</h1>
        <p class="mt-2 text-sm text-text-muted">Welcome back! Please log in to your account.</p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="role" class="block text-sm font-medium text-text-muted">Role</label>
          <select
            id="role"
            v-model="selectedRole"
            required
            class="mt-1 block w-full px-3 py-2 bg-background-dark border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            <option value="Accounts Clerk">Accounts Clerk</option>
            <option value="Account Assistant">Account Assistant</option>
            <option value="Accountant">Accountant</option>
            <option value="Nurse">Nurse</option>
            <option value="Doctor">Doctor</option>
            <option value="Pharmacy Technician">Pharmacist</option>
            <option value="Dispensary Assistant">Dispensary Assistant</option>
            <option value="Laboratory Technician">Lab Scientist</option>
            <option value="Radiologist">X-Ray Operator</option>
            <option value="Rehabilitation Technician">Rehabilitation Technician</option>
          </select>
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-text-muted">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 block w-full px-3 py-2 bg-background-dark border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-text-muted">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="mt-1 block w-full px-3 py-2 bg-background-dark border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div v-if="error" class="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">
          {{ error }}
        </div>
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-background-dark bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {{ loading ? 'Logging in...' : 'Log In' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import { mdiHospital } from '@mdi/js';

const router = useRouter();
const authStore = useAuthStore();

const selectedRole = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  if (!selectedRole.value || !email.value || !password.value) {
    error.value = 'All fields are required.';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const { claims } = await authStore.login(email.value, password.value);

    if (claims.role !== selectedRole.value) {
      error.value = 'You do not have permission to access this role.';
      await authStore.logout(); // Log out the user if the role doesn't match
    } else {
      router.push('/');
    }
  } catch (err) {
    error.value = err.message || 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Using Tailwind CSS utility classes, so no additional styles are needed here. */
</style>