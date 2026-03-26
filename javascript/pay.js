import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
            ? 'Kiszereles'
            : 'Meret';

        rows.push({ label: sizeLabel, value: size });
    }

    if (color) {
        const colorLabel = ['protein_powder', 'protein_bar'].includes(productId)
            ? 'Iz'
            : 'Szin';

        rows.push({ label: colorLabel, value: color });
    }

    return rows;
}

onAuthStateChanged(auth, (user) => {
    currentUserId = user ? user.uid : null;
});

function loadCartItems() {
    const cartItems = (JSON.parse(localStorage.getItem("cart")) || []).map((item) => ({
        ...item,
        image: normalizeImagePath(item.image)
    }));
    const orderItemsDisplay = document.getElementById("order-items-display");
    const orderTotalElement = document.getElementById("order-total");

    if (!orderItemsDisplay) {
        return;
    }

    if (cartItems.length === 0) {
        orderItemsDisplay.innerHTML = '<p style="color: #aaa; text-align: center; padding: 20px;">Nincs tetel a kosarban.</p>';
        if (orderTotalElement) orderTotalElement.innerText = "0 Ft";
        return;
    }

    let totalPrice = 0;
    orderItemsDisplay.innerHTML = '';

    cartItems.forEach((item) => {
        totalPrice += Number(item.price);

        const itemDiv = document.createElement("div");
        itemDiv.style.cssText = `
            background: #141414;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 10px;
            border-left: 3px solid #00d26a;
            display: flex;
            gap: 10px;
            align-items: center;
        `;

        const attributeRows = getItemAttributeRows(item)
            .map((attribute) => `<p style="color: #aaa; margin: 0; font-size: 0.9rem;">${attribute.label}: <span style="color: #00d26a;">${attribute.value}</span></p>`)
            .join('');

        itemDiv.innerHTML = `
            <img src="${normalizeImagePath(item.image)}" alt="${item.title}" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover;">
            <div style="flex: 1;">
                <p style="color: #fff; margin: 0 0 5px 0; font-weight: bold;">${item.title}</p>
                ${attributeRows}
            </div>
            <p style="color: #00d26a; font-weight: bold; white-space: nowrap;">${formatPrice(item.price)}</p>
        `;

        orderItemsDisplay.appendChild(itemDiv);
    });

    if (orderTotalElement) {
        orderTotalElement.innerText = formatPrice(totalPrice);
    }
}

async function clearCart() {
    localStorage.removeItem("cart");

    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        cartCount.innerText = "0";
    }

    if (currentUserId) {
        try {
            await setDoc(doc(db, "carts", currentUserId), {
                items: [],
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("Hiba a Firebase kosar torlesenel:", error);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadCartItems();

    const paymentForm = document.getElementById('payment-form');
    if (!paymentForm) {
        return;
    }

    const cardNumberInput = document.getElementById('card-number');
    const cvvInput = document.getElementById('cvv');
    const zipInput = document.getElementById('zip');
    const expiryInput = document.getElementById('expiry');

    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 16);
        });
    }

    if (cvvInput) {
        cvvInput.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 3);
        });
    }

    if (zipInput) {
        zipInput.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 4);
        });
    }

    if (expiryInput) {
        expiryInput.addEventListener('input', function (event) {
            const value = event.target.value.replace(/\D/g, '');
            this.value = value.length >= 2 ? `${value.substring(0, 2)}/${value.substring(2, 4)}` : value;
        });
    }

    paymentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fields = {
            name: document.getElementById('full-name'),
            email: document.getElementById('email'),
            city: document.getElementById('city'),
            zip: document.getElementById('zip'),
            address: document.getElementById('address'),
            card: document.getElementById('card-number'),
            expiry: document.getElementById('expiry'),
            cvv: document.getElementById('cvv')
        };

        let isValid = true;

        function check(condition, element, errorId) {
            const errorSpan = document.getElementById(errorId);
            if (!condition) {
                element.classList.add('input-error');
                if (errorSpan) errorSpan.style.display = 'block';
                isValid = false;
            } else {
                element.classList.remove('input-error');
                if (errorSpan) errorSpan.style.display = 'none';
            }
        }

        check(fields.name.value.trim().length > 3, fields.name, 'error-name');
        check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value), fields.email, 'error-email');
        check(fields.city.value.trim() !== "", fields.city, 'error-city');
        check(/^\d{4}$/.test(fields.zip.value), fields.zip, 'error-zip');
        check(fields.address.value.trim().length > 5, fields.address, 'error-address');
        check(/^\d{16}$/.test(fields.card.value.replace(/\s/g, '')), fields.card, 'error-card');
        check(/^(0[1-9]|1[0-2])\/\d{2}$/.test(fields.expiry.value), fields.expiry, 'error-expiry');
        check(/^\d{3}$/.test(fields.cvv.value), fields.cvv, 'error-cvv');

        if (!isValid) {
            return;
        }

        await clearCart();

        paymentForm.style.display = 'none';
        const successBox = document.getElementById('success-message');
        if (successBox) {
            successBox.style.display = 'block';
        }
    });
});
