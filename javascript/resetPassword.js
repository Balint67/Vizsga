import { auth } from './firebase.js';
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Ellenőrizzük, hogy egyáltalán elindul-e a fájl
console.log("DEBUG: resetPassword.js sikeresen betöltve!");

const resetForm = document.querySelector('form');
const emailInput = document.getElementById('email');
const resetBtn = document.querySelector('.login-btn');

if (!resetForm) console.error("DEBUG: Nem találom a FORM elemet!");
if (!emailInput) console.error("DEBUG: Nem találom az EMAIL inputot!");
if (!resetBtn) console.error("DEBUG: Nem találom a GOMBOT!");

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("DEBUG: Gomb megnyomva! Email:", emailInput.value);

    resetBtn.disabled = true;
    resetBtn.innerText = "Folyamatban...";

    try {
        await sendPasswordResetEmail(auth, emailInput.value.trim());
        console.log("DEBUG: Firebase válasz: SIKER! Az email elment.");
        alert("A linket elküldtük az email címedre!");
    } catch (error) {
        console.error("DEBUG: Firebase HIBA történt:", error.code);
        alert("Hiba: " + error.code);
    } finally {
        resetBtn.disabled = false;
        resetBtn.innerText = "Jelszó visszaállítása";
    }
});