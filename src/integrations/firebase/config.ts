import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
// Replace these with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDRZs0HYpV6-nDOEgTNIn6ON6K-lgQC_jc",
  authDomain: "cityconnect-f5099.firebaseapp.com",
  projectId: "cityconnect-f5099",
  storageBucket: "cityconnect-f5099.firebasestorage.app",
  messagingSenderId: "272482377466",
  appId: "1:272482377466:web:17849cadf783cb9680b343",
  measurementId: "G-4JXQL82DLZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Debug: Log Firebase initialization
console.log('Firebase initialized with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Debug: Log service initialization
console.log('Firebase services initialized:', {
  auth: !!auth,
  db: !!db
});

// Initialize analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    console.log('Firebase Analytics initialized');
  } catch (error) {
    console.warn('Firebase Analytics initialization failed:', error);
  }
}

export default app; 