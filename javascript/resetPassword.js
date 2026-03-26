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
                "Elkuldtuk a jelszo-visszaallito linket az email cimedre."
            );
        } catch (error) {
            console.error("Password reset error:", error.code);
            await forgeXModal(
                "Hiba tortent",
                "A jelszo-visszaallitas most nem sikerult. Ellenorizd az email címet, majd probald ujra."
            );
        } finally {
            resetButton.disabled = false;
            resetButton.innerText = "Jelszo visszaallitasa";
        }
    });
}
