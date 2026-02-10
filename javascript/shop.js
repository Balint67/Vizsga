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
        prices: [2990, 3990]
    },
    "Póló": {
        images: ["images/shirt-white.jpg", "images/shirt-black.png"],
        description: "ForgeX training shirt – breathable, quick-drying material.",
        sizes: ["S", "M", "L", "XL"],
        color: ["Fehér", "Fekete"],
        prices: [3990, 3990, 3990, 3990]
    },
    "Protein por": {
        images: [
            "images/proteinVanillia1kg.jpg",
            "images/proteinEper1kg.jpg",
            "images/proteinVanillia2kg.jpg",
            "images/proteinEper2kg.jpg"
        ],
        description: "ForgeX whey protein – premium quality whey protein.",
        sizes: ["1kg", "2kg"],
        color: ["Vanília", "Eper"],
        prices: [24990, 39990]
    },
    "Kreatin": {
        images: ["images/kreatin.jpg"],
        description: "100% creatine monohydrate 500g – for performance enhancement.",
        sizes: ["500g", "1kg"],
        prices: [6990, 12990]
    },
    "Nadrág": {
        images: ["images/pants-white.png", "images/pants-black.jpeg"],
        description: "ForgeX women's sports pants – comfortable and flexible.",
        sizes: ["XS", "S", "M", "L"],
        color: ["Fehér", "Fekete"],
        prices: [4990, 4990, 4990, 4990]
    },
    "Sportcipő": {
        images: ["images/shoe-white.png", "images/shoe-black.png"],
        description: "ForgeX running shoes – lightweight, flexible sole.",
        sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
        color: ["Fehér", "Fekete"],
        prices: [12990, 12990, 12990, 12990, 12990, 12990, 12990, 12990]
    },
    "Sapka": {
        images: ["images/hat-white.jpg", "images/hat-black.jpeg", "images/hat-green.jpeg"],
        description: "ForgeX hat – stylish and comfortable.",
        sizes: ["M", "L"],
        color: ["Fehér", "Fekete", "Zöld"],
        prices: [3990, 3990]
    },
    "Sporttáska": {
        images: ["images/bag-black.jpg", "images/bag-green.jpg"],
        description: "ForgeX gym bag – multiple pockets, durable material.",
        sizes: ["25L", "45L"],
        color: ["Fekete", "Zöld"],
        prices: [17990, 27990]
    },
    "Fehérje szelet": {
        images: ["images/proteinBarCoconut.jpg", "images/proteinBarWhiteChoclate.jpg", "images/proteinBar100g.jpg"],
        description: "ForgeX protein bar – energy-rich snack.",
        sizes: ["50g", "100g"],
        color: ["Kókuszos", "Fehércsokis"],
        prices: [990, 1790]
    }
};

