import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import AppShell from '@/components/layout/AppShell.vue';
import AuthLayout from '@/components/layout/AuthLayout.vue';

const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { requiresAuth: false },
      },
    ],
  },
  {
    path: '/',
    component: AppShell,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        redirect: () => {
          const authStore = useAuthStore();
          const role = authStore.userRole;

          const roleRoutes = {
            Admin: '/admin',
            Doctor: '/doctor',
            Nurse: '/nurse',
            'Accounts Clerk': '/accounts-clerk',
            'Account Assistant': '/account-assistant',
            Accountant: '/accountant',
            'Laboratory Technician': '/lab',
            'Pharmacy Technician': '/pharmacy',
            'Dispensary Assistant': '/dispensary',
            Radiologist: '/radiology',
            'Rehabilitation Technician': '/rehab',
          };

          return roleRoutes[role] || '/auth/login';
        },
      },
      {
        path: 'admin',
        name: 'AdminDashboard',
        component: () => import('@/views/dashboards/AdminDashboard.vue'),
        meta: { roles: ['Admin'] },
      },
      {
        path: 'admin/user-management',
        name: 'UserManagement',
        component: () => import('@/views/admin/UserManagement.vue'),
        meta: { roles: ['Admin'] },
      },
      {
        path: 'doctor',
        name: 'DoctorDashboard',
        component: () => import('@/views/dashboards/DoctorDashboard.vue'),
        meta: { roles: ['Doctor'] },
      },
      {
        path: 'nurse',
        name: 'NurseDashboard',
        component: () => import('@/views/dashboards/NurseDashboard.vue'),
        meta: { roles: ['Nurse'] },
      },
      {
        path: 'accounts-clerk',
        name: 'AccountsClerkDashboard',
        component: () => import('@/views/dashboards/AccountsClerkDashboard.vue'),
        meta: { roles: ['Accounts Clerk'] },
      },
      {
        path: 'account-assistant',
        name: 'AccountAssistantDashboard',
        component: () => import('@/views/dashboards/AccountAssistantDashboard.vue'),
        meta: { roles: ['Account Assistant'] },
      },
      {
        path: 'accountant',
        name: 'AccountantDashboard',
        component: () => import('@/views/dashboards/AccountantDashboard.vue'),
        meta: { roles: ['Accountant'] },
      },
      {
        path: 'lab',
        name: 'LabDashboard',
        component: () => import('@/views/dashboards/LabDashboard.vue'),
        meta: { roles: ['Laboratory Technician'] },
      },
      {
        path: 'pharmacy',
        name: 'PharmacyDashboard',
        component: () => import('@/views/dashboards/PharmacyDashboard.vue'),
        meta: { roles: ['Pharmacy Technician'] },
      },
      {
        path: 'dispensary',
        name: 'DispensaryDashboard',
        component: () => import('@/views/dashboards/DispensaryDashboard.vue'),
        meta: { roles: ['Dispensary Assistant'] },
      },
      {
        path: 'radiology',
        name: 'RadiologyDashboard',
        component: () => import('@/views/dashboards/RadiologyDashboard.vue'),
        meta: { roles: ['Radiologist'] },
      },
      {
        path: 'rehab',
        name: 'RehabDashboard',
        component: () => import('@/views/dashboards/RehabDashboard.vue'),
        meta: { roles: ['Rehabilitation Technician'] },
      },
      {
        path: 'inventory',
        name: 'InventoryManagement',
        component: () => import('@/views/inventory/InventoryManagement.vue'),
        meta: { permissions: ['inventory:view'] },
      },
      {
        path: 'patient/register',
        name: 'PatientRegistration',
        component: () => import('@/views/patient/PatientRegistration.vue'),
        meta: { permissions: ['patient:create'], roles: ['Accounts Clerk', 'Doctor', 'Nurse'] },
      },
      {
        path: 'accountant/patient/register',
        name: 'AccountantPatientRegistration',
        component: () => import('@/views/patient/AccountantPatientRegistration.vue'),
        meta: { permissions: ['patient:create'], roles: ['Accountant'] },
      },
      {
        path: 'patient/:id',
        name: 'PatientProfile',
        component: () => import('@/views/patient/PatientProfile.vue'),
        meta: { permissions: ['patient:view'] },
      },
      {
        path: 'patient/:id/billing',
        name: 'PatientBilling',
        component: () => import('@/views/patient/Billing.vue'),
        meta: { permissions: ['billing:create'] },
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/Reports.vue'),
        meta: { permissions: ['reports:view'] },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 };
  },
});

// Simplified Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isAuthenticated) {
    // Redirect unauthenticated users to the login page
    next({ name: 'Login' });
  } else if (to.name === 'Login' && isAuthenticated) {
    // Redirect authenticated users from the login page to the dashboard
    next({ path: '/' });
  } else {
    // Allow navigation
    next();
  }
});

export default router;