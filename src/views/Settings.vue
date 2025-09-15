<template>
  <div class="space-y-8 p-4 md:p-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-text-light">Settings</h1>
      <p class="text-text-muted">Manage your account and system settings.</p>
    </div>

    <!-- Settings Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column -->
      <div class="lg:col-span-2 space-y-8">
        <!-- User Profile Card -->
        <div class="bg-surface-dark rounded-lg p-6 shadow-lg transition-transform transform hover:scale-105">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-primary/20 rounded-full">
              <MdiIcon :path="mdiAccount" size="24" class="text-primary" />
            </div>
            <h2 class="text-xl font-semibold text-text-light">User Profile</h2>
          </div>
          <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-sm font-medium text-text-muted">Full Name</label>
              <p class="mt-1 text-text-light">{{ authStore.user?.displayName || 'N/A' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-text-muted">Email</label>
              <p class="mt-1 text-text-light">{{ authStore.user?.email }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-text-muted">Role</label>
              <p class="mt-1 text-text-light">{{ authStore.userRole }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-text-muted">Department</label>
              <p class="mt-1 text-text-light">{{ authStore.userDepartment }}</p>
            </div>
          </div>
        </div>

        <!-- Admin Sections -->
        <template v-if="authStore.isAdmin">
          <!-- User Management Card -->
          <div class="bg-surface-dark rounded-lg p-6 shadow-lg transition-transform transform hover:scale-105">
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-accent/20 rounded-full">
                <MdiIcon :path="mdiAccountGroup" size="24" class="text-accent" />
              </div>
              <h2 class="text-xl font-semibold text-text-light">Admin: User Management</h2>
            </div>
            <div class="mt-6 flex flex-wrap gap-4">
              <button @click="navigateTo('/users')" class="flex items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                <MdiIcon :path="mdiAccountPlus" size="20" class="mr-2 text-primary" />
                Manage Users
              </button>
              <button @click="viewSystemLogs" class="flex items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                <MdiIcon :path="mdiFileDocument" size="20" class="mr-2 text-primary" />
                System Logs
              </button>
              <button @click="backupSystem" class="flex items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                <MdiIcon :path="mdiBackupRestore" size="20" class="mr-2 text-primary" />
                Backup System
              </button>
            </div>
          </div>

          <!-- System Configuration Card -->
          <div class="bg-surface-dark rounded-lg p-6 shadow-lg transition-transform transform hover:scale-105">
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-accent/20 rounded-full">
                <MdiIcon :path="mdiCog" size="24" class="text-accent" />
              </div>
              <h2 class="text-xl font-semibold text-text-light">Admin: System Configuration</h2>
            </div>
            <div class="mt-6 space-y-4">
              <!-- Hospital Name -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-text-light">Hospital Name</p>
                  <p class="text-sm text-text-muted">Morgenster Hospital</p>
                </div>
                <button @click="editHospitalInfo" class="px-4 py-2 text-sm border border-primary/50 text-primary/80 hover:bg-primary/20 rounded-lg transition-colors">Edit</button>
              </div>
              <!-- Timezone -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-text-light">System Timezone</p>
                  <p class="text-sm text-text-muted">Africa/Maseru</p>
                </div>
                <button @click="editTimezone" class="px-4 py-2 text-sm border border-primary/50 text-primary/80 hover:bg-primary/20 rounded-lg transition-colors">Edit</button>
              </div>
              <!-- Auto Backup -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-text-light">Auto Backup</p>
                  <p class="text-sm text-text-muted">Enabled</p>
                </div>
                 <button @click="toggleAutoBackup" class="px-4 py-2 text-sm border border-primary/50 text-primary/80 hover:bg-primary/20 rounded-lg transition-colors">Configure</button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Right Column -->
      <div class="space-y-8">
        <!-- Change Password Card -->
        <div class="bg-surface-dark rounded-lg p-6 shadow-lg transition-transform transform hover:scale-105">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-red-500/20 rounded-full">
              <MdiIcon :path="mdiLock" size="24" class="text-red-400" />
            </div>
            <h2 class="text-xl font-semibold text-text-light">Change Password</h2>
          </div>
          <form class="mt-6 space-y-4" @submit.prevent="handleChangePassword">
            <div>
              <label for="current-password" class="block text-sm font-medium text-text-muted">Current Password</label>
              <input type="password" id="current-password" v-model="currentPassword" class="mt-1 block w-full bg-background-dark border-gray-600 rounded-md shadow-sm text-text-light focus:ring-primary focus:border-primary">
            </div>
            <div>
              <label for="new-password" class="block text-sm font-medium text-text-muted">New Password</label>
              <input type="password" id="new-password" v-model="newPassword" class="mt-1 block w-full bg-background-dark border-gray-600 rounded-md shadow-sm text-text-light focus:ring-primary focus:border-primary">
            </div>
            <div>
              <label for="confirm-password" class="block text-sm font-medium text-text-muted">Confirm New Password</label>
              <input type="password" id="confirm-password" v-model="confirmPassword" class="mt-1 block w-full bg-background-dark border-gray-600 rounded-md shadow-sm text-text-light focus:ring-primary focus:border-primary">
            </div>
            <div class="flex justify-end">
              <button type="submit" class="px-4 py-2 bg-primary hover:bg-primary-hover text-background-dark font-semibold rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
            <div v-if="message.text" :class="message.type === 'success' ? 'text-green-400' : 'text-red-400'" class="mt-4 text-sm">
              {{ message.text }}
            </div>
          </form>
        </div>

        <!-- Notifications Card -->
        <div class="bg-surface-dark rounded-lg p-6 shadow-lg transition-transform transform hover:scale-105">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-yellow-500/20 rounded-full">
              <MdiIcon :path="mdiBell" size="24" class="text-yellow-400" />
            </div>
            <h2 class="text-xl font-semibold text-text-light">Notifications</h2>
          </div>
          <div class="mt-6 space-y-4">
            <!-- Email Notifications -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-light">Email Notifications</p>
                <p class="text-sm text-text-muted">Receive important updates.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="emailNotifications" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <!-- System Alerts -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-light">System Alerts</p>
                <p class="text-sm text-text-muted">System maintenance alerts.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="systemAlerts" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <!-- Patient Updates -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-light">Patient Updates</p>
                <p class="text-sm text-text-muted">Patient-related changes.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="patientUpdates" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- About Card -->
        <div class="bg-surface-dark rounded-lg p-6 shadow-lg transition-transform transform hover:scale-105">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-blue-500/20 rounded-full">
              <MdiIcon :path="mdiHelpCircle" size="24" class="text-blue-400" />
            </div>
            <h2 class="text-xl font-semibold text-text-light">About</h2>
          </div>
          <div class="mt-6 text-sm text-text-muted">
            <p class="font-semibold text-text-light">Morgenster Hospital Management System</p>
            <p>Version: 2.0.0</p>
            <p>Developer: BlackAlfa Systems</p>
            <p class="mt-2">© 2025 All rights reserved</p>
          </div>
           <div class="mt-4 flex space-x-4">
            <button @click="viewDocumentation" class="text-sm text-primary hover:underline">Documentation</button>
            <button @click="contactSupport" class="text-sm text-primary hover:underline">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { auth } from '@/services/firebase'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import MdiIcon from '@/components/common/MdiIcon.vue'
import {
  mdiAccount,
  mdiAccountGroup,
  mdiCog,
  mdiBell,
  mdiHelpCircle,
  mdiLock,
  mdiAccountPlus,
  mdiFileDocument,
  mdiBackupRestore
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()

// Password fields
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref({ type: '', text: '' })

// Notification settings
const emailNotifications = ref(true)
const systemAlerts = ref(true)
const patientUpdates = ref(true)

// Navigation helper
const navigateTo = (path) => {
  router.push(path)
}

// Action handlers
const handleChangePassword = async () => {
  message.value = { type: '', text: '' }

  if (newPassword.value !== confirmPassword.value) {
    message.value = { type: 'error', text: 'New passwords do not match.' }
    return
  }

  if (newPassword.value.length < 6) {
    message.value = { type: 'error', text: 'Password should be at least 6 characters long.' }
    return
  }

  const user = auth.currentUser
  if (!user) {
    message.value = { type: 'error', text: 'Could not find user.' }
    return
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword.value)

  try {
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, newPassword.value)

    message.value = { type: 'success', text: 'Password updated successfully!' }
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    console.error('Error updating password:', error)
    message.value = { type: 'error', text: 'Failed to update password. Please check your current password.' }
  }
}

const viewSystemLogs = () => {
  // TODO: Implement system logs view
}

const backupSystem = () => {
  // TODO: Implement system backup
}

const editHospitalInfo = () => {
  // TODO: Implement hospital info editing
}

const editTimezone = () => {
  // TODO: Implement timezone editing
}

const toggleAutoBackup = () => {
  // TODO: Implement auto backup configuration
}

const viewDocumentation = () => {
  // TODO: Open documentation
}

const contactSupport = () => {
  // TODO: Open support contact
}
</script>