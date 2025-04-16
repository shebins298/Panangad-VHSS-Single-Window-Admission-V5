import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
  deleteDoc,
  where,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase configuration – replace the placeholders with your project's configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpfqG3IptpquzkvxL3Ghr-L8BaxsgO1o4",
  authDomain: "admissionsinglewindow.firebaseapp.com",
  projectId: "admissionsinglewindow",
  // other configuration details as needed
  storageBucket: "admissionsinglewindow.firebasestorage.app",
  messagingSenderId: "325700111353",
  appId: "1:325700111353:web:c915706076324bd025cb28",
  measurementId: "G-CYJ804ZDXS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in other modules
export {
  auth,
  db,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  onAuthStateChanged,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  where,
};
