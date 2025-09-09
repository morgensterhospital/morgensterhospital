import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import apiService from './services/api'
import apiService from './services/api'

// Create Vue app
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)

// Auto-seed users on first app load
const initializeApp = async () => {
  try {
    console.log('🚀 Initializing Morgenster Hospital Management System...')
    
    // Attempt to seed users (will skip if already seeded)
    const result = await apiService.seedUsers()
    console.log('✅ User seeding result:', result.message)
    
    if (result.totalCreated > 0) {
      console.log(`🎉 Created ${result.totalCreated} users successfully!`)
      console.log('🔐 Default password for all users: mhs2025')
    }
  } catch (error) {
    console.warn('⚠️ User seeding failed (this is normal if users already exist):', error.message)
  }
}

// Auto-seed users on first app load
const initializeApp = async () => {
  try {
    console.log('🚀 Initializing Morgenster Hospital Management System...')
    
    // Attempt to seed users (will skip if already seeded)
    const result = await apiService.seedUsers()
    console.log('✅ User seeding result:', result.message)
    
    if (result.totalCreated > 0) {
      console.log(`🎉 Created ${result.totalCreated} users successfully!`)
      console.log('🔐 Default password for all users: mhs2025')
    }
  } catch (error) {
    console.warn('⚠️ User seeding failed (this is normal if users already exist):', error.message)
  }
}
// Mount app
app.mount('#app')

// Initialize after mount
initializeApp()

// Initialize after mount
initializeApp()