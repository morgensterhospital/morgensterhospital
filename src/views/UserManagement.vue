<template>
  <div class="p-6 bg-background-dark min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-text-light">User Management</h1>
      <button @click="openAddDepartmentModal" class="px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition-colors">
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
      @edit-department="openEditDepartmentModal"
    />

    <EditDepartmentModal
      :show="isEditDepartmentModalVisible"
      :department="selectedDepartment"
      :users="selectedUsers"
      @close="closeEditDepartmentModal"
      @delete-user="handleDeleteUser"
      @add-user="openAddUserModal"
    />

    <AddUserToDepartmentModal
      :show="isAddUserModalVisible"
      :department="selectedDepartment"
      @close="closeAddUserModal"
      @create-user="handleCreateUser"
    />

    <UserEditForm
      :show="isEditFormVisible"
      :user="editingUser"
      @close="closeEditForm"
      @update="handleUpdateUser"
    />

    <AddDepartmentModal
      :show="isAddDepartmentModalVisible"
      @close="closeAddDepartmentModal"
      @create="handleCreateDepartment"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useNotification } from '@/stores/notificationStore';
import UserDetailsModal from '@/components/common/UserDetailsModal.vue';
import UserEditForm from '@/components/common/UserEditForm.vue';
import AddDepartmentModal from '@/components/common/AddDepartmentModal.vue';
import EditDepartmentModal from '@/components/common/EditDepartmentModal.vue';
import AddUserToDepartmentModal from '@/components/common/AddUserToDepartmentModal.vue';
import MdiIcon from '@/components/common/MdiIcon.vue';
import { mdiAccountGroup, mdiDoctor, mdiMedicalBag, mdiPill, mdiCashMultiple, mdiDna } from '@mdi/js';

const departmentIcons = {
  'Administration': mdiAccountGroup,
  'Doctors': mdiDoctor,
  'Nurses': mdiMedicalBag,
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
const isAddDepartmentModalVisible = ref(false);
const isEditDepartmentModalVisible = ref(false);
const isAddUserModalVisible = ref(false);
const notificationStore = useNotification();

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

const openAddDepartmentModal = () => {
  isAddDepartmentModalVisible.value = true;
};

const closeAddDepartmentModal = () => {
  isAddDepartmentModalVisible.value = false;
};

const handleCreateDepartment = async (departmentName) => {
  if (!departmentName) {
    // TODO: Show some feedback to the user
    return;
  }
  try {
    const response = await fetch('/.netlify/functions/create-department', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: departmentName }),
    });

    if (!response.ok) {
      throw new Error('Failed to create department');
    }

    await fetchUsers(); // This will also re-group the departments
  } catch (error) {
    console.error('Error creating department:', error);
  } finally {
    closeAddDepartmentModal();
  }
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

const openEditDepartmentModal = () => {
  isModalVisible.value = false;
  isEditDepartmentModalVisible.value = true;
};

const closeEditDepartmentModal = () => {
  isEditDepartmentModalVisible.value = false;
};

const handleDeleteUser = async (user) => {
  try {
    const response = await fetch('/.netlify/functions/delete-user-from-department', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    if (!response.ok) throw new Error('Failed to delete user');

    notificationStore.showNotification('User deleted successfully', 'success');
    await fetchUsers();

    // Find the updated user list for the selected department
    const updatedUserList = groupedUsers.value[selectedDepartment.value] || [];
    if (updatedUserList.length === 0) {
      closeEditDepartmentModal();
    } else {
      selectedUsers.value = updatedUserList;
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    notificationStore.showNotification('Failed to delete user', 'error');
  }
};

const openAddUserModal = () => {
  isEditDepartmentModalVisible.value = false;
  isAddUserModalVisible.value = true;
};

const closeAddUserModal = () => {
  isAddUserModalVisible.value = false;
  isEditDepartmentModalVisible.value = true;
};

const handleCreateUser = async (userData) => {
  try {
    const response = await fetch('/.netlify/functions/add-user-to-department', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');

    notificationStore.showNotification('User created successfully', 'success');
    await fetchUsers();
    selectedUsers.value = groupedUsers.value[selectedDepartment.value] || [];
  } catch (error) {
    console.error('Error creating user:', error);
    notificationStore.showNotification('Failed to create user', 'error');
  } finally {
    isAddUserModalVisible.value = false;
    isEditDepartmentModalVisible.value = true;
  }
};
</script>

<style scoped>
</style>
