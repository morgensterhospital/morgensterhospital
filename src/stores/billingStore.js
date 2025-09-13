import { defineStore } from 'pinia';
import { ref } from 'vue';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';

export const useBillingStore = defineStore('billing', () => {
  const loading = ref(false);
  const error = ref(null);

  const searchItems = async (searchTerm) => {
    try {
      loading.value = true;
      const itemsRef = collection(db, 'billable_items');
      const q = query(
        itemsRef,
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getBillingHistory = async (patientId) => {
    try {
      loading.value = true;
      const invoicesRef = collection(db, `patients/${patientId}/invoices`);
      const q = query(invoicesRef, orderBy('creationDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    searchItems,
    getBillingHistory,
  };
});
