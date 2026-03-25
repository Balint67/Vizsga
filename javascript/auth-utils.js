import { auth, db } from './firebase.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const PASSWORD_PROVIDER_ID = 'password';

export function requiresEmailVerification(user) {
    if (!user) return false;

    const usesPasswordProvider = (user.providerData || []).some(
        (provider) => provider.providerId === PASSWORD_PROVIDER_ID
    );

    return usesPasswordProvider && !user.emailVerified;
}

export function getEmailActionSettings() {
    const origin = window.location.origin;
    const baseUrl = origin && origin !== 'null'
        ? origin
        : 'https://forgex-2026.firebaseapp.com';

    return {
        url: `${baseUrl}/signIn.html?verified=1`,
        handleCodeInApp: false
    };
}

export async function sendVerificationEmail(user) {
    return sendEmailVerification(user, getEmailActionSettings());
}

export async function syncUserVerificationStatus(user) {
    if (!user) return;

    try {
        await setDoc(doc(db, "users", user.uid), {
            email: user.email || "",
            emailVerified: !!user.emailVerified,
            verificationSyncedAt: new Date()
        }, { merge: true });
    } catch (error) {
        console.error("Failed to sync email verification status:", error);
    }
}

export async function refreshAndSyncCurrentUser() {
    const user = auth.currentUser;
    if (!user) return null;

    await user.reload();
    await syncUserVerificationStatus(auth.currentUser);
    return auth.currentUser;
}
