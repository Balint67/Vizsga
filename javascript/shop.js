import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { forgeXModal } from './utils.js';

/**
 * Product Catalog Data
 */
const PRODUCT_DATA = {
    "Shaker": {
        images: ["images/shaker-white.png", "images/shaker-black.png"],
        description: "ForgeX shaker 0,7L – premium quality, BPA-free plastic, perfect for workouts.",
        sizes: ["0.7L", "1L"],
        color: ["Fehér", "Fekete"],
        prices: [2990, 3990],
        category: "supplement"
    },
    "Póló": {
        images: ["images/shirt-white.jpg", "images/shirt-black.png"],
        description: "ForgeX training shirt – breathable, quick-drying material.",
        sizes: ["S", "M", "L", "XL"],
        color: ["Fehér", "Fekete"],
        prices: [3990, 3990, 3990, 3990],
        category: "clothing"
    },
    "Protein por": {
        images: ["images/proteinVanillia1kg.jpg", "images/proteinEper1kg.jpg"],
        description: "ForgeX whey protein – premium quality whey protein.",
        sizes: ["1kg", "2kg"],
        color: ["Vanília", "Eper"],
        prices: [24990, 39990],
        category: "supplement"
    },
    "Kreatin": {
        images: ["images/kreatin.jpg"],
        description: "100% creatine monohydrate 500g – for performance enhancement.",
        sizes: ["500g", "1kg"],
        prices: [6990, 12990],
        category: "supplement"
    },
    "Nadrág": {
        images: ["images/pants-white.png", "images/pants-black.jpeg"],
        description: "ForgeX women's sports pants – comfortable and flexible.",
        sizes: ["XS", "S", "M", "L"],
        color: ["Fehér", "Fekete"],
        prices: [4990, 4990, 4990, 4990],
        category: "clothing"
    },
    "Sportcipő": {
        images: ["images/shoe-white.png", "images/shoe-black.png"],
        description: "ForgeX running shoes – lightweight, flexible sole.",
        sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
        color: ["Fehér", "Fekete"],
        prices: [12990, 12990],
        category: "clothing"
    },
    "Sapka": {
        images: ["images/hat-white.jpg", "images/hat-black.jpeg"],
        description: "ForgeX hat – stylish and comfortable.",
        sizes: ["M", "L"],
        color: ["Fehér", "Fekete"],
        prices: [3990, 3990],
        category: "clothing"
    },
    "Sporttáska": {
        images: ["images/bag-black2.jpg"],
        description: "ForgeX gym bag – multiple pockets, durable material.",
        sizes: ["25L", "45L"],
        color: ["Fekete"],
        prices: [17990, 27990],
        category: "clothing"
    },
    "Fehérje szelet": {
        images: ["images/proteinBarCoconut.jpg"],
        description: "ForgeX protein bar – energy-rich snack.",
        sizes: ["50g", "100g"],
        color: ["Kókuszos"],
        prices: [990, 1790],
        category: "supplement"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    let currentUserId = null;
    const profileLink = document.getElementById('profile-link');
    let currentProductData = null;

    // --- Szűrő elemek kiválasztása ---
    const searchInput = document.getElementById('shop-search');
    const categoryButtons = document.querySelectorAll('.cat-btn');
    const sortSelect = document.getElementById('price-sort');
    const productGrid = document.querySelector('.products-grid');

    // Eredeti sorrend elmentése az alapértelmezett rendezéshez
    const originalOrder = Array.from(document.querySelectorAll('.product-card'));
    let allProductCards = [...originalOrder];

    // --- Modal Element Setup ---
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <div class="modal-images">
                <img id="modal-img">
            </div>
            <h2 id="modal-title"></h2>
            <p id="modal-description"></p>
            <div id="size-selector-container"></div>
            <div id="color-selector-container"></div>
            <p id="modal-price"></p>
            <div class="modal-actions">
                <button class="favorite-btn" aria-label="Kedvencek"><i class="fa-regular fa-heart"></i></button>
                <button class="login-btn">Hozzáadás a kosárhoz</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector("#modal-img");
    const modalTitle = modal.querySelector("#modal-title");
    const modalDescription = modal.querySelector("#modal-description");
    const modalPrice = modal.querySelector("#modal-price");
    const sizeContainer = modal.querySelector("#size-selector-container");
    const colorContainer = modal.querySelector("#color-selector-container");

    // ==========================================
    // SZŰRÉS ÉS KERESÉS FUNKCIÓK
    // ==========================================

    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.cat-btn.active').dataset.category;

        allProductCards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const productInfo = PRODUCT_DATA[card.querySelector('h3').innerText];

            const matchesSearch = title.includes(searchTerm);
            const matchesCategory = (activeCategory === 'all') || (productInfo && productInfo.category === activeCategory);

            card.style.display = (matchesSearch && matchesCategory) ? "block" : "none";
        });
    }

    function sortProducts() {
        const sortValue = sortSelect.value;

        if (sortValue === "default") {
            // Visszaállítjuk az eredeti HTML sorrendet
            originalOrder.forEach(card => productGrid.appendChild(card));
            return;
        }

        // Rendezés ár alapján
        allProductCards.sort((a, b) => {
            const priceA = parseInt(a.querySelector('.product-price').innerText.replace(/\D/g, ""));
            const priceB = parseInt(b.querySelector('.product-price').innerText.replace(/\D/g, ""));

            return sortValue === "asc" ? priceA - priceB : priceB - priceA;
        });

        // Grid frissítése
        allProductCards.forEach(card => productGrid.appendChild(card));
    }

    // --- Eseménykezelők ---
    searchInput.addEventListener('input', filterProducts);
    sortSelect.addEventListener('change', sortProducts);
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProducts();
        });
    });

    // ==========================================
    // EREDETI FUNKCIÓK (Kosár, Kedvencek, Auth)
    // ==========================================

    onAuthStateChanged(auth, async (user) => {
        localStorage.removeItem("cart");
        if (user) {
            currentUserId = user.uid;
            await syncCartFromFirestore();
            await syncFavoritesFromFirestore();
        } else {
            currentUserId = null;
            updateCartCount();
        }
    });

    async function saveCartToCloud() {
        if (!currentUserId) return;
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        try {
            await setDoc(doc(db, "carts", currentUserId), { items: localCart, updatedAt: new Date() });
        } catch (error) { console.error(error); }
    }

    async function syncCartFromFirestore() {
        if (!currentUserId) return;
        try {
            const cartSnap = await getDoc(doc(db, "carts", currentUserId));
            if (cartSnap.exists()) {
                localStorage.setItem("cart", JSON.stringify(cartSnap.data().items || []));
                updateCartCount();
            }
        } catch (error) { console.error(error); }
    }

    function updateProductImage() {
        if (!currentProductData) return;
        const sizeIndex = Array.from(sizeContainer.querySelectorAll(".size-option")).findIndex(b => b.classList.contains("active"));
        const colorIndex = Array.from(colorContainer.querySelectorAll(".size-option")).findIndex(b => b.classList.contains("active"));
        const colorCount = currentProductData.color ? currentProductData.color.length : 1;
        const complexIndex = (sizeIndex * colorCount) + (colorIndex >= 0 ? colorIndex : 0);
        modalImg.src = currentProductData.images[complexIndex] || currentProductData.images[0];
    }

    function updateSizeSelector(sizes, prices) {
        sizeContainer.innerHTML = "";
        const wrapper = document.createElement("div");
        wrapper.classList.add("size-selector");
        sizes.forEach((size, index) => {
            const btn = document.createElement("div");
            btn.classList.add("size-option");
            btn.innerText = size;
            if (index === 0) btn.classList.add("active");
            btn.addEventListener("click", () => {
                wrapper.querySelectorAll(".size-option").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                modalPrice.innerText = prices[index] + " Ft";
                updateProductImage();
                updateModalFavoriteUI();
            });
            wrapper.appendChild(btn);
        });
        sizeContainer.appendChild(wrapper);
        modalPrice.innerText = prices[0] + " Ft";
    }

    function updateColorSelector(colors) {
        colorContainer.innerHTML = "";
        if (!colors) return;
        const wrapper = document.createElement("div");
        wrapper.classList.add("size-selector");
        colors.forEach((color, index) => {
            const btn = document.createElement("div");
            btn.classList.add("size-option");
            btn.innerText = color;
            if (index === 0) btn.classList.add("active");
            btn.addEventListener("click", () => {
                wrapper.querySelectorAll(".size-option").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                updateProductImage();
                updateModalFavoriteUI();
            });
            wrapper.appendChild(btn);
        });
        colorContainer.appendChild(wrapper);
    }

    async function addToCart(title, price, size, color, image) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push({ id: Date.now(), title, price, size, color, image, quantity: 1 });
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        if (currentUserId) await saveCartToCloud();
        await forgeXModal("Kosárba téve", `${title} bekerült a kosaradba!`);
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const el = document.getElementById("cart-count");
        if (el) el.innerText = cart.length;
    }

    function getFavorites() { return JSON.parse(localStorage.getItem("favorites")) || []; }

    function saveFavorites(list) {
        localStorage.setItem("favorites", JSON.stringify(list));
    }

    async function saveFavoritesToCloud() {
        if (!currentUserId) return;
        const localFavorites = getFavorites();
        try {
            await setDoc(doc(db, "favorites", currentUserId), { items: localFavorites, updatedAt: new Date() });
        } catch (error) { console.error("❌ Error saving favorites to cloud:", error); }
    }

    async function syncFavoritesFromFirestore() {
        if (!currentUserId) return;
        const favSnap = await getDoc(doc(db, "favorites", currentUserId));
        if (favSnap.exists()) localStorage.setItem("favorites", JSON.stringify(favSnap.data().items || []));
    }

    function makeFavoriteId(title, size, color) {
        return `${title}_${size}_${color || "no-color"}`;
    }

    function isFavorite(id) {
        return getFavorites().some(f => f.id === id);
    }

    async function toggleFavorite(title, price, size, color, image) {
        const id = makeFavoriteId(title, size, color);
        const favs = getFavorites();
        const existingIndex = favs.findIndex(f => f.id === id);

        if (existingIndex >= 0) {
            favs.splice(existingIndex, 1);
            saveFavorites(favs);
            await forgeXModal("Eltávolítva", `${title} eltávolítva a kedvencek közül.`);
            if (currentUserId) await saveFavoritesToCloud();
            return false;
        } else {
            const item = { id, title: `${title} ${size}${color ? ' ' + color : ''}`, price, size, color, image };
            favs.push(item);
            saveFavorites(favs);
            await forgeXModal("Hozzáadva", `${title} bekerült a kedvencek közé.`);
            if (currentUserId) await saveFavoritesToCloud();
            return true;
        }
    }

    function updateModalFavoriteUI() {
        const favBtn = modal.querySelector('.favorite-btn');
        if (!favBtn) return;
        const title = modalTitle.innerText;
        const sizeEl = sizeContainer.querySelector('.size-option.active');
        const size = sizeEl ? sizeEl.innerText : '';
        const colorEl = colorContainer.querySelector('.size-option.active');
        const color = colorEl ? colorEl.innerText : null;
        const id = makeFavoriteId(title, size, color);

        const icon = favBtn.querySelector('i');
        if (isFavorite(id)) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            favBtn.classList.add('active');
            icon.style.color = '#ff3333';
        } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            favBtn.classList.remove('active');
            icon.style.color = '';
        }
    }

    // --- Kártyák kattintás kezelése ---
    originalOrder.forEach(card => {
        card.addEventListener("click", async (e) => {
            const title = card.querySelector("h3").innerText;
            const data = PRODUCT_DATA[title];
            if (!data) return;

            if (e.target.classList.contains("login-btn")) {
                e.stopPropagation();
                await addToCart(title, data.prices[0], data.sizes[0], data.color ? data.color[0] : null, data.images[0]);
                return;
            }

            currentProductData = data;
            modalTitle.innerText = title;
            modalDescription.innerText = data.description;
            updateSizeSelector(data.sizes, data.prices);
            updateColorSelector(data.color);
            updateProductImage();
            modal.style.display = "flex";
            updateModalFavoriteUI();
        });
    });

    modal.querySelector(".login-btn").addEventListener("click", async () => {
        await addToCart(
            modalTitle.innerText,
            parseInt(modalPrice.innerText.replace(/\D/g, "")),
            sizeContainer.querySelector(".active").innerText,
            colorContainer.querySelector(".active")?.innerText || null,
            modalImg.src
        );
        modal.style.display = "none";
    });

    modal.querySelector(".favorite-btn").addEventListener("click", async (e) => {
        e.stopPropagation();
        const title = modalTitle.innerText;
        const sizeEl = sizeContainer.querySelector('.size-option.active');
        const size = sizeEl ? sizeEl.innerText : '';
        const colorEl = colorContainer.querySelector('.size-option.active');
        const color = colorEl ? colorEl.innerText : null;
        const price = parseInt(modalPrice.innerText.replace(/\D/g, "")) || 0;
        const image = modalImg.src;

        await toggleFavorite(title, price, size, color, image);
        updateModalFavoriteUI();
    });

    modal.querySelector(".close-btn").onclick = () => modal.style.display = "none";
    window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

    updateCartCount();
});