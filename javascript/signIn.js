import { auth, db } from './firebase.js';
import {
    getAdditionalUserInfo,
    getRedirectResult,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { forgeXModal } from './utils.js';
import {
    refreshAndSyncCurrentUser,
    requiresEmailVerification,
    sendVerificationEmail,
    syncUserVerificationStatus
} from './auth-utils.js';

const loginForm = document.getElementById('login-form');
const togglePasswordButton = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const googleBtn = document.getElementById('google-btn');
const resendButton = document.getElementById('resend-verification-btn');
const googleButtonDefaultLabel = googleBtn ? googleBtn.innerHTML : "";

function normalizeEmail(value) {
    return value.trim();
}

function setGoogleButtonLoading(isLoading) {
    if (!googleBtn) return;
    googleBtn.disabled = isLoading;
    googleBtn.innerHTML = isLoading ? "Google bejelentkezes..." : googleButtonDefaultLabel;
}

function getFriendlyLoginErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return "Hibas email cim vagy jelszo.";
        case 'auth/too-many-requests':
            return "Tul sok probalkozas tortent. Kerjuk, probald ujra kesobb.";
        case 'auth/invalid-email':
            return "Adj meg egy ervenyes email cimet.";
        case 'auth/network-request-failed':
            return "Halozati hiba tortent. Ellenorizd az internetkapcsolatot, majd probald ujra.";
        default:
            return "Hiba tortent a bejelentkezes kozben.";
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
            return "Nem sikerult a Google bejelentkezes. Kerjuk, probald ujra.";
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

async function finalizeGoogleSignIn(result) {
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

    window.location.href = "index.html";
    return true;
}

async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    setGoogleButtonLoading(true);

    try {
        const result = await signInWithPopup(auth, provider);
        await finalizeGoogleSignIn(result);
    } catch (error) {
        console.error("Google login error:", error.code);

        if (error.code === 'auth/popup-blocked') {
            await signInWithRedirect(auth, provider);
            return;
        }

        const errorMessage = getGoogleAuthErrorMessage(error.code);
        if (errorMessage) {
            await forgeXModal("Bejelentkezesi hiba", errorMessage);
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
            await finalizeGoogleSignIn(result);
        }
    } catch (error) {
        console.error("Google redirect error:", error.code);
        const errorMessage = getGoogleAuthErrorMessage(error.code);
        if (errorMessage) {
            await forgeXModal("Bejelentkezesi hiba", errorMessage);
        }
    } finally {
        setGoogleButtonLoading(false);
    }
}

console.log("SignIn script initialized.");
handlePendingGoogleRedirect();

const searchParams = new URLSearchParams(window.location.search);
if (searchParams.get('verified') === '1') {
    forgeXModal(
        "Email megerositve",
        "Az email cimedet sikeresen megerositettuk. Most mar be tudsz jelentkezni."
    );
    window.history.replaceState({}, document.title, window.location.pathname);
}

if (togglePasswordButton && passwordInput) {
    togglePasswordButton.addEventListener('click', () => {
        const isPasswordHidden = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPasswordHidden ? 'text' : 'password');
        togglePasswordButton.classList.toggle('fa-eye');
        togglePasswordButton.classList.toggle('fa-eye-slash');
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log("Login attempt started...");

        const email = normalizeEmail(document.getElementById('email').value);
        const password = passwordInput.value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            let user = userCredential.user;

            user = await refreshAndSyncCurrentUser() || user;

            if (requiresEmailVerification(user)) {
                await signOut(auth);
                await forgeXModal(
                    "Email megerositese szukseges",
                    "Az email cimed meg nincs megerositve. Kattints a visszaigazolo email ujrakuldese gombra, ha uj levelet szeretnel kerni."
                );
                return;
            }

            await syncUserVerificationStatus(user);
            window.location.href = "index.html";
        } catch (error) {
            console.error("Authentication error:", error.code);
            await forgeXModal("Bejelentkezesi hiba", getFriendlyLoginErrorMessage(error.code));
        }
    });
}

if (googleBtn) {
    googleBtn.addEventListener('click', handleGoogleLogin);
}

if (resendButton) {
    resendButton.addEventListener('click', async () => {
        const email = normalizeEmail(document.getElementById('email').value);
        const password = passwordInput.value;

        if (!email || !password) {
            await forgeXModal(
                "Hianyzo adatok",
                "Add meg eloszor az email cimedet es a jelszavadat, majd kattints az ujrakuldes gombra."
            );
            return;
        }

        resendButton.disabled = true;
        const originalText = resendButton.innerHTML;
        resendButton.innerHTML = "Kuldes...";

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            let user = userCredential.user;

            user = await refreshAndSyncCurrentUser() || user;

            if (!requiresEmailVerification(user)) {
                await syncUserVerificationStatus(user);
                await forgeXModal(
                    "Mar megerositett fiok",
                    "Ez a fiok mar meg van erositve. Normal modon be tudsz jelentkezni."
                );
                return;
            }

            await sendVerificationEmail(user);
            await forgeXModal(
                "Megerosito email elkuldve",
                "Elkuldtunk egy uj megerosito emailt. Kerjuk, ellenorizd a bejovo leveleket es a spam mappat is."
            );
        } catch (error) {
            console.error("Resend verification error:", error.code);
            await forgeXModal("Megerositasi hiba", getFriendlyLoginErrorMessage(error.code));
        } finally {
            await signOut(auth).catch(() => {});
            resendButton.disabled = false;
            resendButton.innerHTML = originalText;
        }
    });
}
