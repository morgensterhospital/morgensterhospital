import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCUydtEd9HUtr6un-IMKmPkk1j9zuS8Dm0",
  authDomain: "morgensterhospital-1088c.firebaseapp.com",
  projectId: "morgensterhospital-1088c",
  storageBucket: "morgensterhospital-1088c.firebasestorage.app",
  messagingSenderId: "968326059369",
  appId: "1:968326059369:web:19b365f169df66139219f8"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Export the app instance
export default app