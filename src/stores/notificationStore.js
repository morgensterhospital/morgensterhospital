import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const message = ref('');
  const type = ref('success'); // 'success' or 'error'
  const visible = ref(false);
  let timeoutId = null;

  const showNotification = (newMessage, newType = 'success', duration = 3000) => {
    // Clear any existing timeout to prevent the notification from hiding prematurely
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    message.value = newMessage;
    type.value = newType;
    visible.value = true;

    // Set a timeout to hide the notification after the specified duration
    timeoutId = setTimeout(() => {
      hideNotification();
    }, duration);
  };

  const hideNotification = () => {
    visible.value = false;
  };

  return {
    message,
    type,
    visible,
    showNotification,
    hideNotification,
  };
});
