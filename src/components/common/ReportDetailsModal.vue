<template>
  <div class="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700">
      <header class="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800">
        <h2 class="text-lg font-bold text-white">{{ title }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </header>
      <div class="p-6 overflow-y-auto">
        <ul v-if="transactions.length > 0" class="space-y-3">
          <li v-for="(transaction, index) in transactions" :key="index" class="p-4 bg-gray-900/50 rounded-lg flex justify-between items-center border border-gray-700 hover:border-indigo-500 transition-all">
            <div>
              <a @click.prevent="$emit('view-patient', transaction.patientId)" class="font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer">{{ transaction.patientName }}</a>
              <p class="text-sm text-gray-400">{{ formatDate(transaction.date) }}</p>
            </div>
            <p class="text-lg font-mono text-white">${{ formatCurrency(transaction.amount) }}</p>
          </li>
        </ul>
        <div v-else class="text-center py-12">
          <p class="text-gray-500">No transactions to display.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  transactions: {
    type: Array,
    required: true,
  },
});

defineEmits(['close', 'view-patient']);

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0.00';
  return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>
