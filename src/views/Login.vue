Reimagined: A Futuristic and Animated Login Experience

<template>
  <div class="flex items-center justify-center min-h-screen bg-background-dark text-text-light font-sans overflow-hidden">
    <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
    <transition name="fade-scale" appear>
      <div class="w-full max-w-md p-8 space-y-8 bg-surface-dark/80 backdrop-blur-xl rounded-2xl shadow-lg border border-primary/20 relative z-10">
        <div class="text-center">
          <MdiIcon :path="mdiHospital" size="48" class="text-primary mx-auto" />
          <h1 class="mt-4 text-3xl font-bold tracking-tight text-glow">Morgenster HMS</h1>
          <p class="mt-2 text-text-muted">Welcome back! Please sign in to your account.</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="text-sm font-medium text-text-muted">Email address</label>
            <div class="relative">
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="mt-1 block w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary focus:outline-none transition-all duration-300"
                placeholder="you@example.com"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="text-sm font-medium text-text-muted">Password</label>
              <a href="#" class="text-sm text-primary hover:underline">Forgot password?</a>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                required
                class="mt-1 block w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg focus:ring-primary focus:border-primary focus:outline-none transition-all duration-300"
                placeholder="••••••••"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div v-if="error" class="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
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
    </transition>
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
    password.value = '';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.bg-grid-pattern {
  background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 2rem 2rem;
}

.bg-primary-gradient {
  background-image: linear-gradient(to right, #4f46e5, #c026d3);
}

.text-glow {
  text-shadow: 0 0 8px rgba(79, 70, 229, 0.5);
}

/* Animations */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

input:focus {
  box-shadow: 0 0 15px rgba(79, 70, 229, 0.5);
}
</style>
