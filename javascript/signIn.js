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
        "Email Verified",
        "Your email address has been verified successfully. You can sign in now."
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
                    "Email Verification Required",
                    "Your email address is not verified yet. We sent you a new verification email. Please verify your account first, then sign in again."
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
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Please enter a valid email address.";
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
                    "Google Registration Complete",
                    "Your Google account was created successfully and we also sent a confirmation email to your address."
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
                "Missing Information",
                "Enter your email address and password first, then click resend verification email."
            );
            return;
        }

        resendButton.disabled = true;
        const originalText = resendButton.innerHTML;
        resendButton.innerHTML = "Sending...";

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            let user = userCredential.user;

            user = await refreshAndSyncCurrentUser() || user;

            if (!requiresEmailVerification(user)) {
                await syncUserVerificationStatus(user);
                await forgeXModal(
                    "Already Verified",
                    "This account is already verified. You can sign in normally."
                );
                return;
            }

            await sendVerificationEmail(user);
            await forgeXModal(
                "Verification Email Sent",
                "We sent a new verification email. Please check your inbox and spam folder."
            );
        } catch (error) {
            console.error("Resend verification error:", error.code);

            let errorMessage = "We could not send the verification email.";
            if (
                error.code === 'auth/invalid-credential' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/user-not-found'
            ) {
                errorMessage = "Invalid email address or password.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many attempts. Please try again later.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Please enter a valid email address.";
            }

            await forgeXModal("Verification Error", errorMessage);
        } finally {
            await signOut(auth).catch(() => {});
            resendButton.disabled = false;
            resendButton.innerHTML = originalText;
        }
    });
}
