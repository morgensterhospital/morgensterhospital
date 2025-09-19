<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-surface-dark rounded-lg shadow-lg p-6 w-full max-w-lg">
      <h2 class="text-2xl font-semibold text-text-light mb-4">Edit User</h2>
      <form @submit.prevent="updateUser">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input v-model="form.name" type="text" placeholder="Name" class="p-2 bg-background-dark rounded text-text-light"/>
          <input v-model="form.surname" type="text" placeholder="Surname" class="p-2 bg-background-dark rounded text-text-light"/>
          <input v-model="form.idNumber" type="text" placeholder="ID Number" class="p-2 bg-background-dark rounded text-text-light"/>
          <input v-model="form.phoneNumber" type="text" placeholder="Phone Number" class="p-2 bg-background-dark rounded text-text-light"/>
        </div>
        <input v-model="form.password" type="password" placeholder="New Password" class="w-full mt-4 p-2 bg-background-dark rounded text-text-light"/>
        <div class="mt-6 flex justify-end space-x-4">
          <button type="button" @click="close" class="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-primary text-white rounded">Update</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: Boolean,
  user: Object,
});

const emit = defineEmits(['close', 'update']);

const form = ref({
  name: '',
  surname: '',
  idNumber: '',
  phoneNumber: '',
  password: '',
});

watch(() => props.user, (newUser) => {
  if (newUser) {
    form.value = {
      name: newUser.name || '',
      surname: newUser.surname || '',
      idNumber: newUser.idNumber || '',
      phoneNumber: newUser.phoneNumber || '',
      password: '',
    };
  }
});

const updateUser = () => {
  emit('update', { ...props.user, ...form.value });
};

const close = () => {
  emit('close');
};
</script>

<style scoped>
</style>
