import { auth, db } from './firebase.js';
import {
    createUserWithEmailAndPassword,
    getAdditionalUserInfo,
    getRedirectResult,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { forgeXModal } from './utils.js';
import { sendVerificationEmail, syncUserVerificationStatus } from './auth-utils.js';

const registrationForm = document.getElementById('regForm');
const googleBtn = document.getElementById('google-btn');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('passwordagain');
const errorMessageDisplay = document.getElementById('error-message');
const googleButtonDefaultLabel = googleBtn ? googleBtn.innerHTML : "";

function normalizeEmail(value) {
    return value.trim();
}

function setGoogleButtonLoading(isLoading) {
    if (!googleBtn) return;
    googleBtn.disabled = isLoading;
    googleBtn.innerHTML = isLoading ? "Google regisztracio..." : googleButtonDefaultLabel;
}

function getFriendlySignupErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return "Ez az email cim mar regisztralva van.";
        case 'auth/weak-password':
            return "A jelszo tul gyenge. Kerjuk, hasznalj legalabb 8 karaktert.";
        case 'auth/invalid-email':
            return "Adj meg egy ervenyes email cimet.";
        case 'auth/network-request-failed':
            return "Halozati hiba tortent. Ellenorizd az internetkapcsolatot, majd probald ujra.";
        case 'permission-denied':
            return "A fiok letrejott, de az adatbazis nem engedte a profil menteset. A Firestore szabalyokat telepiteni kell.";
        default:
            return "Varatlan hiba tortent.";
    }
}

function getGoogleAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/account-exists-with-different-credential':
            return "Ehhez az email cimhez mar tartozik fiok egy masik bejelentkezesi moddal.";
        case 'auth/popup-blocked':
            return "A bongeszo letiltotta a Google felugro ablakot. Atvaltunk atiranyitasos bejelentkezesre.";
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
            return "";
        case 'auth/operation-not-allowed':
            return "A Google bejelentkezes nincs engedelyezve a Firebase projektben. Kapcsold be a Google szolgaltatot az Authentication beallitasoknal.";
        case 'auth/unauthorized-domain':
            return "Ez a domain nincs engedelyezve a Google bejelentkezeshez a Firebase projektben. Add hozza az aktualis domaint az Authentication > Settings > Authorized domains listahoz.";
        case 'auth/network-request-failed':
            return "Halozati hiba tortent a Google bejelentkezes kozben. Probald ujra stabil kapcsolattal.";
        case 'permission-denied':
            return "A Google fiokkal sikerult hitelesiteni, de az adatbazis nem engedte a profil menteset. A Firestore szabalyokat telepiteni kell.";
        default:
            return "A hitelesites sikertelen volt. Kerjuk, probald ujra.";
    }
}

async function saveGoogleUserProfile(user, additionalUserInfo) {
    const userDoc = {
        fullname: user.displayName || "Not provided",
        email: user.email || "",
        phone: user.phoneNumber || "Not provided",
        provider: "google",
        emailVerified: true,
        lastLoginAt: new Date()
    };

    if (additionalUserInfo?.isNewUser) {
        userDoc.createdAt = new Date();
    }

    await setDoc(doc(db, "users", user.uid), userDoc, { merge: true });
}

async function savePasswordUserProfile(user, profile) {
    await setDoc(doc(db, "users", user.uid), {
        fullname: profile.fullname,
        phone: profile.phone,
        email: profile.email,
        createdAt: new Date(),
        provider: "password",
        emailVerified: false
    }, { merge: true });
}

async function finalizeGoogleSignup(result) {
    if (!result) return false;

    const user = result.user;
    const additionalUserInfo = getAdditionalUserInfo(result);

    try {
        await saveGoogleUserProfile(user, additionalUserInfo);
    } catch (profileError) {
        console.error("Google profile sync failed:", profileError);
    }

    await syncUserVerificationStatus(user);

    if (additionalUserInfo?.isNewUser) {
        await forgeXModal(
            "Google regisztracio kesz",
            "A Google-fiokod sikeresen letrejott, most mar be is vagy jelentkezve."
        );
    }

    window.location.replace("index.html");
    return true;
}

async function handleGoogleSignup() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    setGoogleButtonLoading(true);

    try {
        const result = await signInWithPopup(auth, provider);
        await finalizeGoogleSignup(result);
    } catch (error) {
        console.error("Google Auth Error:", error.code);

        if (error.code === 'auth/popup-blocked') {
            await signInWithRedirect(auth, provider);
            return;
        }

        const customMessage = getGoogleAuthErrorMessage(error.code);
        if (customMessage) {
            await forgeXModal("Bejelentkezesi hiba", customMessage);
        }
    } finally {
        setGoogleButtonLoading(false);
    }
}

async function handlePendingGoogleRedirect() {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            setGoogleButtonLoading(true);
            await finalizeGoogleSignup(result);
        }
    } catch (error) {
        console.error("Google redirect error:", error.code);
        const customMessage = getGoogleAuthErrorMessage(error.code);
        if (customMessage) {
            await forgeXModal("Bejelentkezesi hiba", customMessage);
        }
    } finally {
        setGoogleButtonLoading(false);
    }
}

handlePendingGoogleRedirect();

document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-password');

    toggleButtons.forEach((button) => {
        button.style.cursor = 'pointer';
        button.addEventListener('click', function () {
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

if (registrationForm) {
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (passwordInput.value !== confirmPasswordInput.value) {
            await forgeXModal("Ervenyesitesi hiba", "Kerjuk, ellenorizd, hogy a ket jelszo megegyezik-e.");
            return;
        }

        const submitButton = registrationForm.querySelector('button');
        const originalBtnText = submitButton.innerHTML;

        submitButton.disabled = true;
        submitButton.innerHTML = "Fiok letrehozasa...";

        const email = normalizeEmail(document.getElementById('email').value);
        const password = passwordInput.value;
        const fullName = document.getElementById('fullname').value.trim();
        const phoneNumber = document.getElementById('phone').value.trim();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendVerificationEmail(user);

            try {
                await savePasswordUserProfile(user, {
                    fullname: fullName,
                    phone: phoneNumber,
                    email
                });
            } catch (profileError) {
                console.error("Password profile sync failed:", profileError);
            }

            await syncUserVerificationStatus(user);
            await signOut(auth);

            await forgeXModal(
                "Erositsd meg az emailedet",
                "Elkuldtunk egy megerosito emailt a megadott cimre. Nyisd meg a benne levo linket, majd jelentkezz be. Ha nem talalod, nezd meg a spam mappat is."
            );

            window.location.replace("signIn.html");
        } catch (error) {
            console.error("Auth Error:", error.code);
            submitButton.disabled = false;
            submitButton.innerHTML = originalBtnText;
            await forgeXModal("Sikertelen regisztracio", getFriendlySignupErrorMessage(error.code));
        }
    });
}

if (googleBtn) {
    googleBtn.addEventListener('click', handleGoogleSignup);
}
