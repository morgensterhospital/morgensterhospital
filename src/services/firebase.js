import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBSZoJjgXex7vQIqNhMivImzuytstPGXMA",
  authDomain: "morgensterhospital-system.firebaseapp.com",
  databaseURL: "https://morgensterhospital-system-default-rtdb.firebaseio.com",
  projectId: "morgensterhospital-system",
  storageBucket: "morgensterhospital-system.firebasestorage.app",
  messagingSenderId: "1049332341829",
  appId: "1:1049332341829:web:dca5fa9e672f04e853972c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Export the app instance
export default app
