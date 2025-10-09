<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-40 pt-10">
    <div class="bg-surface-dark rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-text-light">Patient Notes for {{ patient.name }} {{ patient.surname }}</h2>
        <button @click="close" class="text-text-muted hover:text-text-light text-3xl">&times;</button>
      </div>

      <div class="flex-grow overflow-y-auto pr-2 space-y-4">
        <NoteSummaryCard
          v-for="note in notes"
          :key="note.id"
          :note="note"
          @view-details="openDetailsModal"
        />
        <p v-if="notes.length === 0" class="text-text-muted text-center py-4">No notes found for this patient.</p>

        <div v-if="canAddNote" class="mt-6">
          <M3Button
            v-if="!showEditor"
            @click="showEditor = true"
            color="secondary"
            full-width
          >
            Add New Note
          </M3Button>
          <NoteEditor v-if="showEditor" @save-note="handleSaveNote" />
        </div>
      </div>
    </div>

    <NoteDetailsModal
      :show="isDetailsModalVisible"
      :note="selectedNote"
      @close="closeDetailsModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import NoteEditor from '@/components/notes/NoteEditor.vue';
import NoteSummaryCard from '@/components/notes/NoteSummaryCard.vue';
import NoteDetailsModal from '@/components/notes/NoteDetailsModal.vue';
import M3Button from '@/components/common/M3Button.vue';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

const props = defineProps({
  show: Boolean,
  patient: Object,
  noteType: String,
});

const emit = defineEmits(['close']);

const notes = ref([]);
const showEditor = ref(false);
const isDetailsModalVisible = ref(false);
const selectedNote = ref(null);
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const canAddNote = computed(() => {
  const role = authStore.userRole.toLowerCase();
  return props.noteType && role === props.noteType;
});

const fetchNotes = async () => {
  if (!props.patient?.id || !props.noteType) {
    return;
  }
  try {
    const response = await fetch(`/.netlify/functions/get-notes?patientId=${props.patient.id}&noteType=${props.noteType}`);
    if (!response.ok) throw new Error('Failed to fetch notes');
    const allNotes = await response.json();
    // Filter notes by the specific type for this modal instance
    notes.value = allNotes.filter(note => note.type === props.noteType);
  } catch (error) {
    console.error('Error fetching notes:', error);
    notificationStore.showNotification("Error fetching patient's notes.", 'error');
  }
};

const openDetailsModal = (note) => {
  selectedNote.value = note;
  isDetailsModalVisible.value = true;
};

const closeDetailsModal = () => {
  isDetailsModalVisible.value = false;
  selectedNote.value = null;
};

const handleSaveNote = async (noteContent) => {
  const isUpdate = notes.value.length > 0;

  const noteData = {
    patientId: props.patient.id,
    content: noteContent,
    type: props.noteType,
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

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchNotes();
  } else {
    // Reset state when modal is closed
    showEditor.value = false;
    isDetailsModalVisible.value = false;
    selectedNote.value = null;
  }
});
</script>