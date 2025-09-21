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
              <p class="text-text-light">{{ user.fullName }}</p>
              <p class="text-sm text-text-muted">{{ user.email }}</p>
            </div>
            <button @click="editUser(user)" class="px-4 py-1 bg-primary text-white rounded-md hover:bg-primary-dark">Edit</button>
          </li>
        </ul>
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

const emit = defineEmits(['close', 'edit']);

const close = () => {
  emit('close');
};

const editUser = (user) => {
  emit('edit', user);
};
</script>

<style scoped>
</style>
