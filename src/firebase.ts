import { initializeApp } from 'firebase/app';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// Set Firestore log level to suppress non-critical stream cancellation / idle disconnect warnings from cluttering console
setLogLevel('error');

const firebaseConfig = {
  apiKey: "AIzaSyAneSuatexazZM7bETgnhECo_JriSILPgw",
  authDomain: "fair-blueprint-0k7s0.firebaseapp.com",
  projectId: "fair-blueprint-0k7s0",
  storageBucket: "fair-blueprint-0k7s0.firebasestorage.app",
  messagingSenderId: "437054212930",
  appId: "1:437054212930:web:519668b9a8480f8f2696db"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId
export const db = getFirestore(app, "ai-studio-slvevents-ad5ef53e-4901-460b-8860-77cf577079cf");
