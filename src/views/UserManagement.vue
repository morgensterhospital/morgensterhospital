<template>
  <div class="p-6 bg-background-dark min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-text-light">User Management</h1>
      <button class="px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition-colors">
        Add Department
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="(group, department) in groupedUsers" :key="department"
        class="bg-surface-dark rounded-lg shadow-lg p-5 flex flex-col justify-between cursor-pointer hover:shadow-primary/50 transition-shadow border border-transparent hover:border-primary"
        @click="openDepartmentModal(department, group)">
        <div class="flex items-center mb-4">
          <MdiIcon :path="departmentIcons[department] || mdiAccountGroup" size="32" class="text-primary mr-4" />
          <div>
            <h2 class="text-xl font-semibold text-primary mb-1">{{ department }}</h2>
            <p class="text-text-muted">{{ group.length }} user(s)</p>
          </div>
        </div>
      </div>
    </div>

    <UserDetailsModal
      :show="isModalVisible"
      :department="selectedDepartment"
      :users="selectedUsers"
      @close="closeModal"
      @edit="openEditUserForm"
    />

    <UserEditForm
      :show="isEditFormVisible"
      :user="editingUser"
      @close="closeEditForm"
      @update="handleUpdateUser"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import UserDetailsModal from '@/components/common/UserDetailsModal.vue';
import UserEditForm from '@/components/common/UserEditForm.vue';
import MdiIcon from '@/components/common/MdiIcon.vue';
import { mdiAccountGroup, mdiDoctor, mdiNurse, mdiPill, mdiCashMultiple, mdiDna } from '@mdi/js';

const departmentIcons = {
  'Administration': mdiAccountGroup,
  'Doctors': mdiDoctor,
  'Nurses': mdiNurse,
  'Pharmacy': mdiPill,
  'Accounts': mdiCashMultiple,
  'Laboratory': mdiDna,
  // Add other departments and their icons as needed
};

const users = ref([]);
const groupedUsers = ref({});
const isModalVisible = ref(false);
const selectedDepartment = ref('');
const selectedUsers = ref([]);
const isEditFormVisible = ref(false);
const editingUser = ref(null);

const fetchUsers = async () => {
  const db = getFirestore();
  const usersCollection = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCollection);
  users.value = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  groupUsersByDepartment();
};

const groupUsersByDepartment = () => {
  const groups = {};
  users.value.forEach(user => {
    const department = user.department || 'No Department';
    if (!groups[department]) {
      groups[department] = [];
    }
    groups[department].push(user);
  });
  groupedUsers.value = groups;
};

const openDepartmentModal = (department, userList) => {
  selectedDepartment.value = department;
  selectedUsers.value = userList;
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};

const openEditUserForm = (user) => {
  editingUser.value = user;
  isEditFormVisible.value = true;
  closeModal();
};

const closeEditForm = () => {
  isEditFormVisible.value = false;
  editingUser.value = null;
};

const handleUpdateUser = async (updatedUser) => {
  try {
    const response = await fetch('/.netlify/functions/update-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    // Refresh the user list to show the updated data
    await fetchUsers();
    console.log('User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    closeEditForm();
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
</style>
