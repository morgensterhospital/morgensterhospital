<template>
  <div class="inventory-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">Home</router-link>
          <mdi-icon :path="mdiChevronRight" size="16" />
          <span class="breadcrumb-current">Inventory Management</span>
        </div>
        <h1 class="page-title">INVENTORY MANAGEMENT</h1>
      </div>
      
      <div class="header-actions">
        <m3-button variant="outlined" @click="exportInventory">
          <mdi-icon :path="mdiDownload" size="20" />
          Export
        </m3-button>
        <m3-button variant="outlined" @click="downloadInventoryPDF">
          <mdi-icon :path="mdiFileDocument" size="20" />
          Download PDF
        </m3-button>
        <m3-button variant="filled" @click="addNewItem">
          <mdi-icon :path="mdiPlus" size="20" />
          Add Item
        </m3-button>
      </div>
    </div>

    <!-- Inventory Stats -->
    <div class="inventory-stats">
      <div class="stat-card total-items">
        <div class="stat-icon">
          <mdi-icon :path="mdiPackageVariant" size="32" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Total Items</div>
          <div class="stat-value">{{ inventory.length }}</div>
        </div>
      </div>
      
      <div class="stat-card low-stock">
        <div class="stat-icon">
          <mdi-icon :path="mdiAlertCircle" size="32" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Low Stock Items</div>
          <div class="stat-value">{{ lowStockItems.length }}</div>
        </div>
      </div>
      
      <div class="stat-card out-of-stock">
        <div class="stat-icon">
          <mdi-icon :path="mdiCloseCircle" size="32" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Out of Stock</div>
          <div class="stat-value">{{ outOfStockItems.length }}</div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters">
      <div class="search-section">
        <m3-text-field
          v-model="searchQuery"
          placeholder="Search items by name..."
          :icon-leading="mdiMagnify"
          variant="outlined"
        />
      </div>
      
      <div class="filter-section">
        <select v-model="stockFilter" class="filter-select">
          <option value="">All Items</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
        
        <select v-model="categoryFilter" class="filter-select">
          <option value="">All Categories</option>
          <option value="medication">Medications</option>
          <option value="supplies">Medical Supplies</option>
          <option value="equipment">Equipment</option>
        </select>
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="inventory-table-container">
      <div class="table-header">
        <h2>Inventory Items</h2>
        <div class="table-actions">
          <m3-button variant="outlined" size="small" @click="refreshInventory">
            <mdi-icon :path="mdiRefresh" size="16" />
            Refresh
          </m3-button>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="inventory-table">
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Unit</th>
              <th>Minimum Level</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredInventory" :key="item.id">
              <td>{{ item.id }}</td>
              <td class="item-name">{{ item.name }}</td>
              <td>
                <span class="category-badge" :class="item.category">
                  {{ formatCategory(item.category) }}
                </span>
              </td>
              <td class="stock-level">{{ item.stockLevel }}</td>
              <td>{{ item.unit }}</td>
              <td>{{ item.minimumLevel || 10 }}</td>
              <td>
                <span class="status-badge" :class="getStockStatus(item)">
                  {{ getStockStatusText(item) }}
                </span>
              </td>
              <td>{{ formatDate(item.lastUpdated) }}</td>
              <td class="actions">
                <m3-button variant="outlined" size="small" @click="editItem(item)">
                  Edit
                </m3-button>
                <m3-button variant="outlined" size="small" @click="adjustStock(item)">
                  Adjust
                </m3-button>
              </td>
            </tr>
            <tr v-if="filteredInventory.length === 0">
              <td colspan="9" class="empty-state">
                No items found matching your criteria
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Item Modal -->
    <div v-if="showItemModal" class="modal-overlay" @click="closeItemModal">
      <div class="item-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingItem ? 'Edit Item' : 'Add New Item' }}</h3>
          <button @click="closeItemModal" class="close-button">
            <mdi-icon :path="mdiClose" size="20" />
          </button>
        </div>
        
        <form @submit.prevent="saveItem" class="item-form">
          <div class="form-grid">
            <m3-text-field
              v-model="itemForm.id"
              label="Item ID"
              variant="outlined"
              required
              :readonly="editingItem"
            />
            
            <m3-text-field
              v-model="itemForm.name"
              label="Item Name"
              variant="outlined"
              required
            />
            
            <div class="form-group">
              <label>Category</label>
              <select v-model="itemForm.category" class="form-select" required>
                <option value="">Select Category</option>
                <option value="medication">Medication</option>
                <option value="supplies">Medical Supplies</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
            
            <m3-text-field
              v-model.number="itemForm.stockLevel"
              label="Current Stock"
              variant="outlined"
              type="number"
              min="0"
              required
            />
            
            <m3-text-field
              v-model="itemForm.unit"
              label="Unit"
              variant="outlined"
              placeholder="e.g., tablets, boxes, pieces"
              required
            />
            
            <m3-text-field
              v-model.number="itemForm.minimumLevel"
              label="Minimum Level"
              variant="outlined"
              type="number"
              min="0"
              required
            />
          </div>
          
          <div class="modal-actions">
            <m3-button variant="outlined" @click="closeItemModal">
              Cancel
            </m3-button>
            <m3-button variant="filled" type="submit" :disabled="saving">
              <span v-if="saving">Saving...</span>
              <span v-else>{{ editingItem ? 'Update' : 'Add' }} Item</span>
            </m3-button>
          </div>
        </form>
      </div>
    </div>

    <!-- Stock Adjustment Modal -->
    <div v-if="showAdjustModal" class="modal-overlay" @click="closeAdjustModal">
      <div class="adjust-modal" @click.stop>
        <div class="modal-header">
          <h3>Adjust Stock - {{ adjustingItem?.name }}</h3>
          <button @click="closeAdjustModal" class="close-button">
            <mdi-icon :path="mdiClose" size="20" />
          </button>
        </div>
        
        <form @submit.prevent="saveStockAdjustment" class="adjust-form">
          <div class="current-stock">
            <label>Current Stock Level</label>
            <span class="stock-value">{{ adjustingItem?.stockLevel }} {{ adjustingItem?.unit }}</span>
          </div>
          
          <div class="adjustment-section">
            <div class="adjustment-type">
              <label>Adjustment Type</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input type="radio" v-model="adjustmentType" value="add" />
                  <span>Add Stock</span>
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="adjustmentType" value="remove" />
                  <span>Remove Stock</span>
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="adjustmentType" value="set" />
                  <span>Set Stock Level</span>
                </label>
              </div>
            </div>
            
            <m3-text-field
              v-model.number="adjustmentAmount"
              :label="adjustmentType === 'set' ? 'New Stock Level' : 'Adjustment Amount'"
              variant="outlined"
              type="number"
              min="0"
              required
            />
            
            <m3-text-field
              v-model="adjustmentReason"
              label="Reason for Adjustment"
              variant="outlined"
              type="textarea"
              :rows="3"
              placeholder="Enter reason for stock adjustment..."
              required
            />
          </div>
          
          <div class="new-stock-preview">
            <label>New Stock Level</label>
            <span class="preview-value">{{ calculateNewStock() }} {{ adjustingItem?.unit }}</span>
          </div>
          
          <div class="modal-actions">
            <m3-button variant="outlined" @click="closeAdjustModal">
              Cancel
            </m3-button>
            <m3-button variant="filled" type="submit" :disabled="saving">
              <span v-if="saving">Adjusting...</span>
              <span v-else>Apply Adjustment</span>
            </m3-button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useAuthStore } from '@/stores/authStore'
