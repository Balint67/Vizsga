// Kosár termékeinek betöltése és megjelenítése
function loadCartItems() {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const orderItemsDisplay = document.getElementById("order-items-display");
    const orderTotalElement = document.getElementById("order-total");

    if (!orderItemsDisplay) return;

    // Ha üres a kosár
    if (cartItems.length === 0) {
        orderItemsDisplay.innerHTML = '<p style="color: #aaa;">Nincs tétel a kosárban</p>';
        if (orderTotalElement) orderTotalElement.innerText = "0 Ft";
        return;
    }

    // Termékek megjelenítése
    let totalPrice = 0;
    orderItemsDisplay.innerHTML = '';

    cartItems.forEach(item => {
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

        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover;">
            <div style="flex: 1;">
                <p style="color: #fff; margin: 0 0 5px 0; font-weight: bold;">${item.title}</p>
                <p style="color: #aaa; margin: 0; font-size: 0.9rem;">Méret: <span style="color: #00d26a;">${item.size}</span></p>
            </div>
            <p style="color: #00d26a; font-weight: bold; white-space: nowrap;">${Number(item.price).toLocaleString('hu-HU')} Ft</p>
        `;

        orderItemsDisplay.appendChild(itemDiv);
    });

    // Végösszeg megjelenítése
    if (orderTotalElement) {
        orderTotalElement.innerText = `${totalPrice.toLocaleString('hu-HU')} Ft`;
    }
}

// Kosár törlése sikeres fizetés után
function clearCart() {
    localStorage.removeItem("cart");
    // Header kosár számláló frissítése
    const cartCount = document.getElementById("cart-count");
    if (cartCount) cartCount.innerText = "0";
}

// Oldal betöltésekor a kosár termékeinek megjelenítése
document.addEventListener("DOMContentLoaded", loadCartItems);

document.getElementById('payment-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Mezők
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

    // Segédfüggvény a hiba megjelenítésére/elrejtésére
    function check(condition, element, errorId) {
        const errorSpan = document.getElementById(errorId);
        if (!condition) {
            element.classList.add('input-error');
            errorSpan.style.display = 'block';
            isValid = false;
        } else {
            element.classList.remove('input-error');
            errorSpan.style.display = 'none';
        }
    }

    // Validációs szabályok
    check(fields.name.value.trim().length > 3, fields.name, 'error-name');
    check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value), fields.email, 'error-email');
    check(fields.city.value.trim() !== "", fields.city, 'error-city');
    check(/^\d{4}$/.test(fields.zip.value), fields.zip, 'error-zip');
    check(fields.address.value.trim().length > 5, fields.address, 'error-address');
    check(/^\d{16}$/.test(fields.card.value.replace(/\s/g, '')), fields.card, 'error-card');
    check(/^(0[1-9]|1[0-2])\/\d{2}$/.test(fields.expiry.value), fields.expiry, 'error-expiry');
    check(/^\d{3}$/.test(fields.cvv.value), fields.cvv, 'error-cvv');

    if (isValid) {
        // Kosár törlése
        clearCart();

        // Form eltüntetése, siker üzenet mutatása
        document.getElementById('payment-form').style.display = 'none';
        const successBox = document.getElementById('success-message');
        successBox.style.display = 'block';

        console.log("Sikeres fizetés adatai:", {
            nev: fields.name.value,
            cim: `${fields.zip.value} ${fields.city.value}, ${fields.address.value}`
        });
    }
});

// Input szűrés - csak számok
document.getElementById('card-number').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 16);
});

document.getElementById('cvv').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 3);
});

document.getElementById('zip').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 4);
});

// Automatikus kártya lejárat formázás (MM/YY)
document.getElementById('expiry').addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length >= 2) e.target.value = v.substring(0,2) + '/' + v.substring(2,4);
    else e.target.value = v;
});
