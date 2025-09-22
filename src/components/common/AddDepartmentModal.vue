<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-surface-dark rounded-lg shadow-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-text-light">Add Department</h2>
        <button @click="close" class="text-text-muted hover:text-text-light">&times;</button>
      </div>
      <div>
        <label for="departmentName" class="block text-sm font-medium text-text-muted">Department Name</label>
        <input
          v-model="departmentName"
          type="text"
          id="departmentName"
          class="mt-1 block w-full bg-background-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>
      <div class="mt-6 flex justify-end">
        <button @click="close" class="px-4 py-2 text-text-muted rounded-md mr-2">Cancel</button>
        <button @click="createDepartment" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Create</button>
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
