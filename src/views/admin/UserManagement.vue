<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-text-light">User Management</h1>
      <button @click="isAddDepartmentModalOpen = true" class="px-4 py-2 rounded-lg text-background-dark bg-primary hover:bg-primary-hover">
        Add Department
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="department in departments" :key="department.id" class="p-6 bg-surface-dark rounded-lg">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">{{ department.name }}</h2>
          <button @click="removeDepartment(department.id)" class="px-2 py-1 rounded-lg text-red-500 hover:bg-red-500/20">
            <MdiIcon :path="mdiTrashCanOutline" size="20" />
          </button>
        </div>
        <p class="text-text-muted">{{ department.userCount }} users</p>
        <button @click="openDepartmentModal(department)" class="mt-4 px-4 py-2 rounded-lg text-background-dark bg-primary hover:bg-primary-hover w-full">
          View Users
        </button>
      </div>
    </div>

    <DepartmentDetailsModal
      v-if="selectedDepartment"
      :department="selectedDepartment"
      :users="usersInDepartment"
      @close="closeDepartmentModal"
    />

    <AddDepartmentModal
      v-if="isAddDepartmentModalOpen"
      @close="isAddDepartmentModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import DepartmentDetailsModal from '@/components/admin/DepartmentDetailsModal.vue';
import AddDepartmentModal from '@/components/admin/AddDepartmentModal.vue';
import MdiIcon from '@/components/common/MdiIcon.vue';
import { mdiTrashCanOutline } from '@mdi/js';

const departments = ref([]);
const selectedDepartment = ref(null);
const usersInDepartment = ref([]);
const isAddDepartmentModalOpen = ref(false);

const fetchDepartments = async () => {
  const departmentsQuerySnapshot = await getDocs(collection(db, 'departments'));
  const departmentsData = departmentsQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const usersQuerySnapshot = await getDocs(collection(db, 'users'));
  const usersData = usersQuerySnapshot.docs.map(doc => doc.data());

  departments.value = departmentsData.map(department => {
    const userCount = usersData.filter(user => user.department === department.name).length;
    return { ...department, userCount };
  });
};

onMounted(() => {
  fetchDepartments();
});

const openDepartmentModal = async (department) => {
  selectedDepartment.value = department;
  const usersQuery = query(collection(db, 'users'), where('department', '==', department.name));
  const usersQuerySnapshot = await getDocs(usersQuery);
  usersInDepartment.value = usersQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const closeDepartmentModal = () => {
  selectedDepartment.value = null;
};

const removeDepartment = async (departmentId) => {
  await deleteDoc(doc(db, 'departments', departmentId));
  fetchDepartments();
};
</script>
