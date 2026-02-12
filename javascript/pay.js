// ===============================
// 🔹 FIREBASE IMPORTS
// ===============================
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================
// 🔹 CURRENT AUTHENTICATED USER ID
// ===============================
let currentUserId = null;

// ===============================
// 🔹 AUTH STATE LISTENER
// ===============================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("Pay.js – bejelentkezett felhasználó:", currentUserId);
    } else {
        currentUserId = null;
        console.log("Pay.js – nem bejelentkezett felhasználó");
    }
});

// ===============================
// 🔹 KOSÁR TERMÉKEINEK BETÖLTÉSE
// ===============================
function loadCartItems() {
    console.log("loadCartItems hívódott");
    
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const orderItemsDisplay = document.getElementById("order-items-display");
    const orderTotalElement = document.getElementById("order-total");

    console.log("Kosár elemei:", cartItems);

    if (!orderItemsDisplay) {
        console.error("order-items-display elem nem található!");
        return;
    }

    // Ha üres a kosár
    if (cartItems.length === 0) {
        orderItemsDisplay.innerHTML = '<p style="color: #aaa; text-align: center; padding: 20px;">Nincs tétel a kosárban</p>';
        if (orderTotalElement) orderTotalElement.innerText = "0 Ft";
        return;
    }

    // Termékek megjelenítése
    let totalPrice = 0;
    orderItemsDisplay.innerHTML = '';

    cartItems.forEach((item, index) => {
        console.log(`Tétel ${index}:`, item);
        
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
    
    console.log("Végösszeg:", totalPrice);
}

// ===============================
// 🔹 KOSÁR TÖRLÉSE FIZETÉS UTÁN
// ===============================
async function clearCart() {
    console.log("clearCart hívódott, currentUserId:", currentUserId);
    
    // localStorage törlése
    localStorage.removeItem("cart");
    console.log("localStorage kosár törölve");
    
    // Header kosár számláló frissítése
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        cartCount.innerText = "0";
        console.log("Cart count frissítve: 0");
    }
    
    // Firebase törlése, ha bejelentkezett
    if (currentUserId) {
        try {
            await setDoc(doc(db, "carts", currentUserId), {
                items: [],
                updatedAt: new Date()
            });
            console.log("Firebase kosár sikeresen törölve!");
        } catch (error) {
            console.error("Hiba a Firebase kosár törlésénél:", error);
        }
    } else {
        console.log("Nem bejelentkezett - Firebase törlés kihagyva");
    }
}

// ===============================
// 🔹 DOM INICIALIZÁCIÓ
// ===============================
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded esemény");
    
    // Kosár termékeinek megjelenítése
    loadCartItems();
    
    // Payment form event listener
    const paymentForm = document.getElementById('payment-form');
    
    if (!paymentForm) {
        console.error("payment-form elem nem található!");
        return;
    }
    
    // Input szűrés - csak számok
    const cardNumberInput = document.getElementById('card-number');
    const cvvInput = document.getElementById('cvv');
    const zipInput = document.getElementById('zip');
    const expiryInput = document.getElementById('expiry');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 16);
        });
    }

    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 3);
        });
    }

    if (zipInput) {
        zipInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 4);
        });
    }

    // Automatikus kártya lejárat formázás (MM/YY)
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length >= 2) this.value = v.substring(0,2) + '/' + v.substring(2,4);
            else this.value = v;
        });
    }

    // Form submit
    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("Payment form submit!");

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

        // Ellenőrizni, hogy minden mező létezik
        for (let key in fields) {
            if (!fields[key]) {
                console.error(`Input mező nem található: ${key}`);
                return;
            }
        }

        let isValid = true;

        // Segédfüggvény a hiba megjelenítésére/elrejtésére
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
            console.log("Fizetés validáció sikeres, kosár törlése...");
            
            // Kosár törlése (localStorage + Firebase)
            await clearCart();

            // Form eltüntetése, siker üzenet mutatása
            paymentForm.style.display = 'none';
            const successBox = document.getElementById('success-message');
            if (successBox) {
                successBox.style.display = 'block';
            }

            console.log("Sikeres fizetés adatai:", {
                nev: fields.name.value,
                cim: `${fields.zip.value} ${fields.city.value}, ${fields.address.value}`
            });
        } else {
            console.log("Fizetés validáció sikertelen!");
        }
    });
});
