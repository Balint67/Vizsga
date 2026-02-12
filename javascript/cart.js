// ===============================
// 🔹 FIREBASE IMPORTS
// ===============================
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { forgeXModal } from './utils.js';

// ===============================
// 🔹 CURRENT AUTHENTICATED USER ID
// ===============================
let currentUserId = null;

// ===============================
// 🔹 AUTH STATE LISTENER & FIRESTORE SYNC
// ===============================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("Cart.js – bejelentkezett felhasználó:", currentUserId);

        // Sync cart data from Firestore to localStorage
        try {
            const cartSnapshot = await getDoc(doc(db, "carts", currentUserId));

            if (cartSnapshot.exists()) {
                const firebaseCart = cartSnapshot.data().items || [];
                localStorage.setItem("cart", JSON.stringify(firebaseCart));
                console.log("Firebase kosár betöltve:", firebaseCart);
                
                // Oldal frissítése ha már betöltött
                const cartContainer = document.getElementById("cart-items-container");
                const totalPriceElement = document.getElementById("total-price");
                const checkoutButton = document.getElementById("checkout-btn");
                
                if (cartContainer) {
                    renderCart(cartContainer, totalPriceElement, checkoutButton);
                }
                updateCartCount();
            } else {
                localStorage.setItem("cart", JSON.stringify([]));
                console.log("Firebase kosár üres");
            }
        } catch (error) {
            console.error("Hiba a Firebase kosár szinkronizálásakor:", error);
        }
    } else {
        // User logged out → clear local cart
        currentUserId = null;
        localStorage.removeItem("cart");
        console.log("Felhasználó kijelentkezve, kosár törölve");
    }
});

// ===============================
// 🔹 PAGE LOAD INITIALIZATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded cart.js");
    
    const cartContainer = document.getElementById("cart-items-container");
    const totalPriceElement = document.getElementById("total-price");
    const checkoutButton = document.getElementById("checkout-btn");

    // Render cart if container exists
    if (cartContainer) {
        renderCart(cartContainer, totalPriceElement, checkoutButton);
    }

    updateCartCount();
});

// ===============================
// 🔹 CART RENDERING
// ===============================
function renderCart(container, totalElement, checkoutButton) {
    if (!container) {
        console.error("Kosár container nem található!");
        return;
    }

    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    console.log("renderCart - kosár elemei:", cartItems);
    
    container.innerHTML = "";

    // Empty cart state
    if (cartItems.length === 0) {
        container.innerHTML = `
            <p style="text-align:center;padding:20px;font-size:18px;color:#aaa;">
                A kosarad jelenleg üres.
            </p>
        `;

        if (totalElement) totalElement.innerText = "0 Ft";
        if (checkoutButton) checkoutButton.style.display = "none";
        return;
    }

    if (checkoutButton) checkoutButton.style.display = "block";

    let totalPrice = 0;

    cartItems.forEach((item) => {
        console.log("Tétel megjelenítése:", item);
        
        totalPrice += Number(item.price);

        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("cart-item");

        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="item-info">
                <h3>${item.title}</h3>
                <p>Méret: <b style="color:#00ca65">${item.size}</b></p>
                <p>${Number(item.price).toLocaleString('hu-HU')} Ft</p>
            </div>
            <button class="delete-btn" onclick="removeFromCart('${item.id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        container.appendChild(cartItemElement);
    });

    if (totalElement) {
        totalElement.innerText = `${totalPrice.toLocaleString('hu-HU')} Ft`;
    }
}

// ===============================
// 🔹 REMOVE ITEM FROM CART
// ===============================
window.removeFromCart = async function (itemId) {
    console.log("removeFromCart hívódott, itemId:", itemId);
    
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const itemIdNumber = Number(itemId); // Konvertálás számra
    const updatedCart = cartItems.filter(item => item.id !== itemIdNumber);

    console.log("Kosár frissítve:", updatedCart);

    // Update localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Sync updated cart to Firestore
    if (currentUserId) {
        try {
            await setDoc(doc(db, "carts", currentUserId), {
                items: updatedCart,
                updatedAt: new Date()
            });
            console.log("Firebase kosár szinkronizálva!");
        } catch (error) {
            console.error("Hiba a Firebase szinkronizáláskor:", error);
        }
    }

    // Oldal frissítése
    const cartContainer = document.getElementById("cart-items-container");
    const totalPriceElement = document.getElementById("total-price");
    const checkoutButton = document.getElementById("checkout-btn");

    renderCart(cartContainer, totalPriceElement, checkoutButton);
    updateCartCount();
};

// ===============================
// 🔹 HEADER CART ITEM COUNTER
// ===============================
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const counterElement = document.getElementById("cart-count");

    if (counterElement) {
        counterElement.innerText = cartItems.length;
        console.log("Kosár számláló frissítve:", cartItems.length);
    }
}


