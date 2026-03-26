/**
 * ForgeX - User Registration Module
 * Requirements: Firebase v10+, Firestore, Google Auth, Custom Modals
 */

import { auth, db } from './firebase.js';
import {
    createUserWithEmailAndPassword,
    getAdditionalUserInfo,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { forgeXModal } from './utils.js';
import { sendVerificationEmail, syncUserVerificationStatus } from './auth-utils.js';

// --- DOM ELEMENT SELECTIONS ---
const registrationForm = document.getElementById('regForm');
const googleBtn = document.getElementById('google-btn');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('passwordagain');
const errorMessageDisplay = document.getElementById('error-message');

/**
 * UI & Form Validation logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-password');

    // Password visibility toggle handler
    toggleButtons.forEach(button => {
        button.style.cursor = 'pointer';
        button.addEventListener('click', function() {
            const inputField = this.parentElement.querySelector('input');
            if (inputField.type === 'password') {
                inputField.type = 'text';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                inputField.type = 'password';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Real-time password match validation
    const validatePasswords = () => {
        if (confirmPasswordInput.value.length > 0) {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.style.border = "2px solid #ff4d4d";
                errorMessageDisplay.textContent = "Passwords do not match!";
                errorMessageDisplay.style.display = "block";
            } else {
                confirmPasswordInput.style.border = "2px solid #2ecc71";
                errorMessageDisplay.style.display = "none";
            }
        }
    };

    passwordInput.addEventListener('input', validatePasswords);
    confirmPasswordInput.addEventListener('input', validatePasswords);
});

/**
 * Handle Standard Email/Password Registration
 */
if (registrationForm) {
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Final security check for password matching
        if (passwordInput.value !== confirmPasswordInput.value) {
            await forgeXModal("Érvényesítési hiba", "Kérjük, ellenőrizd, hogy a két jelszó megegyezik-e.");
            return;
        }

        const submitButton = registrationForm.querySelector('button');
        const originalBtnText = submitButton.innerHTML;

        // UI Feedback: disable button during async operation
        submitButton.disabled = true;
        submitButton.innerHTML = "Fiók létrehozása...";

        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const fullName = document.getElementById('fullname').value;
        const phoneNumber = document.getElementById('phone').value;

        try {
            // 1. Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Send verification email before allowing email/password login
            await sendVerificationEmail(user);

            // 3. Store additional user metadata in Firestore
            await setDoc(doc(db, "users", user.uid), {
                fullname: fullName,
                phone: phoneNumber,
                email: email,
                createdAt: new Date(),
                provider: "password",
                emailVerified: false
            });

            await syncUserVerificationStatus(user);

            await signOut(auth);
            await forgeXModal(
                "Erősítsd meg az emailedet",
                "Elküldtünk egy megerősítő emailt a megadott címre. Nyisd meg a benne lévő linket, majd jelentkezz be. Ha nem találod, nézd meg a spam mappát is."
            );

            // 4. Success redirect
            window.location.replace("signIn.html");

        } catch (error) {
            console.error("Auth Error:", error.code);
            submitButton.disabled = false;
            submitButton.innerHTML = originalBtnText;

            // User-friendly error mapping
            let friendlyMessage = "Váratlan hiba történt.";
            if (error.code === 'auth/email-already-in-use') {
                friendlyMessage = "Ez az email cím már regisztrálva van.";
            } else if (error.code === 'auth/weak-password') {
                friendlyMessage = "A jelszó túl gyenge. Kérjük, használj legalább 8 karaktert.";
            }

            await forgeXModal("Sikertelen regisztráció", friendlyMessage);
        }
    });
}

/**
 * Handle Google Social Authentication
 */
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();

        try {
            // Trigger the Google Sign-In popup
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const additionalUserInfo = getAdditionalUserInfo(result);

            // Sync Google profile data with Firestore
            // merge: true ensures we don't overwrite existing data on re-login
            await setDoc(doc(db, "users", user.uid), {
                fullname: user.displayName,
                email: user.email,
                phone: user.phoneNumber || "Not provided",
                createdAt: new Date(),
                provider: "google",
                emailVerified: true
            }, { merge: true });

            if (additionalUserInfo?.isNewUser) {
                await sendVerificationEmail(user);
                await forgeXModal(
                    "Google regisztráció kész",
                    "A Google-fiókod sikeresen létrejött, és megerősítő emailt is küldtünk az email címedre."
                );
            }

            console.log("Google Auth Success!");
            window.location.replace("index.html");

        } catch (error) {
            console.error("Google Auth Error:", error.code);

            // Handle silent failures (user closed the popup)
            if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(error.code)) {
                return;
            }

            let customMessage = "A hitelesítés sikertelen volt. Kérjük, próbáld újra.";
            if (error.code === 'auth/account-exists-with-different-credential') {
                customMessage = "Ehhez az email címhez már tartozik fiók egy másik bejelentkezési móddal.";
            }

            await forgeXModal("Bejelentkezési hiba", customMessage);
        }
    });
}
