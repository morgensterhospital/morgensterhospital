import { defineStore } from 'pinia';
import { ref } from 'vue';
// Added 'orderBy' to the import list
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';

export const useBillingStore = defineStore('billing', () => {
  const loading = ref(false);
  const error = ref(null);

  const searchItems = async (searchTerm) => {
    try {
      loading.value = true;
      error.value = null; // Clear previous errors
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
      error.value = null; // Clear previous errors
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
  
  // --- FIXED: Added the missing processBill function ---
  const processBill = async (billingData) => {
    try {
      loading.value = true;
      error.value = null;

      // The URL should point to your Netlify function endpoint
      const response = await fetch('/.netlify/functions/process-billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to process the bill.');
      }

      return await response.json();

    } catch (err) {
      error.value = err.message;
      throw err; // Re-throw the error so the component can catch it
    } finally {
      loading.value = false;
    }
  };


  return {
    loading,
    error,
    searchItems,
    getBillingHistory,
    processBill, // Expose the new function
  };
});
