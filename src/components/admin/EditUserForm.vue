<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-surface-dark rounded-lg p-8 max-w-md w-full shadow-xl">
      <h2 class="text-xl font-bold text-text-light mb-4">Edit User</h2>
      <form @submit.prevent="updateUser">
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-text-muted">Name</label>
            <input type="text" id="name" v-model="form.name" class="mt-1 w-full p-2 bg-background-dark border border-gray-600 rounded-lg" />
          </div>
          <div>
            <label for="surname" class="block text-sm font-medium text-text-muted">Surname</label>
            <input type="text" id="surname" v-model="form.surname" class="mt-1 w-full p-2 bg-background-dark border border-gray-600 rounded-lg" />
          </div>
          <div>
            <label for="idNumber" class="block text-sm font-medium text-text-muted">ID Number</label>
            <input type="text" id="idNumber" v-model="form.idNumber" class="mt-1 w-full p-2 bg-background-dark border border-gray-600 rounded-lg" />
          </div>
          <div>
            <label for="phone" class="block text-sm font-medium text-text-muted">Phone Number</label>
            <input type="text" id="phone" v-model="form.phone" class="mt-1 w-full p-2 bg-background-dark border border-gray-600 rounded-lg" />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-text-muted">Password</label>
            <input type="password" id="password" v-model="form.password" class="mt-1 w-full p-2 bg-background-dark border border-gray-600 rounded-lg" />
          </div>
        </div>
        <div class="flex justify-end space-x-4 mt-6">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-lg text-text-light bg-surface-dark hover:bg-gray-600">Cancel</button>
          <button type="submit" class="px-4 py-2 rounded-lg text-background-dark bg-primary hover:bg-primary-hover">Update</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import api from '@/services/api';

const emit = defineEmits(['close']);

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const form = ref({
  name: props.user.fullName.split(' ')[0],
  surname: props.user.fullName.split(' ')[1],
  idNumber: props.user.idNumber,
  phone: props.user.phone,
  password: '',
});

const updateUser = async () => {
  const userRef = doc(db, 'users', props.user.id);
  await updateDoc(userRef, {
    fullName: `${form.value.name} ${form.value.surname}`,
    idNumber: form.value.idNumber,
    phone: form.value.phone,
  });

  if (form.value.password) {
    await api.post('/update-user-password', {
      uid: props.user.id,
      password: form.value.password,
    });
  }

  emit('close');
};
</script>
