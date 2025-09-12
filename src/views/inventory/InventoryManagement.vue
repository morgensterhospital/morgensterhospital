<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold">Inventory Management</h1>
        <p class="text-text-muted">Manage your hospital's inventory, track stock levels, and add new items.</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportInventory" class="px-4 py-2 bg-surface-dark border border-gray-700 rounded-lg flex items-center gap-2 hover:bg-primary/20">
          <MdiIcon :path="mdiDownload" size="20" />
          <span>Export</span>
        </button>
        <button @click="downloadInventoryPDF" class="px-4 py-2 bg-surface-dark border border-gray-700 rounded-lg flex items-center gap-2 hover:bg-primary/20">
          <MdiIcon :path="mdiFileDocument" size="20" />
          <span>Download PDF</span>
        </button>
        <button @click="addNewItem" class="px-4 py-2 bg-primary text-background-dark font-bold rounded-lg flex items-center gap-2 hover:bg-primary-hover">
          <MdiIcon :path="mdiPlus" size="20" />
          <span>Add Item</span>
        </button>
      </div>
    </div>

    <!-- Inventory Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 bg-surface-dark rounded-lg flex items-center gap-6">
        <MdiIcon :path="mdiPackageVariant" size="32" class="text-primary" />
        <div>
          <p class="text-text-muted">Total Items</p>
          <p class="text-3xl font-bold">{{ inventory.length }}</p>
        </div>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg flex items-center gap-6">
        <MdiIcon :path="mdiAlertCircle" size="32" class="text-yellow-400" />
        <div>
          <p class="text-text-muted">Low Stock</p>
          <p class="text-3xl font-bold">{{ lowStockItems.length }}</p>
        </div>
      </div>
      <div class="p-6 bg-surface-dark rounded-lg flex items-center gap-6">
        <MdiIcon :path="mdiCloseCircle" size="32" class="text-red-500" />
        <div>
          <p class="text-text-muted">Out of Stock</p>
          <p class="text-3xl font-bold">{{ outOfStockItems.length }}</p>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-surface-dark p-4 rounded-lg flex flex-col md:flex-row gap-4">
      <div class="relative flex-grow">
        <input v-model="searchQuery" type="text" placeholder="Search items by name or ID..." class="w-full bg-background-dark border-gray-700 rounded-md py-2 pl-10 pr-4 focus:ring-primary focus:border-primary" />
        <MdiIcon :path="mdiMagnify" size="20" class="absolute left-3 top-2.5 text-text-muted" />
      </div>
      <select v-model="stockFilter" class="bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary">
        <option value="">All Stock Levels</option>
        <option value="in-stock">In Stock</option>
        <option value="low-stock">Low Stock</option>
        <option value="out-of-stock">Out of Stock</option>
      </select>
      <select v-model="categoryFilter" class="bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary">
        <option value="">All Categories</option>
        <option value="medication">Medications</option>
        <option value="supplies">Medical Supplies</option>
        <option value="equipment">Equipment</option>
      </select>
      <button @click="refreshInventory" class="px-4 py-2 bg-surface-dark border border-gray-700 rounded-lg flex items-center gap-2 hover:bg-primary/20">
        <MdiIcon :path="mdiRefresh" size="20" />
        <span>Refresh</span>
      </button>
    </div>

    <!-- Inventory Table -->
    <div class="bg-surface-dark rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-background-dark">
            <tr>
              <th class="p-3 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">Item ID</th>
              <th class="p-3 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">Item Name</th>
              <th class="p-3 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">Category</th>
              <th class="p-3 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">Stock</th>
              <th class="p-3 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">Unit</th>
              <th class="p-3 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">Min. Level</th>
              <th class="p-3 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">Status</th>
              <th class="p-3 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">Last Updated</th>
              <th class="p-3 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr v-for="item in filteredInventory" :key="item.id" class="hover:bg-background-dark/50">
              <td class="p-3 text-sm">{{ item.id }}</td>
              <td class="p-3 font-medium">{{ item.name }}</td>
              <td class="p-3">
                <span :class="categoryBadgeClass(item.category)">{{ formatCategory(item.category) }}</span>
              </td>
              <td class="p-3 font-semibold">{{ item.stockLevel }}</td>
              <td class="p-3">{{ item.unit }}</td>
              <td class="p-3">{{ item.minimumLevel || 10 }}</td>
              <td class="p-3">
                <span :class="stockStatusBadgeClass(getStockStatus(item))">{{ getStockStatusText(item) }}</span>
              </td>
              <td class="p-3 text-sm text-text-muted">{{ formatDate(item.lastUpdated) }}</td>
              <td class="p-3">
                <div class="flex gap-2">
                  <button @click="editItem(item)" class="p-1 text-text-muted hover:text-primary"><MdiIcon :path="mdiPencil" size="18" /></button>
                  <button @click="adjustStock(item)" class="p-1 text-text-muted hover:text-primary"><MdiIcon :path="mdiTune" size="18" /></button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredInventory.length === 0">
              <td colspan="9" class="p-6 text-center text-text-muted">No items found matching your criteria.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Item Modal -->
    <div v-if="showItemModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" @click="closeItemModal">
      <div class="bg-surface-dark rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" @click.stop>
        <div class="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 class="text-xl font-bold">{{ editingItem ? 'Edit Item' : 'Add New Item' }}</h3>
          <button @click="closeItemModal" class="p-1 rounded-full hover:bg-gray-700"><MdiIcon :path="mdiClose" size="20" /></button>
        </div>
        <form @submit.prevent="saveItem" class="p-6 overflow-y-auto space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input v-model="itemForm.id" type="text" placeholder="Item ID" :readonly="editingItem" class="w-full bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary" required />
            <input v-model="itemForm.name" type="text" placeholder="Item Name" class="w-full bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary" required />
            <select v-model="itemForm.category" class="w-full bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary" required>
              <option value="">Select Category</option>
              <option value="medication">Medication</option>
              <option value="supplies">Medical Supplies</option>
              <option value="equipment">Equipment</option>
            </select>
            <input v-model.number="itemForm.stockLevel" type="number" min="0" placeholder="Current Stock" class="w-full bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary" required />
            <input v-model="itemForm.unit" type="text" placeholder="Unit (e.g., tablets, boxes)" class="w-full bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary" required />
            <input v-model.number="itemForm.minimumLevel" type="number" min="0" placeholder="Minimum Level" class="w-full bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary" required />
          </div>
          <div class="pt-4 border-t border-gray-700 flex justify-end gap-3">
            <button type="button" @click="closeItemModal" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary text-background-dark font-bold rounded-lg hover:bg-primary-hover disabled:opacity-50">{{ saving ? 'Saving...' : (editingItem ? 'Update' : 'Add') + ' Item' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Stock Adjustment Modal -->
    <div v-if="showAdjustModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" @click="closeAdjustModal">
      <div class="bg-surface-dark rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" @click.stop>
        <div class="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 class="text-xl font-bold">Adjust Stock: {{ adjustingItem?.name }}</h3>
          <button @click="closeAdjustModal" class="p-1 rounded-full hover:bg-gray-700"><MdiIcon :path="mdiClose" size="20" /></button>
        </div>
        <form @submit.prevent="saveStockAdjustment" class="p-6 overflow-y-auto space-y-4">
            <div class="p-4 bg-background-dark rounded-lg flex justify-between items-center">
                <span class="text-text-muted">Current Stock:</span>
                <span class="font-bold text-lg">{{ adjustingItem?.stockLevel }} {{ adjustingItem?.unit }}</span>
            </div>
            <div class="space-y-2">
                <label class="text-sm font-medium">Adjustment Type</label>
                <div class="flex gap-4">
                    <label class="flex items-center gap-2"><input type="radio" v-model="adjustmentType" value="add" class="text-primary focus:ring-primary" /> Add</label>
                    <label class="flex items-center gap-2"><input type="radio" v-model="adjustmentType" value="remove" class="text-primary focus:ring-primary" /> Remove</label>
                    <label class="flex items-center gap-2"><input type="radio" v-model="adjustmentType" value="set" class="text-primary focus:ring-primary" /> Set</label>
                </div>
            </div>
            <input v-model.number="adjustmentAmount" type="number" min="0" :placeholder="adjustmentType === 'set' ? 'New Stock Level' : 'Adjustment Amount'" class="w-full bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary" required />
            <textarea v-model="adjustmentReason" placeholder="Reason for adjustment..." rows="3" class="w-full bg-background-dark border-gray-700 rounded-md py-2 px-4 focus:ring-primary focus:border-primary" required></textarea>
            <div class="p-4 bg-primary/20 text-primary rounded-lg flex justify-between items-center">
                <span class="font-medium">New Stock Level:</span>
                <span class="font-bold text-lg">{{ calculateNewStock() }} {{ adjustingItem?.unit }}</span>
            </div>
            <div class="pt-4 border-t border-gray-700 flex justify-end gap-3">
              <button type="button" @click="closeAdjustModal" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
              <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary text-background-dark font-bold rounded-lg hover:bg-primary-hover disabled:opacity-50">{{ saving ? 'Adjusting...' : 'Apply Adjustment' }}</button>
            </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfigStore } from '@/stores/configStore';
