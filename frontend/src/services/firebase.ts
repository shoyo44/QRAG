import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously,
  type User 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDnz0JzlR9x_DLvf_Fl0RbetgF_vu_Z_hk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "docsai-50fff.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "docsai-50fff",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "docsai-50fff.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "41054130344",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:41054130344:web:acbff6426c4bd19415729d"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  type User
};
