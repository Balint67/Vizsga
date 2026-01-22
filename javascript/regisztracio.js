import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const regForm = document.getElementById('regForm');

regForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Adatok kinyerése a mezőkből
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullname = document.getElementById('fullname').value;
    const phone = document.getElementById('phone').value;

    try {
        // 1. Felhasználó létrehozása (Email + Jelszó)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Extra adatok mentése a Firestore-ba (User ID alapján)
        await setDoc(doc(db, "users", user.uid), {
            fullname: fullname,
            phone: phone,
            email: email,
            createdAt: new Date()
        });

        alert("Sikeres regisztráció!");
        window.location.href = "bejelentkezes.html"; // Átirányítás a belépéshez

    } catch (error) {
        console.error("Hiba történt:", error.code);
        alert("Hiba: " + error.message);
    }
});