import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// configs do Firebase fornecida pelo console
const firebaseConfig = {
  apiKey: "AIzaSyA_c3ZlC-pLqFlsEMiRtz4WeUgg9j1ndNM",
  authDomain: "fintracker-dd7c7.firebaseapp.com",
  projectId: "fintracker-dd7c7",
  storageBucket: "fintracker-dd7c7.firebasestorage.app",
  messagingSenderId: "590951200677",
  appId: "1:590951200677:web:e34bebaeef092bbc845a4c"
};

// inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, firebaseConfig };