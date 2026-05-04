import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUserId = null;

function normalizeImagePath(imagePath) {
    if (!imagePath) return "";
    const normalized = String(imagePath).replace(/\\/g, '/');
    const marker = '/images/';

    if (normalized.startsWith('images/')) {
        return normalized;
    }

    const markerIndex = normalized.indexOf(marker);
    if (markerIndex >= 0) {
        return normalized.slice(markerIndex + 1);
    }

    return normalized;
}

function formatPrice(price) {
    return `${Number(price).toLocaleString('hu-HU')} Ft`;
}

function getItemAttributeRows(item) {
    const rows = [];
    const productId = item.productId || '';
    const size = item.size ? String(item.size).trim() : '';
    const color = item.color ? String(item.color).trim() : '';

    if (size) {
        const sizeLabel = ['protein_powder', 'creatine', 'protein_bar', 'shaker', 'gym_bag']
            .includes(productId)
            ? 'Kiszerelés'
            : 'Meret';

        rows.push({ label: sizeLabel, value: size });
    }

    if (color) {
        const colorLabel = ['protein_powder', 'protein_bar'].includes(productId)
            ? 'Íz'
            : 'Szin';

        rows.push({ label: colorLabel, value: color });
    }

    return rows;
}

onAuthStateChanged(auth, async (user) => {
    const cartContainer = document.getElementById("cart-items-container");
    const totalPriceElement = document.getElementById("total-price");
    const checkoutButton = document.getElementById("checkout-btn");

    if (user) {
        currentUserId = user.uid;
        const cartSnapshot = await getDoc(doc(db, "carts", currentUserId));
        let items = cartSnapshot.exists() ? cartSnapshot.data().items || [] : [];
        items = items.map((item) => ({
            ...item,
            image: normalizeImagePath(item.image)
        }));

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
        container.innerHTML = '<p style="text-align:center;padding:20px;color:#aaa;">A kosarad üres.</p>';
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

        const attributeRows = getItemAttributeRows(item)
            .map((attribute) => `<p>${attribute.label}: <b style="color:#00ca65">${attribute.value}</b></p>`)
            .join('');

        div.innerHTML = `
            <img src="${normalizeImagePath(item.image)}" alt="${item.title}">
            <div class="item-info">
                <h3>${item.title}</h3>
                ${attributeRows}
                <p>${formatPrice(item.price)}</p>
            </div>
            <button class="delete-btn" onclick="removeFromCart('${item.id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        container.appendChild(div);
    });

    if (totalElement) totalElement.innerText = formatPrice(totalPrice);
}

window.removeFromCart = async function (itemId) {
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    cartItems = cartItems.map((item) => ({
        ...item,
        image: normalizeImagePath(item.image)
    }));

    const updatedCart = cartItems.filter((item) => String(item.id) !== String(itemId));

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));

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

    renderCart(
        updatedCart,
        document.getElementById("cart-items-container"),
        document.getElementById("total-price"),
        document.getElementById("checkout-btn")
    );
};
