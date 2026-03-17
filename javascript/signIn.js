// Import Firebase authentication instance
import { auth } from './firebase.js';

// Import Firebase Auth method for email/password login
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Import custom modal utility
import { forgeXModal } from './utils.js';

// Import google login
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- DOM ELEMENT REFERENCES ---
const loginForm = document.getElementById('login-form');
const togglePasswordButton = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const googleBtn = document.getElementById('google-btn');

console.log("SignIn script initialized.");

// --- PASSWORD VISIBILITY TOGGLE ---
if (togglePasswordButton && passwordInput) {
    togglePasswordButton.addEventListener('click', () => {
        // Switch between password and text input type
        const isPasswordHidden = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPasswordHidden ? 'text' : 'password');

        // Update icon state (eye / eye-slash)
        togglePasswordButton.classList.toggle('fa-eye');
        togglePasswordButton.classList.toggle('fa-eye-slash');
    });
}

// --- LOGIN FORM SUBMISSION ---
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log("Login attempt started...");

        // Get user input values
        const email = document.getElementById('email').value;
        const password = passwordInput.value;

        try {
            // Authenticate user with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Login successful for user:", userCredential.user.uid);

            // Redirect to homepage after successful login
            window.location.href = "index.html";

        } catch (error) {
            console.error("Authentication error:", error.code);

            // Default error message
            let errorMessage = "An error occurred during login.";

            // Map Firebase error codes to user-friendly messages
            if (
                error.code === 'auth/invalid-credential' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/user-not-found'
            ) {
                errorMessage = "Invalid email address or password.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many attempts. Please try again later.";
            }

            // Show error message in custom modal
            await forgeXModal("Login Error", errorMessage);
        }
    });
} else {
    console.error("Login form not found in the DOM.");
}

// Google login eventlistener
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);

            console.log("Sikeres Google belépés:", result.user.displayName);
            window.location.href = "index.html";

        } catch (error) {
            console.error("Hiba a Google login során:", error.code);

            if (error.code !== 'auth/cancelled-popup-request') {
                await forgeXModal("Bejelentkezési hiba", "Nem sikerült a Google bejelentkezés.");
            }
        }
    });
}
