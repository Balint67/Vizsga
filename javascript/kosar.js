document.addEventListener("DOMContentLoaded", () => {
    // 1. Kosár ikon számának frissítése (minden oldalon lefut)
    updateCartCount();

    // 2. Ellenőrizzük, hogy a kosár oldalon vagyunk-e
    const cartItemsContainer = document.getElementById("cart-items-container");
    const totalPriceElement = document.getElementById("total-price");
    const checkoutBtn = document.getElementById("checkout-btn");

    if (cartItemsContainer) {
        renderCart(cartItemsContainer, totalPriceElement, checkoutBtn);
    }
});

// -------- KOSÁR MEGJELENÍTÉSE --------
function renderCart(container, totalElem, checkoutBtn) {
    // Kiolvassuk az adatokat, amit a shop.js mentett el
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    container.innerHTML = ""; // Töröljük a jelenlegi tartalmat

    // Ha üres a kosár
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; font-size: 18px;">A kosarad jelenleg üres.</p>';
        if (totalElem) totalElem.innerText = "0 Ft";
        if (checkoutBtn) checkoutBtn.style.display = "none"; // Fizetés gomb elrejtése
        return;
    }

    // Ha van benne termék
    if (checkoutBtn) checkoutBtn.style.display = "block";
    let totalAmount = 0;

    cart.forEach(item => {
        // Ár hozzáadása a végösszeghez (már számként van tárolva a shop.js miatt)
        totalAmount += Number(item.price);

        // HTML elem létrehozása
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");

        // Formázott ár (ezres tagolás)
        const formattedPrice = Number(item.price).toLocaleString('hu-HU');

        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="item-info">
                <h3>${item.title}</h3>
                <p>Méret: <span style="color: #00ca65; font-weight: bold;">${item.size}</span></p>
                <p>${formattedPrice} Ft</p>
            </div>
            <button class="delete-btn" onclick="removeFromCart(${item.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        container.appendChild(itemDiv);
    });

    // Végösszeg kiírása formázva
    if (totalElem) {
        totalElem.innerText = totalAmount.toLocaleString('hu-HU') + " Ft";
    }
}

// -------- TÖRLÉS FUNKCIÓ --------
// A window objektumhoz adjuk, hogy az onclick="" attribútumból elérhető legyen
window.removeFromCart = function(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Kiszűrjük azt az elemet, aminek az ID-ja megegyezik a törlendővel
    // Az ID-k egyediek (Date.now() miatt a shop.js-ben)
    const newCart = cart.filter(item => item.id !== id);

    // Visszamentjük a frissített listát
    localStorage.setItem("cart", JSON.stringify(newCart));

    // Újrarajzoljuk az oldalt
    const container = document.getElementById("cart-items-container");
    const totalElem = document.getElementById("total-price");
    const checkoutBtn = document.getElementById("checkout-btn");

    renderCart(container, totalElem, checkoutBtn);
    updateCartCount(); // Frissítjük a piros számot is
};

// -------- NAVIGÁCIÓS IKON SZÁMLÁLÓ --------
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const countElement = document.getElementById("cart-count");
    if (countElement) {
        countElement.innerText = cart.length;
    }
}

// -------- FIZETÉS GOMB --------
const payBtn = document.getElementById("checkout-btn");
if (payBtn) {
    payBtn.addEventListener("click", () => {
        alert("A fizetési rendszer hamarosan elérhető!");
    });
}