// ===============================
// 🔹 FIREBASE IMPORTOK
// ===============================
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================
// 🔹 AKTUÁLIS FELHASZNÁLÓ UID
// ===============================
let currentUserId = null;

// ===============================
// 🔹 AUTH FIGYELÉS ÉS FIRESTORE SZINKRON
// ===============================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("Cart.js – bejelentkezett user:", currentUserId);

        // 🔹 CSAK LOCALSTORAGE FRISSÍTÉS (DOM kirajzolás később)
        const snap = await getDoc(doc(db, "carts", currentUserId));
        if (snap.exists()) {
            localStorage.setItem("cart", JSON.stringify(snap.data().items || []));
        } else {
            localStorage.setItem("cart", JSON.stringify([]));
        }
    } else {
        currentUserId = null;
        localStorage.removeItem("cart");
    }
});

// ===============================
// 🔹 OLDAL BETÖLTÉS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("cart-items-container");
    const totalElem = document.getElementById("total-price");
    const checkoutBtn = document.getElementById("checkout-btn");

    // 🔹 Kosár kirajzolása
    if (container) {
        renderCart(container, totalElem, checkoutBtn);
    }

    updateCartCount();
});

// ===============================
// 🔹 KOSÁR MEGJELENÍTÉSE
// ===============================
function renderCart(container, totalElem, checkoutBtn) {
    if (!container) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `
            <p style="text-align:center;padding:20px;font-size:18px;">
                A kosarad jelenleg üres.
            </p>
        `;
        if (totalElem) totalElem.innerText = "0 Ft";
        if (checkoutBtn) checkoutBtn.style.display = "none";
        return;
    }

    if (checkoutBtn) checkoutBtn.style.display = "block";

    let total = 0;

    cart.forEach(item => {
        total += Number(item.price);

        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
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

        container.appendChild(div);
    });

    if (totalElem) {
        totalElem.innerText = total.toLocaleString('hu-HU') + " Ft";
    }
}

// ===============================
// 🔹 TERMÉK TÖRLÉSE
// ===============================
window.removeFromCart = async function(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const newCart = cart.filter(item => item.id !== id);

    // LocalStorage frissítés
    localStorage.setItem("cart", JSON.stringify(newCart));

    // 🔹 Firestore szinkron
    if (currentUserId) {
        await setDoc(doc(db, "carts", currentUserId), {
            items: newCart,
            updatedAt: new Date()
        });
    }

    const container = document.getElementById("cart-items-container");
    const totalElem = document.getElementById("total-price");
    const checkoutBtn = document.getElementById("checkout-btn");

    renderCart(container, totalElem, checkoutBtn);
    updateCartCount();
};

// ===============================
// 🔹 NAVIGÁCIÓS KOSÁR SZÁMLÁLÓ
// ===============================
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const el = document.getElementById("cart-count");
    if (el) el.innerText = cart.length;
}

// ===============================
// 🔹 FIZETÉS GOMB
// ===============================
const payBtn = document.getElementById("checkout-btn");
if (payBtn) {
    payBtn.addEventListener("click", () => {
        alert("A fizetési rendszer hamarosan elérhető!");
    });
}
