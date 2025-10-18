<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    <div class="glass-card p-8 rounded-lg shadow-lg w-full max-w-4xl">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-primary flex items-center">
          <MdiIcon :path="mdiAccountGroup" size="28" class="mr-3" />
          {{ department }}
        </h2>
        <button @click="close" class="text-text-muted hover:text-white text-3xl">&times;</button>
      </div>
      <div class="overflow-y-auto max-h-[60vh] pr-4">
        <ul class="space-y-4">
          <li v-for="user in users" :key="user.uid" class="bg-surface-dark/50 p-4 rounded-lg flex justify-between items-center transition-all duration-300 hover:bg-surface-dark/80">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-primary/20 text-primary mr-4">
                <MdiIcon :path="mdiAccount" size="24" />
              </div>
              <div>
                <p class="text-lg font-semibold text-text-light">{{ user.name }} {{ user.surname }}</p>
                <p class="text-sm text-text-muted">{{ user.email }}</p>
                <p class="text-xs text-accent">{{ user.role }}</p>
              </div>
            </div>
            <div class="space-x-2">
              <button @click="editUser(user)" class="futuristic-button !px-4 !py-1 text-sm">
                <MdiIcon :path="mdiPencil" size="16" />
              </button>
              <button @click="deleteUser(user)" class="futuristic-button !bg-red-500 hover:!bg-red-600 !px-4 !py-1 text-sm">
                <MdiIcon :path="mdiTrashCan" size="16" />
              </button>
            </div>
          </li>
        </ul>
        <p v-if="!users.length" class="text-center text-text-muted py-8">No users in this department yet.</p>
      </div>
      <div class="mt-8 flex justify-end">
        <button @click="addUser" class="futuristic-button">
          <MdiIcon :path="mdiAccountPlus" size="20" class="mr-2" />
          Add User
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import MdiIcon from './MdiIcon.vue';
import { mdiAccountGroup, mdiAccount, mdiPencil, mdiTrashCan, mdiAccountPlus } from '@mdi/js';

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
