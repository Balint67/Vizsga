/**
 * ForgeX Authentication Logic
 * Handles user login and password visibility toggle
 */

import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { forgeXModal } from './utils.js';

// Elements from HTML
const loginForm = document.getElementById('login-form');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

console.log("SignIn script initialized.");

// --- PASSWORD VISIBILITY TOGGLE ---
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        // Toggle the type attribute
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle the icon class (eye / eye-slash)
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}

// --- LOGIN SUBMISSION ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Login attempt started...");

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Login success for:", userCredential.user.uid);

            // Redirect after successful login
            window.location.href = "index.html";

        } catch (error) {
            console.error("Auth error:", error.code);

            let errorMessage = "Hiba történt a bejelentkezés során.";

            // Mapping Firebase codes to friendly messages
            if (error.code === 'auth/invalid-credential' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/user-not-found') {
                errorMessage = "Hibás e-mail cím vagy jelszó!";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Túl sok próbálkozás. Kérlek, várj egy kicsit!";
            }

            // Trigger the custom Glassmorphism modal
            await forgeXModal("Bejelentkezési hiba", errorMessage);
        }
    });
} else {
    console.error("Error: Could not find 'login-form' ID in HTML!");
}