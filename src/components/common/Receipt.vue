<template>
  <div class="p-8">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold">Morgenster Hospital</h1>
      <p>Masvingo, Zimbabwe</p>
    </div>
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Receipt</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p><strong>Patient:</strong> {{ patient.name }} {{ patient.surname }}</p>
          <p><strong>Hospital Number:</strong> {{ patient.hospitalNumber }}</p>
        </div>
        <div class="text-right">
          <p><strong>Date:</strong> {{ new Date().toLocaleDateString() }}</p>
        </div>
      </div>
    </div>
    <table class="w-full text-left mb-8">
      <thead>
        <tr>
          <th class="p-2">Item No.</th>
          <th class="p-2">Description</th>
          <th class="p-2">Qty</th>
          <th class="p-2">Unit Price</th>
          <th class="p-2">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id" class="border-b">
          <td class="p-2">{{ item.id }}</td>
          <td class="p-2">{{ item.name }}</td>
          <td class="p-2">{{ item.quantity }}</td>
          <td class="p-2">{{ item.price }}</td>
          <td class="p-2">{{ item.total }}</td>
        </tr>
      </tbody>
    </table>
    <div class="flex justify-end">
      <div class="w-full max-w-sm space-y-4">
        <div class="flex justify-between">
          <span class="font-semibold">Total Bill:</span>
          <span>{{ totalBill }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-semibold">Amount Paid:</span>
          <span>{{ amountPaid }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-semibold">Balance:</span>
          <span>{{ balance }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  patient: {
    type: Object,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  totalBill: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});
</script>
