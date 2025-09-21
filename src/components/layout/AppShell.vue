<template>
  <div class="flex h-screen bg-background-dark text-text-light">
    <!-- Sidebar -->
    <aside class="hidden md:flex w-64 flex-shrink-0 bg-surface-dark p-4 flex-col">
      <!-- Logo and App Name -->
      <div class="flex items-center mb-8">
        <MdiIcon :path="mdiHospital" size="32" class="text-primary" />
        <span class="ml-2 text-xl font-bold">Morgenster HMS</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-grow">
        <ul>
          <li v-for="item in filteredNavigationItems" :key="item.name" class="mb-2">
            <router-link
              :to="item.path"
              class="flex items-center p-2 rounded-lg transition-colors"
              :class="{
                'bg-primary text-background-dark font-semibold': $route.path === item.path,
                'hover:bg-primary/20': $route.path !== item.path,
              }"
            >
              <MdiIcon :path="item.icon" size="20" class="mr-3" />
              <span>{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- User Info and Logout -->
      <div class="mt-auto">
        <div class="p-2 rounded-lg hover:bg-primary/20">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-background-dark">
              {{ authStore.user?.displayName?.charAt(0) || 'U' }}
            </div>
            <div class="ml-3">
              <p class="text-sm font-semibold">{{ authStore.user?.displayName || 'User' }}</p>
              <p class="text-xs text-text-muted">{{ authStore.userRole }}</p>
            </div>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full flex items-center p-2 mt-2 rounded-lg transition-colors hover:bg-red-500/20 text-text-muted hover:text-red-400"
        >
          <MdiIcon :path="mdiLogout" size="20" class="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-surface-dark p-4 border-b border-gray-700">
        <h1 class="text-xl font-bold">
          {{ $route.name }}
        </h1>
      </header>

      <!-- Page Content -->
      <div class="flex-1 p-6 overflow-y-auto pb-16 md:pb-6">
        <router-view />
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation :navigation-items="filteredNavigationItems" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import BottomNavigation from './BottomNavigation.vue';
import {
  mdiHospital,
  mdiAccount,
  mdiLogout,
  mdiViewDashboard,
  mdiAccountPlus,
  mdiChartLine,
  mdiAccountGroup,
  mdiPill,
  mdiTestTube,
  mdiRadioboxBlank,
  mdiHeartPulse,
  mdiCog,
  mdiMotherNurse,
} from '@mdi/js';

const router = useRouter();
const authStore = useAuthStore();

// Full list of all possible navigation items
const allNavigationItems = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: mdiViewDashboard,
    path: '/',
    roles: ['Admin', 'Accountant', 'Account Assistant', 'Doctor', 'Nurse', 'Pharmacy', 'Dispensary Assistant'],
  },
  {
    name: 'register',
    label: 'New Patient',
    icon: mdiAccountPlus,
    path: '/patient/register',
    roles: ['Accounts Clerk', 'Doctor', 'Nurse'],
  },
  {
    name: 'accountant-register',
    label: 'New Patient',
    icon: mdiAccountPlus,
    path: '/accountant/patient/register',
    roles: ['Accountant'],
  },
  {
    name: 'prescriptions',
    label: 'Prescriptions',
    icon: mdiPill,
    path: '/prescriptions',
    roles: ['Doctor', 'Nurse', 'Dispensary Assistant'],
  },
  {
    name: 'lab',
    label: 'Lab Requests',
    icon: mdiTestTube,
    path: '/lab-requests',
    roles: ['Doctor', 'Nurse', 'Lab Scientist'],
  },
  {
    name: 'radiology',
    label: 'Radiology',
    icon: mdiRadioboxBlank,
    path: '/radiology',
    roles: ['Doctor', 'Nurse', 'Radiographer'],
  },
  {
    name: 'physiotherapy',
    label: 'Physiotherapy',
    icon: mdiHeartPulse,
    path: '/physiotherapy',
    roles: ['Doctor', 'Nurse', 'Physiotherapist'],
  },
  {
    name: 'maternity',
    label: 'Maternity',
    icon: mdiMotherNurse,
    path: '/maternity',
    roles: ['Doctor', 'Nurse'],
  },
  {
    name: 'users',
    label: 'User Management',
    icon: mdiAccountGroup,
    path: '/user-management',
    roles: ['Admin', 'Accountant', 'Account Assistant'],
  },
  {
    name: 'reports',
    label: 'Reports',
    icon: mdiChartLine,
    path: '/reports',
    roles: ['Admin', 'Accountant', 'Accounts Clerk', 'Account Assistant'],
  },
  {
    name: 'settings',
    label: 'Settings',
    icon: mdiCog,
    path: '/settings',
    roles: ['Admin', 'Accountant', 'Accounts Clerk', 'Account Assistant', 'Doctor', 'Nurse', 'Pharmacy', 'Dispensary Assistant', 'Lab Scientist', 'Radiographer', 'Physiotherapist'],
  },
];

// Filter navigation items based on user role
const filteredNavigationItems = computed(() => {
  const role = authStore.userRole;
  if (!role) {
    return [];
  }
  return allNavigationItems.filter(item => item.roles.includes(role));
});

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<style scoped>
/* No additional styles needed as we are using Tailwind CSS utility classes */
</style>
