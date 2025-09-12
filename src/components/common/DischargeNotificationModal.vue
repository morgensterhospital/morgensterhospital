<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2 class="text-lg font-semibold mb-4">Patient Discharge Notification</h2>
      <p><strong>Doctor:</strong> {{ notification.doctorName }}</p>
      <p><strong>Patient:</strong> {{ notification.patientName }}</p>
      <div class="mt-4 flex justify-end space-x-4">
        <button @click="$emit('deny')" class="px-4 py-2 bg-red-500 text-white rounded">Deny</button>
        <button @click="$emit('approve')" class="px-4 py-2 bg-green-500 text-white rounded">Approve</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  notification: {
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
  width: 400px;
}
</style>
