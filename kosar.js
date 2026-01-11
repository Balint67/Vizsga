document.addEventListener("DOMContentLoaded", () => {
    const cartItemsContainer = document.getElementById("cart-items-container");
    const totalPriceElement = document.getElementById("total-price");
    const checkoutBtn = document.getElementById("checkout-btn");

    // 1. FUNKCIÓ: A kosár tartalmának megjelenítése
    function displayCart() {
        // Kiolvassuk a kosarat a memóriából
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        
        // Ha üres a kosár
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p style='text-align:center; padding: 20px;'>A kosarad jelenleg üres.</p>";
            totalPriceElement.innerText = "0 Ft";
            return;
        }

        // Ha van benne valami, először kiürítjük a konténert
        cartItemsContainer.innerHTML = "";
        let total = 0;

        // Végigmegyünk a termékeken és mindegyiknek gyártunk egy HTML blokkot
        cart.forEach((product, index) => {
            total += product.price;

            const itemDiv = document.createElement("div");
            itemDiv.classList.add("cart-item");
            itemDiv.innerHTML = `
                <img src="${product.image}" alt="${product.title}">
                <div class="item-details">
                    <h3>${product.title}</h3>
                    <p>Méret: ${product.size}</p>
                    <p class="item-price">${product.price.toLocaleString()} Ft</p>
                </div>
                <button class="delete-btn" data-index="${index}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        // Frissítjük a végösszeget
        totalPriceElement.innerText = total.toLocaleString() + " Ft";

        // Törlés gombok aktiválása
        setupDeleteButtons();
    }

    // 2. FUNKCIÓ: Törlés kezelése
    function setupDeleteButtons() {
        const deleteButtons = document.querySelectorAll(".delete-btn");
        deleteButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const index = btn.getAttribute("data-index");
                let cart = JSON.parse(localStorage.getItem("cart")) || [];
                
                // Eltávolítjuk az adott sorszámú elemet a tömbből
                cart.splice(index, 1);
                
                // Elmentjük a frissített listát
                localStorage.setItem("cart", JSON.stringify(cart));
                
                // Újrarajzoljuk a kosarat
                displayCart();
            });
        });
    }

    // 3. FUNKCIÓ: Fizetés gomb (egyelőre csak egy üzenet)
    checkoutBtn.addEventListener("click", () => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length > 0) {
            alert("Köszönjük! A fizetési funkció hamarosan elérhető lesz.");
        } else {
            alert("Üres kosárral nem lehet fizetni!");
        }
    });

    // Indításkor futtassuk le a megjelenítést
    displayCart();
});