<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-surface-dark rounded-lg p-8 max-w-md w-full shadow-xl">
      <h2 class="text-xl font-bold text-text-light mb-4">{{ department.name }}</h2>
      <div class="space-y-4">
        <div v-for="user in users" :key="user.id" class="flex justify-between items-center">
          <div>
            <p class="font-semibold">{{ user.fullName }}</p>
            <p class="text-sm text-text-muted">{{ user.role }}</p>
          </div>
          <button @click="openEditUserForm(user)" class="px-4 py-2 rounded-lg text-background-dark bg-primary hover:bg-primary-hover">
            Edit
          </button>
        </div>
      </div>
      <div class="flex justify-end space-x-4 mt-6">
        <button @click="$emit('close')" class="px-4 py-2 rounded-lg text-text-light bg-surface-dark hover:bg-gray-600">Close</button>
      </div>
    </div>
    <EditUserForm
      v-if="selectedUser"
      :user="selectedUser"
      @close="closeEditUserForm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import EditUserForm from './EditUserForm.vue';

const props = defineProps({
  department: {
    type: Object,
    required: true,
  },
  users: {
    type: Array,
    required: true,
  },
});

const selectedUser = ref(null);

const openEditUserForm = (user) => {
  selectedUser.value = user;
};

const closeEditUserForm = () => {
  selectedUser.value = null;
};
</script>
