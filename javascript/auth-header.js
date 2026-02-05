import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/**
 * Handles profile link redirection based on authentication state
 */
document.addEventListener('DOMContentLoaded', () => {

    // Select all links that should redirect to sign-in or profile page
    const profileLinks = document.querySelectorAll(
        'a[href="signIn.html"], #profile-link'
    );

    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {

        profileLinks.forEach((link) => {
            if (user) {
                // User is logged in → redirect to profile page
                link.href = 'profil.html';
                console.log('Status: Logged in -> Redirecting to profil.html');
            } else {
                // User is logged out → redirect to sign-in page
                link.href = 'signIn.html';
                console.log('Status: Logged out -> Redirecting to signIn.html');
            }
        });

    });
});
