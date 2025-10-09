import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdTokenResult 
} from 'firebase/auth'
import { auth } from '@/services/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userClaims = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => userClaims.value?.role || null)
  const userDepartment = computed(() => userClaims.value?.department || null)
  const isAdmin = computed(() => userRole.value === 'Admin')

  // Role permissions mapping
  const permissions = computed(() => {
    const role = userRole.value
    if (!role) return []

    const rolePermissions = {
      'Admin': ['*'], // All permissions

      'Doctor': [
        'patient:view', 'patient:create',
        'doctors_notes:view', 'doctors_notes:edit',
        'nurses_notes:view',
        'operations:view', 'operations:edit', 'operations:create',
        'prescriptions:view', 'prescriptions:edit', 'prescriptions:create',
        'consent_forms:view', 'consent_forms:edit',
        'admission_discharge:view', 'admission_discharge:edit', 'admission_discharge:create',
        'radiology:view', 'radiology_requests:create',
        'laboratory:view', 'lab_requests:create',
      ],
      'Nurse': [
        'patient:view', 'patient:create',
        'doctors_notes:view',
        'nurses_notes:view', 'nurses_notes:create', 'nurses_notes:edit', 'nurses_notes:use_stationery',
        'operations:view', 'operations:create',
        'prescriptions:view', 'prescriptions:create',
        'consent_forms:view', 'consent_forms:create',
        'admission_discharge:view', 'admission_discharge:create',
        'vitals:create', 'vitals:edit',
        'lab_requests:create',
        'radiology_requests:create'
      ],
      'Accountant': [
        'patient:view',
        'billing:view', 'billing:edit',
        'doctors_notes:view',
        'nurses_notes:view',
        'laboratory:view',
        'radiology:view',
        'prescriptions:view',
        'consent_forms:view',
        'admission_discharge:view', 'admission_discharge:approve',
        'invoices:view', 'invoices:approve',
        'reports:view', 'reports:export',
        'price_list:edit',
      ],
      'Pharmacy Technician': [ // Mapped from 'pharmacists'
        'patient:view',
        'doctors_notes:view',
        'nurses_notes:view',
        'operations:view',
        'prescriptions:view', 'prescriptions:edit', 'prescriptions:print', 'prescriptions:dispense',
        'consent_forms:view', 'consent_forms:edit', 'consent_forms:print',
        'inventory:view', 'inventory:edit'
      ],
      'Laboratory Technician': [ // Mapped from 'lab technicians'
        'patient:view',
        'doctors_notes:view',
        'nurses_notes:view',
        'operations:view',
        'radiology:view',
        'laboratory:view', 'lab_requests:view', 'lab_requests:update', 'lab_results:create', 'lab_results:edit',
      ],
      'Radiologist': [ // Mapped from 'xray'
        'patient:view',
        'doctors_notes:view',
        'nurses_notes:view',
        'operations:view',
        'radiology:view', 'radiology_requests:view', 'radiology_requests:update', 'radiology_results:create', 'radiology_results:edit',
        'laboratory:view',
      ],
      'Rehabilitation Technician': [ // Mapped from 'rehab tech'
        'patient:view',
        'doctors_notes:view',
        'nurses_notes:view',
        'operations:view',
        'radiology:view',
        'laboratory:view',
        'rehabilitation_notes:view', 'rehabilitation_notes:edit', 'rehabilitation_notes:create'
      ],

      // Other existing roles
      'Accounts Clerk': [
        'patient:view', 'patient:create', 'invoices:create', 'invoices:edit',
        'billing:create', 'billing:edit', 'reports:view'
      ],
      'Account Assistant': [
        'patient:view', 'invoices:view', 'reports:view', 'reports:export',
        'billing:approve', 'cash_sales:print'
      ],
      'Dispensary Assistant': [
        'patient:view', 'prescriptions:view', 'prescriptions:dispense',
        'inventory:view'
      ],
    }

    return rolePermissions[role] || []
  })

  // Auth methods
  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Get user claims
      const tokenResult = await getIdTokenResult(userCredential.user)
      userClaims.value = tokenResult.claims
      
      return { user: userCredential.user, claims: tokenResult.claims }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      userClaims.value = null
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const hasPermission = (permission) => {
    const userPerms = permissions.value
    return userPerms.includes('*') || userPerms.includes(permission)
  }

  // Initialize auth state listener
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const tokenResult = await getIdTokenResult(firebaseUser, true) // Force refresh

      // Check for role claim. If not present, user is not fully set up.
      if (tokenResult.claims.role) {
        user.value = firebaseUser
        userClaims.value = tokenResult.claims
      } else {
        // Log out user if they don't have a role claim.
        // This can happen if a user is created in Firebase console but not assigned a role,
        // or if custom claims haven't propagated yet.
        await logout()
      }
    } else {
      user.value = null
      userClaims.value = null
    }
    loading.value = false
  })

  return {
    user: computed(() => user.value),
    userClaims: computed(() => userClaims.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isAuthenticated,
    userRole,
    userDepartment,
    isAdmin,
    permissions,
    login,
    logout,
    hasPermission
  }
})