import apiService from '@/services/api'
import MdiIcon from '@/components/common/MdiIcon.vue'
import M3Button from '@/components/common/M3Button.vue'
import M3TextField from '@/components/common/M3TextField.vue'
import {
  mdiChevronRight,
  mdiDownload,
  mdiPlus,
  mdiPackageVariant,
  mdiAlertCircle,
  mdiCloseCircle,
  mdiMagnify,
  mdiRefresh,
  mdiClose,
  mdiFileDocument
} from '@mdi/js'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const stockFilter = ref('')
const categoryFilter = ref('')
const showItemModal = ref(false)
const showAdjustModal = ref(false)
const editingItem = ref(null)
const adjustingItem = ref(null)
const saving = ref(false)

const itemForm = ref({
  id: '',
  name: '',
  category: '',
  stockLevel: 0,
  unit: '',
  minimumLevel: 10
})

const adjustmentType = ref('add')
const adjustmentAmount = ref(0)
const adjustmentReason = ref('')

const inventory = computed(() => configStore.inventory)

const lowStockItems = computed(() => {
  return inventory.value.filter(item => 
    item.stockLevel <= (item.minimumLevel || 10) && item.stockLevel > 0
  )
})

const outOfStockItems = computed(() => {
  return inventory.value.filter(item => item.stockLevel === 0)
})

