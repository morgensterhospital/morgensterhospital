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
        @click="openDepartmentModal(department)">
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
import { ref, onMounted, computed } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useNotificationStore } from '@/stores/notificationStore';
import UserDetailsModal from '@/components/common/UserDetailsModal.vue';
import UserEditForm from '@/components/common/UserEditForm.vue';
import AddDepartmentModal from '@/components/common/AddDepartmentModal.vue';
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
const departments = ref([]);
const groupedUsers = ref({});
const isModalVisible = ref(false);
const selectedDepartment = ref('');
const isEditFormVisible = ref(false);
const editingUser = ref(null);
const isAddDepartmentModalVisible = ref(false);
const isAddUserModalVisible = ref(false);
const notificationStore = useNotificationStore();

const selectedUsers = computed(() => groupedUsers.value[selectedDepartment.value] || []);

const fetchUsers = async () => {
  const db = getFirestore();
  const usersCollection = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCollection);
  users.value = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  groupUsersByDepartment();
};

const fetchDepartments = async () => {
  const db = getFirestore();
  const departmentsCollection = collection(db, 'departments');
  const departmentsSnapshot = await getDocs(departmentsCollection);
  departments.value = departmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const groupUsersByDepartment = () => {
  const groups = {};

  // Initialize groups with all departments
  departments.value.forEach(dept => {
    groups[dept.name] = [];
  });

  // Group users by department
  users.value.forEach(user => {
    const department = user.department || 'No Department';
    if (!groups[department]) {
      groups[department] = [];
    }
    groups[department].push(user);
  });

  // Handle No Department case
  if (!groups['No Department'] || groups['No Department'].length === 0) {
    const usersWithNoDepartment = users.value.filter(u => !u.department);
    if (usersWithNoDepartment.length > 0) {
      groups['No Department'] = usersWithNoDepartment;
    } else {
      delete groups['No Department'];
    }
  }

  groupedUsers.value = groups;
};

const openDepartmentModal = (department) => {
  selectedDepartment.value = department;
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
    notificationStore.showNotification('Department name is required', 'error');
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

    notificationStore.showNotification('Department created successfully', 'success');
    await fetchDepartments();
    await fetchUsers(); // This will also re-group the departments
  } catch (error) {
    console.error('Error creating department:', error);
    notificationStore.showNotification('Failed to create department', 'error');
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

onMounted(async () => {
  await fetchDepartments();
  await fetchUsers();
});

const openAddUserModal = () => {
  isModalVisible.value = false; // Close the details modal
  isAddUserModalVisible.value = true;
};

const closeAddUserModal = () => {
  isAddUserModalVisible.value = false;
  isModalVisible.value = true; // Re-open the details modal
};

const handleDeleteUser = async (user) => {
  try {
    // Use user.uid which is guaranteed from the document data, fallback to id
    const userId = user.uid || user.id;
    const response = await fetch('/.netlify/functions/delete-user-from-department', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to delete user');

    notificationStore.showNotification('User deleted successfully', 'success');
    await fetchUsers();

    // After re-fetching, the computed property will update.
    // If the department becomes empty, close the modal.
    if (selectedUsers.value.length === 0) {
      closeModal();
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    notificationStore.showNotification('Failed to delete user', 'error');
  }
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
    await fetchUsers(); // Re-fetch users, computed property will update the list
  } catch (error) {
    console.error('Error creating user:', error);
    notificationStore.showNotification('Failed to create user', 'error');
  } finally {
    // Correctly close the 'Add User' modal and re-open the 'User Details' modal
    isAddUserModalVisible.value = false;
    isModalVisible.value = true;
  }
};
</script>

<style scoped>
</style>
