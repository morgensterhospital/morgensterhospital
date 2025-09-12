<template>
  <div class="flex items-center justify-center min-h-screen bg-background-dark text-text-light font-sans">
    <div class="w-full max-w-md p-8 space-y-8 bg-surface-dark rounded-2xl shadow-lg">
      <div class="text-center">
        <MdiIcon :path="mdiHospital" size="48" class="text-primary mx-auto" />
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Morgenster HMS</h1>
        <p class="mt-2 text-text-muted">Welcome back! Please sign in to your account.</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="text-sm font-medium text-text-muted">Email address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 block w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="text-sm font-medium text-text-muted">Password</label>
            <a href="#" class="text-sm text-primary hover:underline">Forgot password?</a>
          </div>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="mt-1 block w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-background-dark bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>

      <p class="text-center text-xs text-text-muted tracking-wider">
        &copy; 2025 Alfa Systems. All Rights Reserved.
      </p>
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

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  if (loading.value) return;
  loading.value = true;
  error.value = '';

  try {
    await authStore.login(email.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.message || 'Login failed. Please check your credentials.';
    // Clear password field on error
    password.value = '';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Using Tailwind CSS utility classes, so no additional scoped styles are needed. */
</style>