
<template>
  <div class="flex items-center justify-center min-h-screen bg-slate-900 text-text-light font-sans overflow-hidden p-4">
    <!-- Background Effects -->
    <div class="absolute inset-0 bg-tech-pattern opacity-20"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl opacity-50"></div>

    <!-- Login Form Transition -->
    <transition name="fade-scale" appear>
      <!-- Animated Gradient Border Wrapper -->
      <div class="w-full max-w-md p-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animated-gradient relative z-10">
        <!-- Main Form Container -->
        <div class="w-full p-8 space-y-8 bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-lg">
          <div class="text-center">
            <MdiIcon :path="mdiSecurity" size="48" class="text-primary mx-auto icon-glow" />
            <h1 class="mt-4 text-3xl font-bold tracking-tight text-glow">Morgenster HMS</h1>
            <p class="mt-2 text-text-muted">Secure Access Portal. Authentication required.</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label for="email" class="text-sm font-medium text-text-muted">Operator ID (Email)</label>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="mt-1 block w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-primary focus:border-primary focus:outline-none transition-all duration-300 placeholder-slate-500"
                placeholder="operator@morgenster.sys"
              />
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label for="password" class="text-sm font-medium text-text-muted">Password</label>
                <a href="#" class="text-sm text-primary hover:underline">Auth Failure?</a>
              </div>
              <input
                id="password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                required
                class="mt-1 block w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-primary focus:border-primary focus:outline-none transition-all duration-300 placeholder-slate-500"
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
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-primary-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
              >
                <span v-if="loading">Authenticating...</span>
                <span v-else>Authorize Access</span>
              </button>
            </div>
          </form>

          <p class="text-center text-xs text-text-muted tracking-wider">
            &copy; 2025 Alfa Systems. All Rights Reserved.
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
// Using a more "tech" icon like mdiSecurity can enhance the futuristic theme
import { mdiSecurity } from '@mdi/js';

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
/* A more complex, tech-like background pattern */
.bg-tech-pattern {
  background-image:
    linear-gradient(rgba(148, 0, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 0, 255, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(148, 0, 255, 0.03) .5px, transparent .5px),
    linear-gradient(90deg, rgba(148, 0, 255, 0.03) .5px, transparent .5px);
  background-size: 75px 75px, 75px 75px, 15px 15px, 15px 15px;
}

.bg-primary-gradient {
  background-image: linear-gradient(to right, #4f46e5, #c026d3);
}

.text-glow {
  text-shadow: 0 0 8px rgba(192, 38, 211, 0.5), 0 0 20px rgba(79, 70, 229, 0.5);
}

.icon-glow {
 filter: drop-shadow(0 0 8px rgba(79, 70, 229, 0.8));
}

/* Animated Gradient for the border */
.animated-gradient {
  background-size: 200% 200%;
  animation: gradient-animation 4s ease infinite;
}

@keyframes gradient-animation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}


/* Form Element Focus Animation */
input:focus {
  box-shadow: 0 0 15px rgba(79, 70, 229, 0.5);
  border-color: rgba(99, 102, 241, 0.8);
}


/* Component Enter/Leave Animations */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}
</style>
