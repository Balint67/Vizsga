// Import Firebase authentication instance
import { auth, db } from './firebase.js';

// Import Firebase Auth method for email/password login
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Import custom modal utility
import { forgeXModal } from './utils.js';
import {
    refreshAndSyncCurrentUser,
    requiresEmailVerification,
    sendVerificationEmail,
    syncUserVerificationStatus
} from './auth-utils.js';

// Import google login
import { getAdditionalUserInfo, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- DOM ELEMENT REFERENCES ---
const loginForm = document.getElementById('login-form');
const togglePasswordButton = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const googleBtn = document.getElementById('google-btn');
const resendButton = document.getElementById('resend-verification-btn');

console.log("SignIn script initialized.");

const searchParams = new URLSearchParams(window.location.search);
if (searchParams.get('verified') === '1') {
    forgeXModal(
        "Email megerősítve",
        "Az email címedet sikeresen megerősítettük. Most már be tudsz jelentkezni."
    );
    window.history.replaceState({}, document.title, window.location.pathname);
}

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
            let user = userCredential.user;

            user = await refreshAndSyncCurrentUser() || user;

            if (requiresEmailVerification(user)) {
                await sendVerificationEmail(user);
                await signOut(auth);
                await forgeXModal(
                    "Email megerősítése szükséges",
                    "Az email címed még nincs megerősítve. Küldtünk egy új megerősítő emailt. Előbb erősítsd meg a fiókodat, majd jelentkezz be újra."
                );
                return;
            }

            await syncUserVerificationStatus(user);

            console.log("Login successful for user:", user.uid);

            // Redirect to homepage after successful login
            window.location.href = "index.html";

        } catch (error) {
            console.error("Authentication error:", error.code);

            // Default error message
            let errorMessage = "Hiba történt a bejelentkezés közben.";

            // Map Firebase error codes to user-friendly messages
            if (
                error.code === 'auth/invalid-credential' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/user-not-found'
            ) {
                errorMessage = "Hibás email cím vagy jelszó.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Túl sok próbálkozás történt. Kérjük, próbáld újra később.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Adj meg egy érvényes email címet.";
            }

            await forgeXModal("Bejelentkezési hiba", errorMessage);
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
            const user = result.user;
            const additionalUserInfo = getAdditionalUserInfo(result);

            await setDoc(doc(db, "users", user.uid), {
                fullname: user.displayName || "Not provided",
                email: user.email || "",
                phone: user.phoneNumber || "Not provided",
                provider: "google",
                emailVerified: true,
                lastLoginAt: new Date()
            }, { merge: true });

            if (additionalUserInfo?.isNewUser) {
                await sendVerificationEmail(user);
                await forgeXModal(
                    "Google regisztráció kész",
                    "A Google-fiókod sikeresen létrejött, és megerősítő emailt is küldtünk az email címedre."
                );
            }

            console.log("Sikeres Google belépés:", user.displayName);
            window.location.href = "index.html";

        } catch (error) {
            console.error("Hiba a Google login során:", error.code);

            if (error.code !== 'auth/cancelled-popup-request') {
                await forgeXModal("Bejelentkezési hiba", "Nem sikerült a Google bejelentkezés.");
            }
        }
    });
}

if (resendButton) {
    resendButton.addEventListener('click', async () => {
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
                await forgeXModal(
                    "Hiányzó adatok",
                    "Add meg először az email címedet és a jelszavadat, majd kattints az újraküldés gombra."
                );
            return;
        }

        resendButton.disabled = true;
        const originalText = resendButton.innerHTML;
        resendButton.innerHTML = "Küldés...";

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            let user = userCredential.user;

            user = await refreshAndSyncCurrentUser() || user;

            if (!requiresEmailVerification(user)) {
                await syncUserVerificationStatus(user);
                await forgeXModal(
                    "Már megerősített fiók",
                    "Ez a fiók már meg van erősítve. Normál módon be tudsz jelentkezni."
                );
                return;
            }

            await sendVerificationEmail(user);
            await forgeXModal(
                "Megerősítő email elküldve",
                "Elküldtünk egy új megerősítő emailt. Kérjük, ellenőrizd a bejövő leveleket és a spam mappát is."
            );
        } catch (error) {
            console.error("Resend verification error:", error.code);

            let errorMessage = "Nem sikerült elküldeni a megerősítő emailt.";
            if (
                error.code === 'auth/invalid-credential' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/user-not-found'
            ) {
                errorMessage = "Hibás email cím vagy jelszó.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Túl sok próbálkozás történt. Kérjük, próbáld újra később.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Adj meg egy érvényes email címet.";
            }

            await forgeXModal("Megerősítési hiba", errorMessage);
        } finally {
            await signOut(auth).catch(() => {});
            resendButton.disabled = false;
            resendButton.innerHTML = originalText;
        }
    });
}
