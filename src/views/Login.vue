<template>
  <div class="login-page">
    <div class="login-container">
      <!-- System Header -->
      <div class="system-header">
        <div class="logo">
          <mdi-icon :path="mdiHospital" size="48" color="#0066B2" />
        </div>
        <h1 class="system-title">MORGENSTER HOSPITAL MANAGEMENT SYSTEM</h1>
      </div>

      <!-- Login Form -->
      <div class="login-form-container">
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="role" class="form-label">LOG IN AS:</label>
            <select
              id="role"
              v-model="selectedRole"
              class="form-select"
              required
            >
              <option value="">Select Role</option>
              <option value="Admin">ADMIN</option>
              <option value="Accounts Clerk">ACCOUNTS CLERK</option>
              <option value="Account Assistant">ACCOUNTS ASSISTANT</option>
              <option value="Accountant">ACCOUNTANT</option>
              <option value="Nurse">NURSE</option>
              <option value="Doctor">DOCTOR</option>
              <option value="Pharmacy Technician">PHARMACIST</option>
              <option value="Pharmacy Technician">PHARMACY TECHNICIAN</option>
              <option value="Dispensary Assistant">DISPENSARY ASSISTANT</option>
              <option value="Laboratory Technician">LAB SCIENTIST</option>
              <option value="Laboratory Technician">LAB TECH</option>
              <option value="Radiologist">XRAY OPERATOR</option>
              <option value="Rehabilitation Technician">REHABILITATION TECHNICIAN</option>
            </select>
          </div>

          <div class="form-group">
            <label for="username" class="form-label">USERNAME:</label>
            <input
              id="username"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">PASSWORD:</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <m3-button
            type="submit"
            variant="filled"
            size="large"
            :disabled="loading || !selectedRole || !email || !password"
            full-width
            class="login-button"
          >
            <span v-if="loading">LOGGING IN...</span>
            <span v-else>LOG IN</span>
          </m3-button>

          <a href="#" class="forgot-password">FORGOT PASSWORD</a>
        </form>
      </div>

      <!-- Footer -->
      <div class="hidden sm:flex items-center justify-center p-6 bg-gray-50 text-xs text-gray-500 font-medium tracking-wider">
        &copy; 2025 Alfa Systems. All Rights Reserved.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import M3Button from '@/components/common/M3Button.vue'
import { mdiHospital } from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()

const selectedRole = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    const { claims } = await authStore.login(email.value, password.value)
    
    // Verify the user has the selected role
    if (claims.role !== selectedRole.value) {
      error.value = 'You do not have permission to access this role.'
      await authStore.logout()
      return
    }

    // Redirect to appropriate dashboard
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

// Auto-fill email based on role selection
const handleRoleChange = () => {
  if (selectedRole.value === 'Admin') {
    email.value = 'admin@mhs.com'
  } else if (selectedRole.value === 'Doctor') {
    email.value = 'doctor1@mhs.com'
  } else if (selectedRole.value === 'Accounts Clerk') {
    email.value = 'accountsclerk1@mhs.com'
  } else if (selectedRole.value === 'Nurse') {
    email.value = 'nurse1@mhs.com'
  }
  // Add more auto-fill logic as needed
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #EBF8FF 0%, #F7F9FC 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
}

.login-container {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.system-header {
  padding: 40px 32px;
  text-align: center;
  background: linear-gradient(135deg, #0066B2 0%, #0052A3 100%);
  color: white;
}

.logo {
  margin-bottom: 16px;
}

.system-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 24px 0;
  line-height: 1.2;
}

.login-form-container {
  padding: 40px 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-select,
.form-input {
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: white;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #0066B2;
  box-shadow: 0 0 0 3px rgba(0, 102, 178, 0.1);
}

.form-select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.error-message {
  padding: 12px 16px;
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 8px;
  color: #DC2626;
  font-size: 14px;
  text-align: center;
}

.login-button {
  margin-top: 8px;
  height: 48px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.forgot-password {
  text-align: center;
  color: #0066B2;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-password:hover {
  color: #0052A3;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .login-container {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .system-header {
    padding: 32px 24px;
  }

  .system-title {
    font-size: 18px;
  }

  .login-form-container {
    padding: 32px 24px;
    flex: 1;
  }
}
</style>