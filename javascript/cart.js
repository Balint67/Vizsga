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
        localStorage.removeItem("cart");
        renderCart([], cartContainer, totalPriceElement, checkoutButton);
    }

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

/**
 * Removes an item from the cart, updates storage, and notifies the UI
 * @param {string} itemId - The unique ID of the item to be removed
 */
window.removeFromCart = async function (itemId) {
    // 1. Get the current cart items from LocalStorage
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    // 2. Filter out the selected item (Type-safe comparison using String)
    const updatedCart = cartItems.filter(item => String(item.id) !== String(itemId));

    // 3. Update LocalStorage with the new array
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    /** * 4. IMPORTANT: Dispatch a global 'storage' event.
     * This triggers the event listener in auth-header.js to update the
     * red cart badge across all open tabs and pages immediately.
     */
    window.dispatchEvent(new Event('storage'));

    // 5. Update Cloud Firestore if the user is authenticated
    if (currentUserId) {
        try {
            await setDoc(doc(db, "carts", currentUserId), {
                items: updatedCart,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("Firebase sync error during deletion:", error);
        }
    }

    // 6. Re-render the Cart page UI with the updated list
    renderCart(
        updatedCart,
        document.getElementById("cart-items-container"),
        document.getElementById("total-price"),
        document.getElementById("checkout-btn")
    );
};






