<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-surface-dark rounded-lg p-8 max-w-md w-full shadow-xl">
      <h2 class="text-xl font-bold text-text-light mb-4">Add Department</h2>
      <form @submit.prevent="addDepartment">
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-text-muted">Department Name</label>
            <input type="text" id="name" v-model="form.name" class="mt-1 w-full p-2 bg-background-dark border border-gray-600 rounded-lg" />
          </div>
        </div>
        <div class="flex justify-end space-x-4 mt-6">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-lg text-text-light bg-surface-dark hover:bg-gray-600">Cancel</button>
          <button type="submit" class="px-4 py-2 rounded-lg text-background-dark bg-primary hover:bg-primary-hover">Add</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

const emit = defineEmits(['close']);

const form = ref({
  name: '',
});

const addDepartment = async () => {
  await addDoc(collection(db, 'departments'), {
    name: form.value.name,
    userCount: 0,
  });
  emit('close');
};
</script>
