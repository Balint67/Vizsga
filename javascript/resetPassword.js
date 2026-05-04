import { auth } from './firebase.js';
import { forgeXModal } from './utils.js';
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const resetForm = document.querySelector('form');
const emailInput = document.getElementById('email');
const resetButton = document.querySelector('.login-btn');

if (resetForm && emailInput && resetButton) {
    resetForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        resetButton.disabled = true;
        resetButton.innerText = "Folyamatban...";

        try {
            await sendPasswordResetEmail(auth, emailInput.value.trim());
            await forgeXModal(
                "Link elkuldve",
                "Elküldtük a jelszó-visszaállító linket az e-mail címedre."
            );
        } catch (error) {
            console.error("Password reset error:", error.code);
            await forgeXModal(
                "Hiba történt",
                "A jelszó-visszaállítás most nem sikerült. Ellenőrizd az e-mail címet, majd próbáld újra."
            );
        } finally {
            resetButton.disabled = false;
            resetButton.innerText = "Jelszó visszaállítása";
        }
    });
}