const filteredInventory = computed(() => {
  let filtered = inventory.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    )
  }

  // Stock filter
  if (stockFilter.value) {
    switch (stockFilter.value) {
      case 'in-stock':
        filtered = filtered.filter(item => item.stockLevel > (item.minimumLevel || 10))
        break
      case 'low-stock':
        filtered = filtered.filter(item => 
          item.stockLevel <= (item.minimumLevel || 10) && item.stockLevel > 0
        )
        break
      case 'out-of-stock':
        filtered = filtered.filter(item => item.stockLevel === 0)
        break
    }
  }

  // Category filter
  if (categoryFilter.value) {
    filtered = filtered.filter(item => item.category === categoryFilter.value)
  }

  return filtered
})

// Load inventory data
const loadInventory = async () => {
  try {
    await configStore.loadInventory()
  } catch (error) {
    console.error('Error loading inventory:', error)
  }
}

// Get stock status
const getStockStatus = (item) => {
  if (item.stockLevel === 0) return 'out-of-stock'
  if (item.stockLevel <= (item.minimumLevel || 10)) return 'low-stock'
  return 'in-stock'
}

const getStockStatusText = (item) => {
  const status = getStockStatus(item)
  switch (status) {
    case 'out-of-stock': return 'Out of Stock'
    case 'low-stock': return 'Low Stock'
    case 'in-stock': return 'In Stock'
    default: return 'Unknown'
  }
}

// Format category
const formatCategory = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

// Format date
const formatDate = (date) => {
  if (!date) return 'Never'
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleDateString('en-GB')
}

// Modal handlers
const addNewItem = () => {
  editingItem.value = null
  itemForm.value = {
    id: '',
    name: '',
    category: '',
    stockLevel: 0,
    unit: '',
    minimumLevel: 10
  }
  showItemModal.value = true
}

const editItem = (item) => {
  editingItem.value = item
  itemForm.value = { ...item }
  showItemModal.value = true
}

const closeItemModal = () => {
  showItemModal.value = false
  editingItem.value = null
}

const adjustStock = (item) => {
  adjustingItem.value = item
  adjustmentType.value = 'add'
  adjustmentAmount.value = 0
  adjustmentReason.value = ''
  showAdjustModal.value = true
}

const closeAdjustModal = () => {
  showAdjustModal.value = false
  adjustingItem.value = null
}

// Calculate new stock level
const calculateNewStock = () => {
  if (!adjustingItem.value || !adjustmentAmount.value) return adjustingItem.value?.stockLevel || 0
  
  const current = adjustingItem.value.stockLevel
  const amount = adjustmentAmount.value
  
  switch (adjustmentType.value) {
    case 'add':
      return current + amount
    case 'remove':
      return Math.max(0, current - amount)
    case 'set':
      return amount
    default:
      return current
  }
}

// Save item
const saveItem = async () => {
  try {
    saving.value = true
    
    const updatedInventory = [...inventory.value]
    
    if (editingItem.value) {
      // Update existing item
      const index = updatedInventory.findIndex(item => item.id === editingItem.value.id)
      if (index !== -1) {
        updatedInventory[index] = {
          ...itemForm.value,
          lastUpdated: new Date()
        }
      }
    } else {
      // Add new item
      updatedInventory.push({
        ...itemForm.value,
        lastUpdated: new Date()
      })
    }
    
    await configStore.updateInventory(updatedInventory)
    closeItemModal()
    
  } catch (error) {
    console.error('Error saving item:', error)
    alert('Error saving item. Please try again.')
  } finally {
    saving.value = false
  }
}

