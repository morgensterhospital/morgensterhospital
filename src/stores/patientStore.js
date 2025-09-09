import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuthStore } from './authStore'
import apiService from '@/services/api'

export const usePatientStore = defineStore('patient', () => {
  const patients = ref([])
  const currentPatient = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Register new patient
  const registerPatient = async (patientData) => {
    try {
      loading.value = true
      error.value = null

      const authStore = useAuthStore()
      const result = await apiService.createPatient(patientData, authStore.user.uid)
      
      return result.patientId
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Search patients
  const searchPatients = async (searchTerm) => {
    try {
      loading.value = true
      
      const q = query(
        collection(db, 'patients'),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        limit(10)
      )
      
      const querySnapshot = await getDocs(q)
      const results = []
      
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() })
      })
      
      return results
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get patient by ID
  const getPatient = async (patientId) => {
    try {
      loading.value = true
      
      const docRef = doc(db, 'patients', patientId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        currentPatient.value = { id: docSnap.id, ...docSnap.data() }
        return currentPatient.value
      } else {
        throw new Error('Patient not found')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Add vitals
  const addVitals = async (patientId, vitalsData) => {
    try {
      const authStore = useAuthStore()
      await apiService.addMedicalRecord(patientId, 'vitals', vitalsData, authStore.user.uid)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Add doctor's note
  const addDoctorNote = async (patientId, noteData) => {
    try {
      const authStore = useAuthStore()
      await apiService.addMedicalRecord(patientId, 'doctors_notes', noteData, authStore.user.uid)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Add nurse's note
  const addNurseNote = async (patientId, noteData) => {
    try {
      const authStore = useAuthStore()
      await apiService.addMedicalRecord(patientId, 'nurses_notes', noteData, authStore.user.uid)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Add prescription
  const addPrescription = async (patientId, prescriptionData) => {
    try {
      const authStore = useAuthStore()
      await apiService.addMedicalRecord(patientId, 'prescriptions', prescriptionData, authStore.user.uid)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Add lab request
  const addLabRequest = async (patientId, requestData) => {
    try {
      const authStore = useAuthStore()
      await apiService.addMedicalRecord(patientId, 'lab_requests', requestData, authStore.user.uid)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Add radiology request
  const addRadiologyRequest = async (patientId, requestData) => {
    try {
      const authStore = useAuthStore()
      await apiService.addMedicalRecord(patientId, 'radiology_requests', requestData, authStore.user.uid)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Process billing
  const processBilling = async (patientId, items, paymentMethod, amountPaid) => {
    try {
      const authStore = useAuthStore()
      return await apiService.processBilling(patientId, items, paymentMethod, amountPaid, authStore.user.uid)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    patients: computed(() => patients.value),
    currentPatient: computed(() => currentPatient.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    registerPatient,
    searchPatients,
    getPatient,
    addVitals,
    addDoctorNote,
    addNurseNote,
    addPrescription,
    addLabRequest,
    addRadiologyRequest,
    processBilling
  }
})