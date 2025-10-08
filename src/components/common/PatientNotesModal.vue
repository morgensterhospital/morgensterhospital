<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 pt-10">
    <div class="bg-surface-dark rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-text-light">Patient Notes for {{ patient.name }} {{ patient.surname }}</h2>
        <button @click="close" class="text-text-muted hover:text-text-light text-3xl">&times;</button>
      </div>

      <div class="flex-grow overflow-y-auto pr-2">
        <NoteViewer :notes="notes" />

        <div v-if="isDoctor" class="mt-6">
          <button v-if="!showEditor" @click="showEditor = true" class="px-6 py-2 bg-secondary text-white rounded-lg shadow hover:bg-secondary-dark transition-colors">
            Add New Note
          </button>
          <NoteEditor v-if="showEditor" @save-note="handleSaveNote" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import NoteEditor from '@/components/notes/NoteEditor.vue';
import NoteViewer from '@/components/notes/NoteViewer.vue';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

const props = defineProps({
  show: Boolean,
  patient: Object,
});

const emit = defineEmits(['close']);

const notes = ref([]);
const showEditor = ref(false);
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const isDoctor = computed(() => authStore.userRole === 'Doctor');

const fetchNotes = async () => {
  if (!props.patient?.id || !authStore.userRole) {
    return;
  }
  try {
    const response = await fetch(`/.netlify/functions/get-notes?patientId=${props.patient.id}&userRole=${encodeURIComponent(authStore.userRole)}`);
    if (!response.ok) throw new Error('Failed to fetch notes');
    notes.value = await response.json();
  } catch (error) {
    console.error('Error fetching notes:', error);
    notificationStore.showNotification("Error fetching patient's notes.", 'error');
  }
};

const handleSaveNote = async (noteContent) => {
  const isUpdate = notes.value.length > 0;
  const now = new Date();
  const timestamp = now.toLocaleString();

  let contentWithUpdateTag = { ...noteContent };
  if (isUpdate) {
    contentWithUpdateTag.general = `Update - ${timestamp}:\n${noteContent.general}`;
  }

  const noteData = {
    patientId: props.patient.id,
    content: contentWithUpdateTag,
    type: authStore.userRole.toLowerCase(), // 'doctor' or 'nurse'
    authorId: authStore.user.uid,
    authorName: authStore.user.displayName,
    authorRole: authStore.userRole,
    isUpdate: isUpdate,
  };

  try {
    const response = await fetch('/.netlify/functions/create-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) throw new Error('Failed to save note');

    notificationStore.showNotification('Note uploaded successfully!', 'success');
    showEditor.value = false;
    await fetchNotes(); // Refresh notes
  } catch (error) {
    console.error('Error saving note:', error);
    notificationStore.showNotification('Failed to upload note.', 'error');
  }
};

const close = () => {
  emit('close');
};

onMounted(() => {
  if (props.show) {
    fetchNotes();
  }
});

// Watch for the modal to open and fetch notes
import { watch } from 'vue';
watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchNotes();
  }
});
</script>