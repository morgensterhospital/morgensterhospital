<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    <div class="glass-card p-8 rounded-lg shadow-lg w-full max-w-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-primary flex items-center">
          <MdiIcon :path="mdiOfficeBuildingPlus" size="28" class="mr-3" />
          Add New Department
        </h2>
        <button @click="close" class="text-text-muted hover:text-white">&times;</button>
      </div>
      <div>
        <label for="departmentName" class="block text-sm font-medium text-text-muted mb-2">Department Name</label>
        <div class="relative">
          <MdiIcon :path="mdiOfficeBuilding" size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            v-model="departmentName"
            type="text"
            id="departmentName"
            placeholder="e.g., Cardiology"
            class="w-full pl-10 pr-4 py-3 bg-background-dark border border-border-futuristic rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
      <div class="mt-8 flex justify-end space-x-4">
        <button @click="close" class="px-6 py-2 text-text-muted rounded-md hover:bg-surface-dark">Cancel</button>
        <button @click="createDepartment" class="futuristic-button">
          <MdiIcon :path="mdiCheck" size="20" class="mr-2" />
          Create
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(['close', 'create']);

const departmentName = ref('');

const close = () => {
  emit('close');
};

const createDepartment = () => {
  emit('create', departmentName.value);
  departmentName.value = '';
};
</script>

<style scoped>
</style>