import { useAuthStore } from '@/stores/authStore';
import apiService from '@/services/api';
import MdiIcon from '@/components/common/MdiIcon.vue';
import {
  mdiDownload,
  mdiPlus,
  mdiPackageVariant,
  mdiAlertCircle,
  mdiCloseCircle,
  mdiMagnify,
  mdiRefresh,
  mdiClose,
  mdiFileDocument,
  mdiPencil,
  mdiTune,
} from '@mdi/js';

const router = useRouter();
const configStore = useConfigStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const stockFilter = ref('');
const categoryFilter = ref('');
const showItemModal = ref(false);
const showAdjustModal = ref(false);
const editingItem = ref(null);
const adjustingItem = ref(null);
const saving = ref(false);

const itemForm = ref({
  id: '',
  name: '',
  category: '',
  stockLevel: 0,
  unit: '',
  minimumLevel: 10,
});

const adjustmentType = ref('add');
const adjustmentAmount = ref(0);
const adjustmentReason = ref('');

const inventory = computed(() => configStore.inventory);

const lowStockItems = computed(() => {
  return inventory.value.filter(item => 
    item.stockLevel <= (item.minimumLevel || 10) && item.stockLevel > 0
  );
});

const outOfStockItems = computed(() => {
  return inventory.value.filter(item => item.stockLevel === 0);
});

