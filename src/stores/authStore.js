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
  const isPatient = computed(() => userRole.value === 'Patient')

  // Role permissions mapping
  const permissions = computed(() => {
    const role = userRole.value
    if (!role) return []

    const rolePermissions = {
      'Admin': ['*'], // All permissions
      'Doctor': [
        'patient:view', 'patient:create', 'doctors_notes:create', 'doctors_notes:edit',
        'prescriptions:create', 'prescriptions:edit', 'lab_requests:create',
        'radiology_requests:create', 'admission_discharge:create', 'operations:create'
      ],
      'Nurse': [
        'patient:view', 'patient:create', 'nurses_notes:create', 'nurses_notes:edit',
        'vitals:create', 'vitals:edit', 'prescriptions:create', 'lab_requests:create',
        'radiology_requests:create'
      ],
      'Accounts Clerk': [
        'patient:view', 'patient:create', 'invoices:create', 'invoices:edit',
        'billing:create', 'billing:edit', 'reports:view'
      ],
      'Account Assistant': [
        'patient:view', 'invoices:view', 'reports:view', 'reports:export',
        'billing:approve', 'cash_sales:print'
      ],
      'Accountant': [
        'patient:view', 'invoices:view', 'invoices:approve', 'reports:view',
        'reports:export', 'price_list:edit', 'admission_discharge:approve'
      ],
      'Laboratory Technician': [
        'patient:view', 'lab_requests:view', 'lab_requests:update',
        'lab_results:create', 'lab_results:edit'
      ],
      'Pharmacy Technician': [
        'patient:view', 'prescriptions:view', 'prescriptions:dispense',
        'inventory:view', 'inventory:edit'
      ],
      'Dispensary Assistant': [
        'patient:view', 'prescriptions:view', 'prescriptions:dispense',
        'inventory:view'
      ],
      'Radiologist': [
        'patient:view', 'radiology_requests:view', 'radiology_requests:update',
        'radiology_results:create', 'radiology_results:edit'
      ],
      'Rehabilitation Technician': [
        'patient:view', 'rehabilitation_notes:create', 'rehabilitation_notes:edit'
      ],
      'Patient': [
        'patient:view:own'
      ]
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
    isPatient,
    permissions,
    login,
    logout,
    hasPermission
  }
})