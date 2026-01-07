import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Check if config is loaded
if (!firebaseConfig.apiKey) {
  console.error('Firebase config not loaded! Check .env.local file.')
}

const app = initializeApp(firebaseConfig)

// Initialize Firestore without persistent cache to avoid IndexedDB issues
// in certain browser environments (incognito, Safari privacy mode, etc.)
export const db = getFirestore(app)

export default app