// Save stock adjustment
const saveStockAdjustment = async () => {
  try {
    saving.value = true
    
    const updatedInventory = [...inventory.value]
    const index = updatedInventory.findIndex(item => item.id === adjustingItem.value.id)
    
    if (index !== -1) {
      updatedInventory[index] = {
        ...updatedInventory[index],
        stockLevel: calculateNewStock(),
        lastUpdated: new Date()
      }
      
      await configStore.updateInventory(updatedInventory)
      closeAdjustModal()
      
      // Log the adjustment (could be stored in a separate collection)
      console.log('Stock adjustment:', {
        itemId: adjustingItem.value.id,
        type: adjustmentType.value,
        amount: adjustmentAmount.value,
        reason: adjustmentReason.value,
        timestamp: new Date()
      })
    }
    
  } catch (error) {
    console.error('Error adjusting stock:', error)
    alert('Error adjusting stock. Please try again.')
  } finally {
    saving.value = false
  }
}

// Other actions
const refreshInventory = () => {
  loadInventory()
}

const exportInventory = () => {
  console.log('Export inventory to CSV')
}

// Download inventory PDF report
const downloadInventoryPDF = async () => {
  try {
    await apiService.generateReportPDF('inventory_report', '', '', authStore.user.uid)
  } catch (error) {
    console.error('Error downloading inventory PDF:', error)
    alert('Error generating PDF report. Please try again.')
  }
}

onMounted(() => {
  loadInventory()
})
</script>

<style scoped>
.inventory-page {
  min-height: 100vh;
  background: #F7F9FC;
}

.page-header {
  background: white;
  padding: 24px 32px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.breadcrumb-link {
  color: #0066B2;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-current {
  color: #6B7280;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #0066B2;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.inventory-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card.total-items .stat-icon {
  background: linear-gradient(135deg, #0066B2 0%, #0052A3 100%);
  color: white;
}

.stat-card.low-stock .stat-icon {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
}

.stat-card.out-of-stock .stat-icon {
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #1F2937;
}

.search-filters {
  display: flex;
  gap: 24px;
  padding: 0 32px 32px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.search-section {
  flex: 1;
  max-width: 400px;
}

.filter-section {
  display: flex;
  gap: 16px;
}

.filter-select {
  padding: 12px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #0066B2;
}

.inventory-table-container {
  background: white;
  border-radius: 12px;
  margin: 0 32px 32px 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  padding: 24px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.table-wrapper {
  overflow-x: auto;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table th,
.inventory-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #F3F4F6;
}

.inventory-table th {
  background: #F9FAFB;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.inventory-table td {
  font-size: 14px;
  color: #1F2937;
}

.item-name {
  font-weight: 500;
}

.stock-level {
  font-weight: 600;
}

.category-badge,
.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.category-badge.medication {
  background: #DBEAFE;
  color: #1E40AF;
}

.category-badge.supplies {
  background: #D1FAE5;
  color: #065F46;
}

.category-badge.equipment {
  background: #FEF3C7;
  color: #92400E;
}

.status-badge.in-stock {
  background: #D1FAE5;
  color: #065F46;
}

.status-badge.low-stock {
  background: #FEF3C7;
  color: #92400E;
}

.status-badge.out-of-stock {
  background: #FEE2E2;
  color: #991B1B;
}

.actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  color: #6B7280;
  font-style: italic;
  padding: 40px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.item-modal,
.adjust-modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background: #F3F4F6;
}

.item-form,
.adjust-form {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-select {
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: #0066B2;
}

.current-stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 24px;
}

.current-stock label {
  font-weight: 500;
  color: #374151;
}

.stock-value {
  font-weight: 600;
  color: #0066B2;
  font-size: 18px;
}

.adjustment-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.adjustment-type label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
  display: block;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-option input[type="radio"] {
  margin: 0;
}

.new-stock-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #EBF8FF;
  border-radius: 8px;
  margin-bottom: 24px;
}

.new-stock-preview label {
  font-weight: 500;
  color: #374151;
}

.preview-value {
  font-weight: 600;
  color: #0066B2;
  font-size: 18px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .inventory-stats,
  .search-filters {
    padding: 16px;
  }

  .inventory-table-container {
    margin: 0 16px 16px 16px;
  }

  .search-filters {
    flex-direction: column;
    gap: 16px;
  }

  .filter-section {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .radio-group {
    flex-direction: column;
  }
}
</style>