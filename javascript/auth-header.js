import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { requiresEmailVerification } from './auth-utils.js';

/**
 * Global Header Controller
 * Handles user authentication state, profile redirection,
 * and real-time cart counter synchronization across all pages.
 */
document.addEventListener('DOMContentLoaded', () => {

    // Elements selection
    const profileLinks = document.querySelectorAll('a[href="signIn.html"], #profile-link');
    const cartBadge = document.getElementById('cart-count');

    /**
     * Updates the cart badge UI visibility and value
     * @param {number} total - The total number of items in the cart
     */
    const updateBadgeUI = (total) => {
        if (!cartBadge) return;

        if (total > 0) {
            cartBadge.innerText = total;
            cartBadge.style.display = 'flex'; // Show badge if cart is not empty
        } else {
            cartBadge.style.display = 'none'; // Hide badge if cart is empty
        }
    };

    /**
     * Synchronize cart from LocalStorage for guest users
     */
    const syncGuestCart = () => {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = localCart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        updateBadgeUI(total);
    };

    // Main Authentication Observer
    onAuthStateChanged(auth, (user) => {
        if (user && !requiresEmailVerification(user)) {
            // --- LOGGED IN STATE ---

            // Update profile navigation links
            profileLinks.forEach(link => link.href = 'profil.html');

            // Set up Real-time Listener for Firestore Cart
            // Assumption: User carts are stored in 'carts' collection with UID as Document ID
            const cartRef = doc(db, "carts", user.uid);

            // onSnapshot provides real-time updates without page refresh
            onSnapshot(cartRef, (docSnap) => {
                if (docSnap.exists()) {
                    const items = docSnap.data().items || [];
                    const total = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
                    updateBadgeUI(total);
                } else {
                    updateBadgeUI(0); // No cart document exists yet
                }
            }, (error) => {
                console.error("Error listening to cart updates:", error);
            });

        } else {
            // --- GUEST / LOGGED OUT STATE ---

            // Update profile navigation links to sign-in page
            profileLinks.forEach(link => link.href = 'signIn.html');

            localStorage.removeItem('cart');
            localStorage.removeItem('favorites');

            // Initialize guest cart from LocalStorage
            syncGuestCart();

            // Listen for changes in other tabs/windows for guest users
            window.addEventListener('storage', syncGuestCart);
        }
    });
});
