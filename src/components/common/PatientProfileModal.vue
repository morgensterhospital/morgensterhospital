<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2 class="text-lg font-semibold mb-4">Patient Profile</h2>
      <div v-if="patient">
        <p><strong>Name:</strong> {{ patient.name }} {{ patient.surname }}</p>
        <p><strong>Hospital Number:</strong> {{ patient.hospitalNumber }}</p>
        <p><strong>Age:</strong> {{ patient.age }}</p>
        <p><strong>Gender:</strong> {{ patient.gender }}</p>
        <p><strong>Phone:</strong> {{ patient.phone }}</p>
        <p><strong>Address:</strong> {{ patient.address }}</p>
      </div>
      <div v-else>
        <p>Loading patient data...</p>
      </div>
      <div class="mt-4 flex justify-end">
        <button @click="$emit('close')" class="px-4 py-2 bg-gray-500 text-white rounded">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  patient: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #2d3748;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
}
</style>
