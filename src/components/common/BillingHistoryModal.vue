<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-background-dark rounded-lg shadow-xl w-full max-w-4xl max-h-full flex flex-col">
      <header class="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 class="text-xl font-bold text-text-light">Billing History</h2>
        <button @click="$emit('close')" class="text-text-muted hover:text-white">
          <MdiIcon :path="mdiClose" size="24" />
        </button>
      </header>
      <div class="p-6 overflow-y-auto flex-grow">
        <div v-if="loading" class="text-center">
          <p>Loading billing history...</p>
        </div>
        <div v-else-if="error" class="text-center text-red-500">
          <p>{{ error }}</p>
        </div>
        <div v-else-if="invoices.length === 0" class="text-center text-text-muted">
          <p>No billing history found for this patient.</p>
        </div>
        <div v-else class="space-y-4">
          <div v-for="invoice in invoices" :key="invoice.id" class="p-4 bg-surface-dark rounded-lg">
            <p><strong>Date:</strong> {{ new Date(invoice.creationDate.seconds * 1000).toLocaleDateString() }}</p>
            <p><strong>Total Amount:</strong> {{ invoice.totalAmount }}</p>
            <p><strong>Amount Paid:</strong> {{ invoice.amountPaid }}</p>
            <p><strong>Balance:</strong> {{ invoice.balance }}</p>
            <p><strong>Status:</strong> {{ invoice.status }}</p>
          </div>
        </div>
      </div>
      <footer class="p-4 border-t border-gray-700 flex justify-end">
        <M3Button variant="outlined" @click="$emit('close')">Close</M3Button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import { useBillingStore } from '@/stores/billingStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import M3Button from '@/components/common/M3Button.vue';
import { mdiClose } from '@mdi/js';

const props = defineProps({
  patientId: {
    type: String,
    required: true,
  },
});

const billingStore = useBillingStore();
const invoices = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    invoices.value = await billingStore.getBillingHistory(props.patientId);
  } catch (err) {
    error.value = 'Failed to load billing history.';
  } finally {
    loading.value = false;
  }
});
</script>
