import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUserId = null;

onAuthStateChanged(auth, async (user) => {
    const cartContainer = document.getElementById("cart-items-container");
    const totalPriceElement = document.getElementById("total-price");
    const checkoutButton = document.getElementById("checkout-btn");

    if (user) {
        currentUserId = user.uid;
        // Firebase-ből töltünk be
        const cartSnapshot = await getDoc(doc(db, "carts", currentUserId));
        let items = cartSnapshot.exists() ? cartSnapshot.data().items || [] : [];

        // Szinkronizáljuk a localStoraget, hogy a számláló is jó legyen
        localStorage.setItem("cart", JSON.stringify(items));
        renderCart(items, cartContainer, totalPriceElement, checkoutButton);
    } else {
        currentUserId = null;
        const localItems = JSON.parse(localStorage.getItem("cart")) || [];
        renderCart(localItems, cartContainer, totalPriceElement, checkoutButton);
    }
    updateCartCount();
});

function renderCart(cartItems, container, totalElement, checkoutButton) {
    if (!container) return;
    container.innerHTML = "";

    if (!cartItems || cartItems.length === 0) {
        container.innerHTML = `<p style="text-align:center;padding:20px;color:#aaa;">A kosarad üres.</p>`;
        if (totalElement) totalElement.innerText = "0 Ft";
        if (checkoutButton) checkoutButton.style.display = "none";
        return;
    }

    if (checkoutButton) checkoutButton.style.display = "block";
    let totalPrice = 0;

    cartItems.forEach((item) => {
        totalPrice += Number(item.price);
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="item-info">
                <h3>${item.title}</h3>
                <p>Méret: <b style="color:#00ca65">${item.size || 'Nincs'}</b></p>
                <p>${Number(item.price).toLocaleString('hu-HU')} Ft</p>
            </div>
            <button class="delete-btn" onclick="removeFromCart('${item.id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        container.appendChild(div);
    });

    if (totalElement) totalElement.innerText = `${totalPrice.toLocaleString('hu-HU')} Ft`;
}

window.removeFromCart = async function (itemId) {
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    // Típusbiztos szűrés: mindent Stringgé alakítunk az összehasonlításhoz
    const updatedCart = cartItems.filter(item => String(item.id) !== String(itemId));

    // Mentés LocalStorage-ba
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Mentés Firebase-be, ha van user
    if (currentUserId) {
        try {
            await setDoc(doc(db, "carts", currentUserId), {
                items: updatedCart,
                updatedAt: new Date()
            });
        } catch (error) { console.error("Firebase hiba törléskor:", error); }
    }

    // Újrarenderelés az új listával
    renderCart(updatedCart, document.getElementById("cart-items-container"), document.getElementById("total-price"), document.getElementById("checkout-btn"));
    updateCartCount();
};

function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const counter = document.getElementById("cart-count");
    if (counter) counter.innerText = cartItems.length;
}