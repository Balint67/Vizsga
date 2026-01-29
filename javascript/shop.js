import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { forgeXModal } from './utils.js';

document.addEventListener("DOMContentLoaded", () => {
    let currentUserId = null;
    // Ezt a sort add hozzá:
    const profileLink = document.getElementById('profile-link');


    // --- 1. FIRESTORE SZINKRONIZÁCIÓ ---

    // Listen for login state and load cart from cloud
// --- 1. FIRESTORE SZINKRONIZÁCIÓ ---

    // Listen for login state and load cart from cloud
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;

            // --- ÚJ: Profil link átállítása ---
            if (profileLink) profileLink.href = "profil.html";

            console.log("User logged in, syncing cart...");
            await syncCartFromFirestore();
        } else {
            currentUserId = null;

            // --- ÚJ: Bejelentkezés link visszaállítása ---
            if (profileLink) profileLink.href = "signIn.html";

            updateCartCount();
        }
    });

    // Save local cart to Firestore if logged in
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

    // Load cart from Firestore and merge with local storage
    async function syncCartFromFirestore() {
        if (!currentUserId) return;

        try {
            const cartSnap = await getDoc(doc(db, "carts", currentUserId));
            if (cartSnap.exists()) {
                const cloudCart = cartSnap.data().items || [];
                // Here we prioritize the cloud cart
                localStorage.setItem("cart", JSON.stringify(cloudCart));
                updateCartCount();
                console.log("Cart loaded from cloud.");
            }
        } catch (error) {
            console.error("Error loading cart from cloud:", error);
        }
    }

    // -------- TERMÉK ADATOK (Változatlan) --------
    const productData = {
        "Shaker": {
            images: ["images/shaker-white.png", "images/shaker-black.png"],
            description: "ForgeX shaker 0,7L – prémium minőségű, BPA-mentes műanyag, tökéletes edzéshez.",
            sizes: ["0.7L", "1L"],
            color: ["Fehér", "Fekete"],
            prices: [2990, 3990]
        },
        "Póló": {
            images: ["images/shirt-white.jpg", "images/shirt-black.png"],
            description: "ForgeX edzőpóló – légáteresztő, gyorsan száradó anyag.",
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
            description: "ForgeX whey protein – prémium minőségű tejsavó fehérje.",
            sizes: ["1kg", "2kg"],
            color: ["Vanília", "Eper"],
            prices: [24990, 39990]
        },
        "Kreatin": {
            images: ["images/kreatin.jpg"],
            description: "100% kreatin-monohidrát 500g – teljesítménynövelésre.",
            sizes: ["500g", "1kg"],
            prices: [6990, 12990]
        },
        "Nadrág": {
            images: ["images/pants-white.png", "images/pants-black.jpeg"],
            description: "ForgeX női sportnadrág – kényelmes és rugalmas.",
            sizes: ["XS", "S", "M", "L"],
            color: ["Fehér", "Fekete"],
            prices: [4990, 4990, 4990, 4990]
        },
        "Sportcipő": {
            images: ["images/shoe-white.png", "images/shoe-black.png"],
            description: "ForgeX futócipő – könnyű, rugalmas talp.",
            sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
            color: ["Fehér", "Fekete"],
            prices: [12990, 12990, 12990, 12990, 12990, 12990, 12990, 12990]
        },
        "Sapka": {
            images: ["images/hat-white.jpg", "images/hat-black.jpeg", "images/hat-green.jpeg"],
            description: "ForgeX sapka – stílusos és kényelmes.",
            sizes: ["M", "L"],
            color: ["Fehér", "Fekete", "Zöld"],
            prices: [3990, 3990]
        },
        "Sporttáska": {
            images: ["images/bag-black.jpg", "images/bag-green.jpg"],
            description: "ForgeX sporttáska – sok zsebbel, tartós anyagból.",
            sizes: ["25L", "45L"],
            color: ["Fekete", "Zöld"],
            prices: [17990, 27990]
        },
        "Fehérje szelet": {
            images: ["images/proteinBarCoconut.jpg", "images/proteinBarWhiteChoclate.jpg", "images/proteinBar100g.jpg"],
            description: "ForgeX fehérje szelet – energiadús snack.",
            sizes: ["50g", "100g"],
            color: ["Kókuszos", "Fehércsokis"],
            prices: [990, 1790]
        }
    };

    // -------- MODAL LÉTREHOZÁSA (Változatlan) --------
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

    let currentProductData = null;

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
        const simpleIndex = colorIndex;

        if (currentProductData.images[complexIndex] !== undefined) {
            modalImg.src = currentProductData.images[complexIndex];
        } else if (currentProductData.images[simpleIndex] !== undefined) {
            modalImg.src = currentProductData.images[simpleIndex];
        } else {
            modalImg.src = currentProductData.images[0];
        }
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
            });
            wrapper.appendChild(btn);
        });
        colorContainer.appendChild(wrapper);
    }

    // -------- TERMÉK KATTINTÁS ESEMÉNY (Frissítve) --------
    document.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("click", async (e) => {
            const title = card.querySelector("h3").innerText;
            const data = productData[title];
            if (!data) return;

            if (e.target.classList.contains("login-btn")) {
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
        });
    });

    // -------- KOSÁRBA TÉTEL A MODALBÓL (Frissítve) --------
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

    // --- KOSÁR LOGIKA (Adatbázis támogatással) ---
    async function addToCart(title, price, size, color, image) {
        const product = {
            id: Date.now(),
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

        // Sync with Firestore if user is logged in
        if (currentUserId) {
            await saveCartToCloud();
        }

        // Custom ForgeX Modal for confirmation
        await forgeXModal("Kosárba téve", `${product.title} bekerült a kosaradba!`);
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const el = document.getElementById("cart-count");
        if (el) el.innerText = cart.length;
    }

    // Modal closing logic
    modal.querySelector(".close-btn").onclick = () => modal.style.display = "none";
    window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

    updateCartCount();
});