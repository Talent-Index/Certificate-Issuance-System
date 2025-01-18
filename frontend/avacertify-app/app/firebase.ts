// Import the Firebase libraries
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaUyc_6np4vZyovHBle-4S7xFciyGjvjQ",
  authDomain: "certificate-issuance-system.firebaseapp.com",
  projectId: "certificate-issuance-system",
  storageBucket: "certificate-issuance-system.firebasestorage.app",
  messagingSenderId: "156240490171",
  appId: "1:156240490171:web:8f550ce7d080a3c01dc39e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app)


export { db };
