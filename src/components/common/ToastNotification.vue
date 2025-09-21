<template>
  <transition name="toast">
    <div
      v-if="notificationStore.visible"
      :class="[
        'fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white max-w-sm z-50',
        toastClasses,
      ]"
    >
      <div class="flex items-center">
        <MdiIcon :path="icon" size="24" class="mr-3" />
        <span>{{ notificationStore.message }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';
import MdiIcon from '@/components/common/MdiIcon.vue';
import { mdiCheckCircle, mdiAlertCircle } from '@mdi/js';

const notificationStore = useNotificationStore();

const toastClasses = computed(() => {
  return notificationStore.type === 'success'
    ? 'bg-green-600'
    : 'bg-red-600';
});

const icon = computed(() => {
  return notificationStore.type === 'success'
    ? mdiCheckCircle
    : mdiAlertCircle;
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
