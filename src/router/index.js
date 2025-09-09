import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    redirect: to => {
      const authStore = useAuthStore()
      const role = authStore.userRole
      
      const roleRoutes = {
        'Admin': '/admin',
        'Doctor': '/doctor',
        'Nurse': '/nurse',
        'Accounts Clerk': '/accounts-clerk',
        'Account Assistant': '/account-assistant',
        'Accountant': '/accountant',
        'Laboratory Technician': '/lab',
        'Pharmacy Technician': '/pharmacy',
        'Dispensary Assistant': '/dispensary',
        'Radiologist': '/radiology',
        'Rehabilitation Technician': '/rehab'
      }
      
      return roleRoutes[role] || '/login'
    },
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/dashboards/AdminDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Admin'] }
  },
  {
    path: '/doctor',
    name: 'DoctorDashboard',
    component: () => import('@/views/dashboards/DoctorDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Doctor'] }
  },
  {
    path: '/nurse',
    name: 'NurseDashboard',
    component: () => import('@/views/dashboards/NurseDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Nurse'] }
  },
  {
    path: '/accounts-clerk',
    name: 'AccountsClerkDashboard',
    component: () => import('@/views/dashboards/AccountsClerkDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Accounts Clerk'] }
  },
  {
    path: '/account-assistant',
    name: 'AccountAssistantDashboard',
    component: () => import('@/views/dashboards/AccountAssistantDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Account Assistant'] }
  },
  {
    path: '/accountant',
    name: 'AccountantDashboard',
    component: () => import('@/views/dashboards/AccountantDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Accountant'] }
  },
  {
    path: '/lab',
    name: 'LabDashboard',
    component: () => import('@/views/dashboards/LabDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Laboratory Technician'] }
  },
  {
    path: '/pharmacy',
    name: 'PharmacyDashboard',
    component: () => import('@/views/dashboards/PharmacyDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Pharmacy Technician'] }
  },
  {
    path: '/dispensary',
    name: 'DispensaryDashboard',
    component: () => import('@/views/dashboards/DispensaryDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Dispensary Assistant'] }
  },
  {
    path: '/radiology',
    name: 'RadiologyDashboard',
    component: () => import('@/views/dashboards/RadiologyDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Radiologist'] }
  },
  {
    path: '/rehab',
    name: 'RehabDashboard',
    component: () => import('@/views/dashboards/RehabDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Rehabilitation Technician'] }
  },
  {
    path: '/inventory',
    name: 'InventoryManagement',
    component: () => import('@/views/inventory/InventoryManagement.vue'),
    meta: { requiresAuth: true, permissions: ['inventory:view'] }
  },
  {
    path: '/patient/register',
    name: 'PatientRegistration',
    component: () => import('@/views/patient/PatientRegistration.vue'),
    meta: { requiresAuth: true, permissions: ['patient:create'] }
  },
  {
    path: '/patient/:id',
    name: 'PatientProfile',
    component: () => import('@/views/patient/PatientProfile.vue'),
    meta: { requiresAuth: true, permissions: ['patient:view'] }
  },
  {
    path: '/patient/:id/billing',
    name: 'PatientBilling',
    component: () => import('@/views/patient/Billing.vue'),
    meta: { requiresAuth: true, permissions: ['billing:create'] }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/Reports.vue'),
    meta: { requiresAuth: true, permissions: ['reports:view'] }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth to initialize
  if (authStore.loading) {
    await new Promise(resolve => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.loading) {
          unwatch()
          resolve()
        }
      })
    })
  }
  
  // Check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Check role permissions
  if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    next('/')
    return
  }
  
  // Check specific permissions
  if (to.meta.permissions && !to.meta.permissions.some(perm => authStore.hasPermission(perm))) {
    next('/')
    return
  }
  
  // Redirect authenticated users away from login
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router