const filteredInventory = computed(() => {
  let filtered = inventory.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    );
  }

  if (stockFilter.value) {
    switch (stockFilter.value) {
      case 'in-stock':
        filtered = filtered.filter(item => item.stockLevel > (item.minimumLevel || 10));
        break;
      case 'low-stock':
        filtered = filtered.filter(item => 
          item.stockLevel <= (item.minimumLevel || 10) && item.stockLevel > 0
        );
        break;
      case 'out-of-stock':
        filtered = filtered.filter(item => item.stockLevel === 0);
        break;
    }
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(item => item.category === categoryFilter.value);
  }

  return filtered;
});

const loadInventory = async () => {
  try {
    await configStore.loadInventory();
  } catch (error) {
    console.error('Error loading inventory:', error);
  }
};

const getStockStatus = (item) => {
  if (item.stockLevel === 0) return 'out-of-stock';
  if (item.stockLevel <= (item.minimumLevel || 10)) return 'low-stock';
  return 'in-stock';
};

const getStockStatusText = (item) => {
  const status = getStockStatus(item);
  switch (status) {
    case 'out-of-stock': return 'Out of Stock';
    case 'low-stock': return 'Low Stock';
    case 'in-stock': return 'In Stock';
    default: return 'Unknown';
  }
};

const stockStatusBadgeClass = (status) => {
  return {
    'bg-green-500/20 text-green-400': status === 'in-stock',
    'bg-yellow-500/20 text-yellow-400': status === 'low-stock',
    'bg-red-500/20 text-red-400': status === 'out-of-stock',
    'px-3 py-1 text-xs font-semibold rounded-full': true,
  };
};

