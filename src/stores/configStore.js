import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuthStore } from './authStore'
import apiService from '@/services/api'
import { useAuthStore } from './authStore'
import apiService from '@/services/api'

export const useConfigStore = defineStore('config', () => {
  const priceList = ref([])
  const inventory = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Load price list
  const loadPriceList = async () => {
    try {
      loading.value = true
      const docRef = doc(db, 'app_config', 'price_list')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        priceList.value = docSnap.data().items || []
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Load inventory
  const loadInventory = async () => {
    try {
      loading.value = true
      const docRef = doc(db, 'app_config', 'inventory')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        inventory.value = docSnap.data().items || []
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Update price list
  const updatePriceList = async (items) => {
    try {
      const authStore = useAuthStore()
      await apiService.updateInventory(items, authStore.user.uid)
      priceList.value = items
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Update inventory
  const updateInventory = async (items) => {
    try {
      const authStore = useAuthStore()
      await apiService.updateInventory(items, authStore.user.uid)
      inventory.value = items
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Get price by item ID
  const getItemPrice = (itemId) => {
    const item = priceList.value.find(item => item.id === itemId)
    return item ? item.price : 0
  }

  // Get stock level by item ID
  const getStockLevel = (itemId) => {
    const item = inventory.value.find(item => item.id === itemId)
    return item ? item.stockLevel : 0
  }
  // Get price by item ID
  const getItemPrice = (itemId) => {
    const item = priceList.value.find(item => item.id === itemId)
    return item ? item.price : 0
  }

  // Get stock level by item ID
  const getStockLevel = (itemId) => {
    const item = inventory.value.find(item => item.id === itemId)
    return item ? item.stockLevel : 0
  }

  return {
    priceList: computed(() => priceList.value),
    inventory: computed(() => inventory.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    loadPriceList,
    loadInventory,
    updatePriceList,
    updateInventory,
    getItemPrice,
    getStockLevel
    getItemPrice,
    getStockLevel
  }
})