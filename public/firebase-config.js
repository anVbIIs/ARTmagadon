import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Twoja konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyClscqoOKGo5BadxCtm6c-2KfYFFHGctK8",
  authDomain: "artmagadon.firebaseapp.com",
  projectId: "artmagadon",
  storageBucket: "artmagadon.firebasestorage.app",
  messagingSenderId: "924842166795",
  appId: "1:924842166795:web:06bb15ce4180cc5824150e",
  measurementId: "G-JDLJCNMJ4Y"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
