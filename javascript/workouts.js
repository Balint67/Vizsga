import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { forgeXModal } from './utils.js';

let currentUserId = null;

onAuthStateChanged(auth, (user) => {
    currentUserId = user ? user.uid : null;
});

async function initModals() {
    // ... a többi változó (modal, video stb.)

    const cartButtons = document.querySelectorAll('.add-to-cart-btn');
    cartButtons.forEach(btn => {
        btn.addEventListener('click', async (event) => {
            event.stopPropagation();

            const title = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'));

            // LocalStorage frissítése
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const newItem = {
                id: Date.now(),
                title: title,
                price: price,
                size: "Digitális",
                color: null,
                image: "images/icons/cartImg.png", // Használjunk egy létező ikont tesztnek
                quantity: 1
            };

            cart.push(newItem);
            localStorage.setItem("cart", JSON.stringify(cart));

            // Számláló frissítése a fejlécben
            const counter = document.getElementById("cart-count");
            if (counter) counter.innerText = cart.length;

            // Firestore mentés
            if (currentUserId) {
                try {
                    await setDoc(doc(db, "carts", currentUserId), { items: cart, updatedAt: new Date() });
                } catch (e) { console.error("Firebase hiba:", e); }
            }

            // A shop.js-ben használt modal hívása
            if (typeof forgeXModal === "function") {
                await forgeXModal("Kosárba téve", `${title} bekerült a kosaradba!`);
            } else {
                alert(`${title} bekerült a kosaradba!`);
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', initModals);