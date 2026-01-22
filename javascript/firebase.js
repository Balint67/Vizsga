// 1. Importáljuk a Firebase modulokat
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. Konfiguráció
const firebaseConfig = {
    apiKey: "AIzaSyA-qcUAb6bqjwxfttKBHJOCce0Jw4uGHME",
    authDomain: "forgex-2026.firebaseapp.com",
    projectId: "forgex-2026",
    storageBucket: "forgex-2026.firebasestorage.app",
    messagingSenderId: "73260668042",
    appId: "1:73260668042:web:4b29784cde814c3a628973"
};

// 3. Inicializálás
const app = initializeApp(firebaseConfig);

// 4. Exportálás
export const auth = getAuth(app);
export const db = getFirestore(app);