document.addEventListener("DOMContentLoaded", () => {
    let currentUserId = null;
    const profileLink = document.getElementById('profile-link');
    let currentProductData = null;

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

    const modalImg = document.getElementById("modal-img");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalPrice = document.getElementById("modal-price");
    const sizeContainer = document.getElementById("size-selector-container");
    const colorContainer = document.getElementById("color-selector-container");

    /**
     * Authentication State Listener
     */
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            if (profileLink) profileLink.href = "profil.html";
            // Sync from Firebase - don't clear local storage on page load
            // This preserves user's local additions until they log out
            await syncCartFromFirestore();
            await syncFavoritesFromFirestore();
            console.log("✅ User logged in:", currentUserId);
        } else {
            // Only clear on logout
            currentUserId = null;
            localStorage.removeItem("cart");
            localStorage.removeItem("favorites");
            if (profileLink) profileLink.href = "signIn.html";
            updateCartCount();
            console.log("🚪 User logged out");
        }
    });

    /**
     * Persists local cart to Firestore
     */
    async function saveCartToCloud() {
        if (!currentUserId) {
            console.warn("❌ Cannot save cart - user not logged in");
            return;
        }

        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        try {
            await setDoc(doc(db, "carts", currentUserId), {
                items: localCart,
                updatedAt: new Date()
            });
            console.log("✅ Cart saved to Firebase:", localCart.length, "items");
        } catch (error) {
            console.error("❌ Error saving cart to cloud:", error);
        }
    }

    /**
     * Loads cart from Firestore into LocalStorage
     */
    async function syncCartFromFirestore() {
        if (!currentUserId) return;

        try {
            const cartSnap = await getDoc(doc(db, "carts", currentUserId));
            if (cartSnap.exists()) {
                const cloudCart = cartSnap.data().items || [];
                localStorage.setItem("cart", JSON.stringify(cloudCart));
                updateCartCount();
                console.log("✅ Cart loaded from Firebase:", cloudCart.length, "items");
            } else {
                // No cart exists yet - keep local items
                const localCartCount = (JSON.parse(localStorage.getItem("cart")) || []).length;
                console.log("ℹ️ No cloud cart found. Using local cart:", localCartCount, "items");
            }
        } catch (error) {
            console.error("❌ Error loading cart from cloud:", error);
        }
    }

    /**
     * Updates the product image based on selected size and color
     */
    function updateProductImage() {
        if (!currentProductData) return;

        const sizes = sizeContainer.querySelectorAll(".size-option");
        const colors = colorContainer.querySelectorAll(".size-option");

        let sizeIndex = 0;
        sizes.forEach((btn, idx) => { if (btn.classList.contains("active")) sizeIndex = idx; });

        let colorIndex = 0;
        colors.forEach((btn, idx) => { if (btn.classList.contains("active")) colorIndex = idx; });

        const colorCount = currentProductData.color ? currentProductData.color.length : 1;
        const complexIndex = (sizeIndex * colorCount) + colorIndex;

        // Fallback logic for image selection
        if (currentProductData.images[complexIndex] !== undefined) {
            modalImg.src = currentProductData.images[complexIndex];
        } else if (currentProductData.images[colorIndex] !== undefined) {
            modalImg.src = currentProductData.images[colorIndex];
        } else {
            modalImg.src = currentProductData.images[0];
        }
    }

    /**
     * Renders size options in the modal
     */
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

    /**
     * Renders color options in the modal
     */
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

    /**
     * Adds an item to the cart and synchronizes state
     */
    async function addToCart(title, price, size, color, image) {
        const product = {
            id: `${title}_${size}_${color ?? "no-color"}`,
            title: `${title} ${size}${color ? " " + color : ""}`,
            price,
            size,
            color,
            image,
            quantity: 1
        };

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));

        updateCartCount();
        console.log("✅ Added to cart:", product.title);

        if (currentUserId) {
            await saveCartToCloud();
        } else {
            console.warn("❌ Item added to cart but not logged in - not syncing to cloud");
        }

        await forgeXModal("Kosárba téve", `${product.title} bekerült a kosaramba!`);
    }

    /**
     * Updates the UI cart counter
     */
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const el = document.getElementById("cart-count");
        if (el) el.innerText = cart.length;
    }

    // --- Favorites helpers ---
    function getFavorites() {
        return JSON.parse(localStorage.getItem("favorites")) || [];
    }

    function saveFavorites(list) {
        localStorage.setItem("favorites", JSON.stringify(list));
    }

    async function saveFavoritesToCloud() {
        if (!currentUserId) {
            console.warn("❌ Cannot save favorites - user not logged in");
            return;
        }

        const localFavorites = getFavorites();
        try {
            await setDoc(doc(db, "favorites", currentUserId), {
                items: localFavorites,
                updatedAt: new Date()
            });
            console.log("✅ Favorites saved to Firebase:", localFavorites.length, "items");
        } catch (error) {
            console.error("❌ Error saving favorites to cloud:", error);
        }
    }

    async function syncFavoritesFromFirestore() {
        if (!currentUserId) return;

        try {
            const favSnap = await getDoc(doc(db, "favorites", currentUserId));
            if (favSnap.exists()) {
                const cloudFavorites = favSnap.data().items || [];
                localStorage.setItem("favorites", JSON.stringify(cloudFavorites));
                console.log("✅ Favorites loaded from Firebase:", cloudFavorites.length, "items");
            } else {
                // No favorites exist yet for this user - keep local
                const localFavCount = (JSON.parse(localStorage.getItem("favorites")) || []).length;
                console.log("ℹ️ No cloud favorites found. Using local favorites:", localFavCount, "items");
            }
        } catch (error) {
            console.error("❌ Error loading favorites from cloud:", error);
        }
    }

    function makeFavoriteId(title, size, color) {
        return `${title}_${size}_${color ?? 'no-color'}`.replace(/\s+/g, "_");
    }

    function isFavorite(id) {
        return getFavorites().some(f => f.id === id);
    }

    async function toggleFavorite(currentTitle, price, size, color, image) {
        const id = makeFavoriteId(currentTitle, size, color);
        const favs = getFavorites();
        const existingIndex = favs.findIndex(f => f.id === id);

        if (existingIndex >= 0) {
            favs.splice(existingIndex, 1);
            saveFavorites(favs);
            console.log("✅ Removed from favorites:", `${currentTitle} ${size}${color ? ' ' + color : ''}`);
            await forgeXModal("Eltávolítva", `${currentTitle} eltávolítva a kedvencek közül.`);
            if (currentUserId) {
                await saveFavoritesToCloud();
            } else {
                console.warn("❌ Favorite removed but not logged in - not syncing to cloud");
            }
            return false;
        } else {
            const item = { id, title: `${currentTitle} ${size}${color ? ' ' + color : ''}`, price, size, color, image };
            favs.push(item);
            saveFavorites(favs);
            console.log("✅ Added to favorites:", item.title);
            await forgeXModal("Hozzáadva", `${item.title} bekerült a kedvencek közé.`);
            if (currentUserId) {
                await saveFavoritesToCloud();
            } else {
                console.warn("❌ Favorite added but not logged in - not syncing to cloud");
            }
            return true;
        }
    }

    function updateModalFavoriteUI() {
        const favBtn = modal.querySelector('.favorite-btn');
        const title = modalTitle.innerText;
        const sizeEl = sizeContainer.querySelector('.size-option.active');
        const size = sizeEl ? sizeEl.innerText : '';
        const colorEl = colorContainer.querySelector('.size-option.active');
        const color = colorEl ? colorEl.innerText : null;
        const id = makeFavoriteId(title, size, color);

        if (!favBtn) return;
        const icon = favBtn.querySelector('i');
        if (isFavorite(id)) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            favBtn.classList.add('active');
            icon.style.color = 'red';
        } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            favBtn.classList.remove('active');
            icon.style.color = '';
        }
    }

    // --- Event Listeners ---

    // Product card click handling
    document.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("click", async (e) => {
            const title = card.querySelector("h3").innerText;
            const data = PRODUCT_DATA[title];
            if (!data) return;

            // Direct add from card button
            if (e.target.classList.contains("login-btn")) {
                await addToCart(title, data.prices[0], data.sizes[0], data.color ? data.color[0] : null, data.images[0]);
                return;
            }

            // Open Modal
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

    // Add to cart from modal
    modal.querySelector(".login-btn").addEventListener("click", async () => {
        const title = modalTitle.innerText;
        const sizeEl = sizeContainer.querySelector(".size-option.active");
        const size = sizeEl ? sizeEl.innerText : "";
        const colorEl = colorContainer.querySelector(".size-option.active");
        const color = colorEl ? colorEl.innerText : null;
        const price = parseInt(modalPrice.innerText.replace(/\D/g, ""));
        const image = modalImg.src;

        await addToCart(title, price, size, color, image);
        modal.style.display = "none";
    });

    // Favorite button handler
    const favBtn = modal.querySelector('.favorite-btn');
    if (favBtn) {
        favBtn.addEventListener('click', async (e) => {
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
    }

    // Close modal handlers
    modal.querySelector(".close-btn").onclick = () => modal.style.display = "none";
    window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

    // Initial cart count
    updateCartCount();
});