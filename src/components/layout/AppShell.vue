<template>
  <div class="app-shell">
    <!-- Desktop Navigation Rail -->
    <nav v-if="!isMobile" class="nav-rail">
      <div class="nav-header">
        <div class="logo">
          <mdi-icon :path="mdiHospital" size="32" color="#0066B2" />
        </div>
        <h1 class="system-title">MHMS</h1>
      </div>

      <div class="nav-items">
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
        >
          <mdi-icon :path="item.icon" size="24" />
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </div>

      <div class="nav-footer">
        <div class="user-info">
          <div class="user-avatar">
            <mdi-icon :path="mdiAccount" size="24" />
          </div>
          <div class="user-details">
            <div class="user-name">{{ authStore.user?.displayName || 'User' }}</div>
            <div class="user-role">{{ authStore.userRole }}</div>
          </div>
        </div>
        
        <button @click="handleLogout" class="logout-btn">
          <mdi-icon :path="mdiLogout" size="20" />
          <span>Logout</span>
        </button>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="main-content" :class="{ 'mobile': isMobile }">
      <!-- Mobile Header -->
      <header v-if="isMobile" class="mobile-header">
        <div class="mobile-title">
          <mdi-icon :path="mdiHospital" size="24" color="#0066B2" />
          <span>MHMS</span>
        </div>
        <button @click="handleLogout" class="mobile-logout">
          <mdi-icon :path="mdiLogout" size="20" />
        </button>
      </header>

      <!-- Page Content -->
      <div class="page-content">
        <router-view />
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav v-if="isMobile" class="bottom-nav">
      <router-link
        v-for="item in navigationItems.slice(0, 5)"
        :key="item.name"
        :to="item.path"
        class="bottom-nav-item"
        :class="{ active: $route.path === item.path }"
      >
        <mdi-icon :path="item.icon" size="20" />
        <span class="bottom-nav-label">{{ item.shortLabel || item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import {
  mdiHospital,
  mdiAccount,
  mdiLogout,
  mdiViewDashboard,
  mdiAccountPlus,
  mdiChartLine,
  mdiAccountGroup,
  mdiPills,
  mdiTestTube,
  mdiRadiobox,
  mdiPhysicalTherapy,
  mdiCog,
  mdiNurse
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()

const isMobile = ref(false)

// Check screen size
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 1024
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// Navigation items based on user role
const navigationItems = computed(() => {
  const role = authStore.userRole
  const baseItems = []

  // Add dashboard for all roles
  baseItems.push({
    name: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: mdiViewDashboard,
    path: '/'
  })

  // Role-specific navigation items
  if (role === 'Accounts Clerk') {
    baseItems.push(
      {
        name: 'register',
        label: 'New Patient',
        shortLabel: 'Register',
        icon: mdiAccountPlus,
        path: '/patient/register'
      },
      {
        name: 'reports',
        label: 'Reports',
        shortLabel: 'Reports',
        icon: mdiChartLine,
        path: '/reports'
      }
    )
  }

  if (['Doctor', 'Nurse'].includes(role)) {
    baseItems.push(
      {
        name: 'register',
        label: 'New Patient',
        shortLabel: 'Register',
        icon: mdiAccountPlus,
        path: '/patient/register'
      }
    )
  }

  if (['Admin', 'Accountant', 'Account Assistant'].includes(role)) {
    baseItems.push(
      {
        name: 'users',
        label: 'User Management',
        shortLabel: 'Users',
        icon: mdiAccountGroup,
        path: '/users'
      },
      {
        name: 'reports',
        label: 'Reports',
        shortLabel: 'Reports',
        icon: mdiChartLine,
        path: '/reports'
      }
    )
  }

  // Add settings for all users
  baseItems.push({
    name: 'settings',
    label: 'Settings',
    shortLabel: 'Settings',
    icon: mdiCog,
    path: '/settings'
  })

  return baseItems
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  background-color: #F7F9FC;
}

/* Desktop Navigation Rail */
.nav-rail {
  width: 280px;
  background: white;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.nav-header {
  padding: 24px 20px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  gap: 12px;
}

.system-title {
  font-size: 24px;
  font-weight: 700;
  color: #0066B2;
  margin: 0;
}

.nav-items {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  color: #6B7280;
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.nav-item:hover {
  background-color: #F3F4F6;
  color: #0066B2;
}

.nav-item.active {
  background-color: #EBF8FF;
  color: #0066B2;
  border-left-color: #0066B2;
}

.nav-label {
  font-weight: 500;
}

.nav-footer {
  padding: 20px;
  border-top: 1px solid #E5E7EB;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #E5E7EB;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  color: #1F2937;
}

.user-role {
  font-size: 12px;
  color: #6B7280;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #F3F4F6;
  color: #DC2626;
  border-color: #FCA5A5;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content.mobile {
  padding-bottom: 80px;
}

/* Mobile Header */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #0066B2;
}

.mobile-logout {
  padding: 8px;
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mobile-logout:hover {
  background: #F3F4F6;
  color: #DC2626;
}

/* Page Content */
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Mobile Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: white;
  border-top: 1px solid #E5E7EB;
  display: flex;
  padding: 8px 4px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  color: #6B7280;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.bottom-nav-item.active {
  color: #0066B2;
  background-color: #EBF8FF;
}

.bottom-nav-label {
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

@media (max-width: 1024px) {
  .nav-rail {
    display: none;
  }
}
</style>