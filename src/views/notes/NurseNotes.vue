<template>
  <div class="p-6 bg-background-dark min-h-screen text-text-light">
    <h1 class="text-3xl font-bold mb-6">Nurse's Notes</h1>
    <div v-if="patient">
      <h2 class="text-2xl font-semibold mb-4">Patient: {{ patient.name }} {{ patient.surname }}</h2>
      <NoteEditor @save-note="saveNote" />
      <NoteViewer :notes="notes" />
    </div>
    <div v-else>
      <p>Loading patient information...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NoteEditor from '@/components/notes/NoteEditor.vue';
import NoteViewer from '@/components/notes/NoteViewer.vue';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import { useNotificationStore } from '@/stores/notificationStore';

const route = useRoute();
const patientId = route.params.patientId;
const patient = ref(null);
const notes = ref([]);
const authStore = useAuthStore();
const patientStore = usePatientStore();
const notificationStore = useNotificationStore();

const fetchPatientInfo = async () => {
  try {
    const fetchedPatient = await patientStore.getPatientById(patientId);
    if (fetchedPatient) {
      patient.value = fetchedPatient;
    } else {
      notificationStore.showNotification("Could not find patient data.", 'error');
    }
  } catch (error) {
    console.error("Error fetching patient info:", error);
    notificationStore.showNotification("Error fetching patient data.", 'error');
  }
};

const fetchNotes = async () => {
  if (!authStore.userRole) {
    notificationStore.showNotification("Cannot fetch notes without a user role.", 'error');
    return;
  }
  try {
    const response = await fetch(`/.netlify/functions/get-notes?patientId=${patientId}&userRole=${encodeURIComponent(authStore.userRole)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    notes.value = await response.json();
  } catch (error) {
    console.error('Error fetching notes:', error);
    notificationStore.showNotification("Error fetching notes.", 'error');
  }
};

const saveNote = async (noteContent) => {
  const noteData = {
    patientId,
    content: noteContent,
    type: 'nurse',
    authorId: authStore.user.uid,
    authorName: authStore.user.displayName,
    authorRole: authStore.userRole,
  };

  try {
    const response = await fetch('/.netlify/functions/create-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error('Failed to save note');
    }
    notificationStore.showNotification('Note saved successfully!', 'success');
    await fetchNotes(); // Refresh notes after saving
  } catch (error) {
    console.error('Error saving note:', error);
    notificationStore.showNotification('Failed to save note.', 'error');
  }
};

onMounted(async () => {
  await fetchPatientInfo();
  await fetchNotes();
});
</script>