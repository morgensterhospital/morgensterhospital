<template>
  <div v-if="show" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" @click.self="close">
    <div class="bg-card/80 dark:bg-card/80 backdrop-blur-lg rounded-2xl shadow-aqua-glow border border-accent/20 w-full max-w-4xl max-h-[90vh] flex flex-col">
      <!-- Modal Header -->
      <div class="flex justify-between items-center p-6 border-b border-accent/20">
        <h2 class="text-2xl font-bold text-accent">
          {{ noteType.replace('_', ' ') | capitalize }} Notes for {{ patient.name }} {{ patient.surname }}
        </h2>
        <button @click="close" class="text-text-main/70 hover:text-accent transition-colors duration-300">
          <MdiIcon :path="mdiClose" size="28" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="flex-grow overflow-y-auto p-6 space-y-4">
        <NoteSummaryCard
          v-for="note in notes"
          :key="note.id"
          :note="note"
          @view-details="openDetailsModal"
        />
        <p v-if="notes.length === 0 && !loading" class="text-text-main/70 text-center py-8">
          No notes found for this patient.
        </p>
        <div v-if="loading" class="text-center py-8">
          <div class="w-8 h-8 border-4 border-t-accent rounded-full animate-spin mx-auto"></div>
          <p class="mt-2 text-text-main/70">Loading notes...</p>
        </div>
      </div>

      <!-- Modal Footer / Actions -->
      <div v-if="canAddNote" class="p-6 border-t border-accent/20">
        <button v-if="!showEditor" @click="showEditor = true"
                class="w-full bg-accent text-black font-bold py-3 px-6 rounded-lg hover:shadow-aqua-glow-strong transition-shadow duration-300">
          Add New Note
        </button>
        <NoteEditor v-if="showEditor" @save-note="handleSaveNote" @cancel="showEditor = false" />
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
import MdiIcon from '@/components/common/MdiIcon.vue';
import { mdiClose } from '@mdi/js';

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
const loading = ref(false);

const canAddNote = computed(() => {
  const role = authStore.userRole?.toLowerCase();
  if (!role) return false;

  const permissionMap = {
    doctor: 'doctors_notes:edit', // Assuming edit implies creation ability
    nurse: 'nurses_notes:create',
    operation: 'operations:create',
    prescription: 'prescriptions:create',
    consent: 'consent_forms:create',
    admission: 'admission_discharge:create',
    lab: 'lab_results:create',
    radiology: 'radiology_results:create',
    rehab: 'rehabilitation_notes:create',
  };
  const permission = permissionMap[props.noteType];
  return permission ? authStore.hasPermission(permission) : false;
});

const fetchNotes = async () => {
  if (!props.patient?.id || !props.noteType) {
    notes.value = [];
    return;
  }
  loading.value = true;
  try {
    const response = await fetch(`/.netlify/functions/get-notes?patientId=${props.patient.id}&noteType=${props.noteType}`);
    if (!response.ok) throw new Error('Failed to fetch notes');
    const allNotes = await response.json();
    notes.value = allNotes.filter(note => note.type === props.noteType);
  } catch (error) {
    console.error('Error fetching notes:', error);
    notificationStore.showNotification("Error fetching patient's notes.", 'error');
    notes.value = [];
  } finally {
    loading.value = false;
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
  const noteData = {
    patientId: props.patient.id,
    content: noteContent,
    type: props.noteType,
    authorId: authStore.user.uid,
    authorName: authStore.user.displayName,
    authorRole: authStore.userRole,
    isUpdate: notes.value.some(n => n.authorId === authStore.user.uid) // Example update logic
  };

  try {
    const response = await fetch('/.netlify/functions/create-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) throw new Error('Failed to save note');

    notificationStore.showNotification('Note saved successfully!', 'success');
    showEditor.value = false;
    await fetchNotes(); // Refresh notes
  } catch (error) {
    console.error('Error saving note:', error);
    notificationStore.showNotification('Failed to save note.', 'error');
  }
};

const close = () => {
  emit('close');
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchNotes();
  } else {
    showEditor.value = false;
    isDetailsModalVisible.value = false;
    selectedNote.value = null;
  }
});

const capitalize = (value) => {
  if (!value) return ''
  value = value.toString().replace(/_/g, ' ')
  return value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
</script>

<style scoped>
/* Custom scrollbar for modal content */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 255, 255, 0.5);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 255, 255, 0.8);
}
</style>