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
                <button class="prev-img">&#10094;</button>
                <img id="modal-img">
                <button class="next-img">&#10095;</button>
            </div>
            <h2 id="modal-title"></h2>
            <p id="modal-description"></p>
            <div id="size-selector-container"></div>
            <div id="color-selector-container"></div>
            <p id="modal-price"></p>
            <button class="login-btn">Hozzáadás a kosárhoz</button>
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
        // Clear local cart on state change to prevent cross-user data leakage
        localStorage.removeItem("cart");

        if (user) {
            currentUserId = user.uid;
            if (profileLink) profileLink.href = "profil.html";
            await syncCartFromFirestore();
        } else {
            currentUserId = null;
            if (profileLink) profileLink.href = "signIn.html";
            updateCartCount();
        }
    });

    /**
     * Persists local cart to Firestore
     */
    async function saveCartToCloud() {
        if (!currentUserId) return;

        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        try {
            await setDoc(doc(db, "carts", currentUserId), {
                items: localCart,
                updatedAt: new Date()
            });
            console.log("Cart saved to cloud.");
        } catch (error) {
            console.error("Error saving cart to cloud:", error);
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
                console.log("Cart loaded from cloud.");
            }
        } catch (error) {
            console.error("Error loading cart from cloud:", error);
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

        if (currentUserId) {
            await saveCartToCloud();
        }

        await forgeXModal("Kosárba téve", `${product.title} bekerült a kosaradba!`);
    }

    /**
     * Updates the UI cart counter
     */
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const el = document.getElementById("cart-count");
        if (el) el.innerText = cart.length;
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

    // Close modal handlers
    modal.querySelector(".close-btn").onclick = () => modal.style.display = "none";
    window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

    // Initial cart count
    updateCartCount();
});