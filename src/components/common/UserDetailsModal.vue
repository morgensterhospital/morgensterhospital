<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-surface-dark rounded-lg shadow-lg p-6 w-full max-w-2xl">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-text-light">{{ department }}</h2>
        <button @click="close" class="text-text-muted hover:text-text-light">&times;</button>
      </div>
      <div class="overflow-y-auto max-h-96">
        <ul>
          <li v-for="user in users" :key="user.uid" class="flex justify-between items-center py-2 border-b border-gray-700">
            <div>
              <p class="text-text-light">{{ user.name }} {{ user.surname }}</p>
              <p class="text-sm text-text-muted">{{ user.email }}</p>
            </div>
            <div class="space-x-2">
              <button @click="editUser(user)" class="px-4 py-1 bg-primary text-white rounded-md hover:bg-primary-dark">Edit</button>
              <button @click="deleteUser(user)" class="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
          </li>
        </ul>
      </div>
      <div class="mt-6 flex justify-end">
        <button @click="addUser" class="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark">Add User</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: Boolean,
  department: String,
  users: Array,
});

const emit = defineEmits(['close', 'edit', 'delete-user', 'add-user']);

const close = () => {
  emit('close');
};

const editUser = (user) => {
  emit('edit', user);
};

const deleteUser = (user) => {
  emit('delete-user', user);
};

const addUser = () => {
  emit('add-user');
};
</script>

<style scoped>
</style>