const formatCategory = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const categoryBadgeClass = (category) => {
  return {
    'bg-blue-500/20 text-blue-400': category === 'medication',
    'bg-teal-500/20 text-teal-400': category === 'supplies',
    'bg-indigo-500/20 text-indigo-400': category === 'equipment',
    'px-3 py-1 text-xs font-semibold rounded-full': true,
  };
};

const formatDate = (date) => {
  if (!date) return 'Never';
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return dateObj.toLocaleDateString('en-US', { dateStyle: 'medium' });
};

const addNewItem = () => {
  editingItem.value = null;
  itemForm.value = { id: '', name: '', category: '', stockLevel: 0, unit: '', minimumLevel: 10 };
  showItemModal.value = true;
};

const editItem = (item) => {
  editingItem.value = item;
  itemForm.value = { ...item };
  showItemModal.value = true;
};

const closeItemModal = () => {
  showItemModal.value = false;
  editingItem.value = null;
};

const adjustStock = (item) => {
  adjustingItem.value = item;
  adjustmentType.value = 'add';
  adjustmentAmount.value = 0;
  adjustmentReason.value = '';
  showAdjustModal.value = true;
};

const closeAdjustModal = () => {
  showAdjustModal.value = false;
  adjustingItem.value = null;
};

const calculateNewStock = () => {
  if (!adjustingItem.value || adjustmentAmount.value === null) return adjustingItem.value?.stockLevel || 0;
  const current = Number(adjustingItem.value.stockLevel);
  const amount = Number(adjustmentAmount.value);
  switch (adjustmentType.value) {
    case 'add': return current + amount;
    case 'remove': return Math.max(0, current - amount);
    case 'set': return amount;
    default: return current;
  }
};

const saveItem = async () => {
  saving.value = true;
  try {
    const updatedInventory = [...inventory.value];
    const itemData = { ...itemForm.value, lastUpdated: new Date() };
    if (editingItem.value) {
      const index = updatedInventory.findIndex(item => item.id === editingItem.value.id);
      if (index !== -1) updatedInventory[index] = itemData;
    } else {
      updatedInventory.push(itemData);
    }
    await configStore.updateInventory(updatedInventory);
    closeItemModal();
  } catch (error) {
    console.error('Error saving item:', error);
    alert('Error saving item. Please try again.');
  } finally {
    saving.value = false;
  }
};

const saveStockAdjustment = async () => {
  saving.value = true;
  try {
    const updatedInventory = [...inventory.value];
    const index = updatedInventory.findIndex(item => item.id === adjustingItem.value.id);
    if (index !== -1) {
      updatedInventory[index].stockLevel = calculateNewStock();
      updatedInventory[index].lastUpdated = new Date();
      await configStore.updateInventory(updatedInventory);
      closeAdjustModal();
      console.log('Stock adjustment:', {
        itemId: adjustingItem.value.id,
        type: adjustmentType.value,
        amount: adjustmentAmount.value,
        reason: adjustmentReason.value,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error('Error adjusting stock:', error);
    alert('Error adjusting stock. Please try again.');
  } finally {
    saving.value = false;
  }
};

const refreshInventory = () => {
  loadInventory();
};

const exportInventory = () => {
  console.log('Export inventory to CSV');
};

const downloadInventoryPDF = async () => {
  try {
    await apiService.generateReportPDF('inventory_report', '', '', authStore.user.uid);
  } catch (error) {
    console.error('Error downloading inventory PDF:', error);
    alert('Error generating PDF report. Please try again.');
  }
};

onMounted(() => {
  loadInventory();
});
</script>

<style scoped>
/* All styles are handled by Tailwind CSS utility classes */
</style>