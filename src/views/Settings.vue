<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">System Settings</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- User Profile -->
        <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-3"><MdiIcon :path="mdiAccount" size="24" /> User Profile</h2>
          <div class="flex items-center gap-6">
            <div class="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <MdiIcon :path="mdiAccount" size="40" class="text-primary" />
            </div>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <strong class="text-text-muted">Full Name:</strong> <span>{{ authStore.user?.displayName || 'User' }}</span>
              <strong class="text-text-muted">Email:</strong> <span>{{ authStore.user?.email }}</span>
              <strong class="text-text-muted">Role:</strong> <span>{{ authStore.userRole }}</span>
              <strong class="text-text-muted">Department:</strong> <span>{{ authStore.userDepartment }}</span>
            </div>
          </div>
        </div>

        <!-- Security -->
        <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-3"><MdiIcon :path="mdiSecurity" size="24" /> Security</h2>
          <div class="flex gap-4">
            <button @click="changePassword" class="px-4 py-2 bg-background-dark rounded-lg flex items-center gap-2 hover:bg-primary/20"><MdiIcon :path="mdiLock" size="20" /> Change Password</button>
            <button @click="viewLoginHistory" class="px-4 py-2 bg-background-dark rounded-lg flex items-center gap-2 hover:bg-primary/20"><MdiIcon :path="mdiHistory" size="20" /> Login History</button>
          </div>
        </div>

        <!-- Admin Sections -->
        <template v-if="authStore.isAdmin">
          <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-3"><MdiIcon :path="mdiAccountGroup" size="24" /> User Management</h2>
            <div class="flex gap-4">
              <button @click="navigateTo('/users')" class="px-4 py-2 bg-primary text-background-dark font-bold rounded-lg flex items-center gap-2 hover:bg-primary-hover"><MdiIcon :path="mdiAccountPlus" size="20" /> Manage Users</button>
              <button @click="viewSystemLogs" class="px-4 py-2 bg-background-dark rounded-lg flex items-center gap-2 hover:bg-primary/20"><MdiIcon :path="mdiFileDocument" size="20" /> System Logs</button>
              <button @click="backupSystem" class="px-4 py-2 bg-background-dark rounded-lg flex items-center gap-2 hover:bg-primary/20"><MdiIcon :path="mdiBackupRestore" size="20" /> Backup System</button>
            </div>
          </div>
          <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-3"><MdiIcon :path="mdiCog" size="24" /> System Configuration</h2>
            <div class="space-y-4">
              <div class="flex justify-between items-center p-3 bg-background-dark rounded-lg">
                <div><p class="font-medium">Hospital Name</p><p class="text-sm text-text-muted">Morgenster Hospital</p></div>
                <button @click="editHospitalInfo" class="px-3 py-1 text-sm border border-gray-600 rounded-md hover:bg-primary/20">Edit</button>
              </div>
              <div class="flex justify-between items-center p-3 bg-background-dark rounded-lg">
                <div><p class="font-medium">System Timezone</p><p class="text-sm text-text-muted">Africa/Maseru</p></div>
                <button @click="editTimezone" class="px-3 py-1 text-sm border border-gray-600 rounded-md hover:bg-primary/20">Edit</button>
              </div>
              <div class="flex justify-between items-center p-3 bg-background-dark rounded-lg">
                <div><p class="font-medium">Auto Backup</p><p class="text-sm text-green-400">Enabled</p></div>
                <button @click="toggleAutoBackup" class="px-3 py-1 text-sm border border-gray-600 rounded-md hover:bg-primary/20">Configure</button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Right Column -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Notifications -->
        <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-3"><MdiIcon :path="mdiBell" size="24" /> Notifications</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <div><p class="font-medium">Email Notifications</p><p class="text-sm text-text-muted">Receive important updates</p></div>
              <label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="emailNotifications" class="sr-only peer"><div class="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div></label>
            </div>
            <div class="flex justify-between items-center">
              <div><p class="font-medium">System Alerts</p><p class="text-sm text-text-muted">System maintenance notices</p></div>
              <label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="systemAlerts" class="sr-only peer"><div class="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div></label>
            </div>
            <div class="flex justify-between items-center">
              <div><p class="font-medium">Patient Updates</p><p class="text-sm text-text-muted">Patient-related changes</p></div>
              <label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="patientUpdates" class="sr-only peer"><div class="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div></label>
            </div>
          </div>
        </div>
        <!-- About -->
        <div class="bg-surface-dark p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-3"><MdiIcon :path="mdiHelpCircle" size="24" /> About</h2>
          <div class="text-center">
            <MdiIcon :path="mdiHospital" size="48" class="mx-auto text-primary" />
            <h3 class="text-lg font-bold mt-2">Morgenster HMS</h3>
            <p class="text-sm text-text-muted mt-1">Version: 2.0.0</p>
            <p class="text-xs text-text-muted mt-4">© 2025 Morgenster Systems. All rights reserved.</p>
          </div>
          <div class="mt-4 flex gap-2">
            <button @click="viewDocumentation" class="flex-1 text-sm py-2 bg-background-dark rounded-lg hover:bg-primary/20">Documentation</button>
            <button @click="contactSupport" class="flex-1 text-sm py-2 bg-background-dark rounded-lg hover:bg-primary/20">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import {
  mdiAccount, mdiSecurity, mdiInformation, mdiAccountGroup, mdiCog, mdiBell,
  mdiHelpCircle, mdiLock, mdiHistory, mdiAccountPlus, mdiFileDocument,
  mdiBackupRestore, mdiHospital,
} from '@mdi/js';

const router = useRouter();
const authStore = useAuthStore();

const emailNotifications = ref(true);
const systemAlerts = ref(true);
const patientUpdates = ref(true);

const navigateTo = (path) => router.push(path);
const formatDate = (date) => date.toLocaleDateString('en-US', { dateStyle: 'long' });

const changePassword = () => console.log('Change password');
const viewLoginHistory = () => console.log('View login history');
const viewSystemLogs = () => console.log('View system logs');
const backupSystem = () => console.log('Backup system');
const editHospitalInfo = () => console.log('Edit hospital info');
const editTimezone = () => console.log('Edit timezone');
const toggleAutoBackup = () => console.log('Toggle auto backup');
const viewDocumentation = () => console.log('View documentation');
const contactSupport = () => console.log('Contact support');
</script>

<style scoped>
/* All styles are handled by Tailwind CSS utility classes */
</style>