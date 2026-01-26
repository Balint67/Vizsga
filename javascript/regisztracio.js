import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const regForm = document.getElementById('regForm');

if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = regForm.querySelector('button');
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Siker regisztráció!"; // Azonnal látod, ha idáig eljutott

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const fullname = document.getElementById('fullname').value;
        const phone = document.getElementById('phone').value;

        try {
            // 1. Felhasználó létrehozása
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Adatok mentése
            await setDoc(doc(db, "users", user.uid), {
                fullname: fullname,
                phone: phone,
                email: email,
                createdAt: new Date()
            });

            // 3. Közvetlen átirányítás (Alert nélkül, hogy ne akadjon meg)
            window.location.replace("signIn.html");

        } catch (error) {
            console.error("Hiba:", error.code);
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Regisztráció <i class="fa-solid fa-arrow-right"></i>';

            if (error.code === 'auth/email-already-in-use') {
                alert("Ez az e-mail már foglalt!");
            } else {
                alert("Hiba történt: " + error.message);
            }
        }
    });
}