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
        console.log("Cart.js – logged in user:", currentUserId);

        // Sync cart data from Firestore to localStorage
        const cartSnapshot = await getDoc(doc(db, "carts", currentUserId));

        if (cartSnapshot.exists()) {
            localStorage.setItem(
                "cart",
                JSON.stringify(cartSnapshot.data().items || [])
            );
        } else {
            localStorage.setItem("cart", JSON.stringify([]));
        }
    } else {
        // User logged out → clear local cart
        currentUserId = null;
        localStorage.removeItem("cart");
    }
});

// ===============================
// 🔹 PAGE LOAD INITIALIZATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
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
    if (!container) return;

    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    container.innerHTML = "";

    // Empty cart state
    if (cartItems.length === 0) {
        container.innerHTML = `
            <p style="text-align:center;padding:20px;font-size:18px;">
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
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const updatedCart = cartItems.filter(item => item.id !== itemId);

    // Update localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Sync updated cart to Firestore
    if (currentUserId) {
        await setDoc(doc(db, "carts", currentUserId), {
            items: updatedCart,
            updatedAt: new Date()
        });
    }

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
    }
}

// ===============================
// 🔹 CHECKOUT BUTTON HANDLER
// ===============================
const checkoutButton = document.getElementById("checkout-btn");


