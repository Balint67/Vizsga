import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { forgeXModal } from './utils.js';

const PRODUCT_DATA = {
    hat: {
        title: "Sapka",
        cardDescription: "ForgeX sapka",
        description: "ForgeX hat - stylish and comfortable.",
        images: ["images/products/hat-white.jpg", "images/products/hat-black.jpeg"],
        sizes: ["M", "L"],
        colors: ["Feh\u00e9r", "Fekete"],
        prices: [3990, 3990],
        category: "clothing"
    },
    shirt: {
        title: "P\u00f3l\u00f3",
        cardDescription: "ForgeX p\u00f3l\u00f3 edz\u00e9shez",
        description: "ForgeX training shirt - breathable, quick-drying material.",
        images: ["images/products/shirt-white.jpg", "images/products/shirt-black.png"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Feh\u00e9r", "Fekete"],
        prices: [3990, 3990, 3990, 3990],
        category: "clothing"
    },
    pants: {
        title: "Nadr\u00e1g",
        cardDescription: "ForgeX sport nadr\u00e1g",
        description: "ForgeX women's sports pants - comfortable and flexible.",
        images: ["images/products/pants-white.png", "images/products/pants-black.jpeg"],
        sizes: ["XS", "S", "M", "L"],
        colors: ["Feh\u00e9r", "Fekete"],
        prices: [4990, 4990, 4990, 4990],
        category: "clothing"
    },
    protein_powder: {
        title: "Protein por",
        cardDescription: "ForgeX whey protein 1kg",
        description: "ForgeX whey protein - premium quality whey protein.",
        images: [
            "images/products/proteinVanillia1kg.jpg",
            "images/products/proteinEper1kg.jpg",
            "images/products/proteinVanillia2kg.jpg",
            "images/products/proteinEper2kg.jpg"
        ],
        sizes: ["1kg", "2kg"],
        colors: ["Van\u00edlia", "Eper"],
        prices: [24990, 39990],
        category: "supplement"
    },
    creatine: {
        title: "Kreatin",
        cardDescription: "100% kreatin-monohidr\u00e1t 500g",
        description: "100% creatine monohydrate 500g - for performance enhancement.",
        images: ["images/products/kreatin.jpg"],
        sizes: ["500g", "1kg"],
        prices: [6990, 12990],
        category: "supplement"
    },
    protein_bar: {
        title: "Feh\u00e9rje szelet",
        cardDescription: "Feh\u00e9rje szelet",
        description: "ForgeX protein bar - energy-rich snack.",
        images: ["images/products/proteinBarCoconut.jpg", "images/products/proteinBar100g.jpg"],
        sizes: ["50g", "100g"],
        colors: ["K\u00f3kuszos"],
        prices: [990, 1790],
        category: "supplement"
    },
    shoes: {
        title: "Sportcip\u0151",
        cardDescription: "ForgeX fut\u00f3cip\u0151",
        description: "ForgeX running shoes - lightweight, flexible sole.",
        images: ["images/products/shoe-white.png", "images/products/shoe-black.png"],
        sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
        colors: ["Feh\u00e9r", "Fekete"],
        prices: [12990, 12990, 12990, 12990, 12990, 12990, 12990, 12990],
        category: "clothing"
    },
    gym_bag: {
        title: "Sportt\u00e1ska",
        cardDescription: "ForgeX sportt\u00e1ska",
        description: "ForgeX gym bag - multiple pockets, durable material.",
        images: ["images/products/bag-black2.jpg", "images/products/bag-green.jpg"],
        sizes: ["25L", "45L"],
        colors: ["Fekete", "Z\u00f6ld"],
        prices: [17990, 27990],
        category: "clothing"
    },
    shaker: {
        title: "Shaker",
        cardDescription: "ForgeX shaker",
        description: "ForgeX shaker 0,7L - premium quality, BPA-free plastic, perfect for workouts.",
        images: ["images/products/shaker-white.png", "images/products/shaker-black.png"],
        sizes: ["0.7L", "1L"],
        colors: ["Feh\u00e9r", "Fekete"],
        prices: [2990, 3990],
        category: "supplement"
    },
    pass_single: {
        title: "1 alkalmas b\u00e9rlet",
        cardDescription: "Egyszeri bel\u00e9p\u00e9s teljes teremhaszn\u00e1lattal",
        description: "1 alkalmas edz\u0151b\u00e9rlet teljes teremhaszn\u00e1lattal, ide\u00e1lis kipr\u00f3b\u00e1l\u00e1shoz vagy alkalmi edz\u00e9shez.",
        images: ["images/products/pass-single.svg"],
        sizes: [],
        prices: [2990],
        category: "passes"
    },
    pass_ten: {
        title: "10 alkalmas b\u00e9rlet",
        cardDescription: "Rugalmas t\u00f6mbb\u00e9rlet rendszeres edz\u00e9shez",
        description: "10 alkalmas edz\u0151b\u00e9rlet kedvez\u0151bb alkalmi \u00e1rral, ha rendszeresen, de rugalmasan szeretn\u00e9l edzeni.",
        images: ["images/products/pass-ten.svg"],
        sizes: [],
        prices: [19990],
        category: "passes"
    },
    pass_monthly: {
        title: "1 h\u00f3napos b\u00e9rlet",
        cardDescription: "Korl\u00e1tlan havi teremhaszn\u00e1lat",
        description: "1 h\u00f3napos korl\u00e1tlan edz\u0151b\u00e9rlet, ha egy teljes h\u00f3napon \u00e1t szeretn\u00e9l rendszeresen j\u00e1rni.",
        images: ["images/products/pass-month.svg"],
        sizes: [],
        prices: [24990],
        category: "passes"
    },
    pass_yearly: {
        title: "1 \u00e9ves b\u00e9rlet",
        cardDescription: "Pr\u00e9mium, korl\u00e1tlan \u00e9ves tags\u00e1g",
        description: "1 \u00e9ves korl\u00e1tlan edz\u0151b\u00e9rlet a legjobb hossz\u00fat\u00e1v\u00fa \u00e9rt\u00e9kkel \u00e9s folyamatos teremhaszn\u00e1lattal.",
        images: ["images/products/pass-year.svg"],
        sizes: [],
        prices: [199990],
        category: "passes"
    }
};

const PRODUCT_ORDER = Object.keys(PRODUCT_DATA);

document.addEventListener("DOMContentLoaded", () => {
    let currentUserId = null;
    let currentProductId = null;
    let currentProductData = null;

    const searchInput = document.getElementById('shop-search');
    const categoryButtons = document.querySelectorAll('.cat-btn');
    const sortSelect = document.getElementById('price-sort');
    const productGrid = document.querySelector('.products-grid');

    renderProductCards(PRODUCT_ORDER);

    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
        <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <span class="close-btn" role="button" tabindex="0" aria-label="Bezárás">&times;</span>
            <div class="modal-layout">
                <div class="modal-gallery">
                    <div class="modal-images">
                        <img id="modal-img" alt="">
                    </div>
                </div>
                <div class="modal-details">
                    <h2 id="modal-title"></h2>
                    <p id="modal-description"></p>
                    <div id="size-selector-container"></div>
                    <div id="color-selector-container"></div>
                    <p id="modal-price"></p>
                    <div class="modal-actions">
                        <button class="favorite-btn" aria-label="Kedvencek"><i class="fa-regular fa-heart"></i></button>
                        <button class="addToCart-btn">Hozz\u00e1ad\u00e1s a kos\u00e1rhoz</button>
                    </div>
                </div>
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
    const closeButton = modal.querySelector(".close-btn");

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
        return `${new Intl.NumberFormat('hu-HU').format(price)} Ft`;
    }

    function getProductInfo(productId) {
        return PRODUCT_DATA[productId] || null;
    }

    function createProductCard(productId) {
        const product = getProductInfo(productId);
        if (!product) return null;

        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.productId = productId;
        card.innerHTML = `
            <img src="${product.images[0]}" alt="${product.title}" class="product-image">
            <h3>${product.title}</h3>
            <p class="product-description">${product.cardDescription}</p>
            <p class="product-price">${formatPrice(product.prices[0])}</p>
            <button class="addToCart-btn">Kos\u00e1rba</button>
        `;

        card.addEventListener("click", async (event) => {
            const cardProductId = card.dataset.productId;
            const data = getProductInfo(cardProductId);
            if (!data) return;

            if (event.target.classList.contains("addToCart-btn")) {
                event.stopPropagation();
                await addToCart(
                    cardProductId,
                    data.title,
                    data.prices[0],
                    data.sizes[0],
                    data.colors ? data.colors[0] : null,
                    data.images[0]
                );
                return;
            }

            openProductModal(cardProductId);
        });

        return card;
    }

    function renderProductCards(productIds) {
        productGrid.innerHTML = "";
        productIds.forEach((productId) => {
            const card = createProductCard(productId);
            if (card) productGrid.appendChild(card);
        });
    }

    function getFilteredProductIds() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const activeCategory = document.querySelector('.cat-btn.active')?.dataset.category || 'all';

        return PRODUCT_ORDER.filter((productId) => {
            const product = getProductInfo(productId);
            if (!product) return false;

            const haystack = `${product.title} ${product.cardDescription} ${product.description}`.toLowerCase();
            const matchesSearch = haystack.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }

    function applyFiltersAndSorting() {
        let visibleProductIds = getFilteredProductIds();
        const sortValue = sortSelect.value;

        if (sortValue === "asc" || sortValue === "desc") {
            visibleProductIds.sort((firstId, secondId) => {
                const firstPrice = getProductInfo(firstId)?.prices[0] ?? 0;
                const secondPrice = getProductInfo(secondId)?.prices[0] ?? 0;
                return sortValue === "asc" ? firstPrice - secondPrice : secondPrice - firstPrice;
            });
        } else {
            visibleProductIds = PRODUCT_ORDER.filter((productId) => visibleProductIds.includes(productId));
        }

        renderProductCards(visibleProductIds);
    }

    searchInput.addEventListener('input', applyFiltersAndSorting);
    sortSelect.addEventListener('change', applyFiltersAndSorting);
    categoryButtons.forEach((button) => {
        button.addEventListener('click', () => {
            categoryButtons.forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            applyFiltersAndSorting();
        });
    });

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            await syncCartFromFirestore();
            await syncFavoritesFromFirestore();
        } else {
            currentUserId = null;
            clearLocalCommerceState();
            updateModalFavoriteUI();
        }
    });

    function clearLocalCommerceState() {
        localStorage.removeItem("cart");
        localStorage.removeItem("favorites");
        window.dispatchEvent(new Event('storage'));
    }

    async function requireAuthenticatedUser(actionLabel) {
        if (currentUserId) return true;

        await forgeXModal(
            "Bejelentkez\u00e9s sz\u00fcks\u00e9ges",
            `A ${actionLabel} m\u0171velethez el\u0151bb jelentkezz be.`
        );
        window.location.href = "signIn.html";
        return false;
    }

    async function syncCartFromFirestore() {
        if (!currentUserId) return;
        try {
            const cartSnap = await getDoc(doc(db, "carts", currentUserId));
            const cloudCart = cartSnap.exists() ? (cartSnap.data().items || []) : [];
            const normalizedCart = cloudCart.map((item) => ({
                ...item,
                image: normalizeImagePath(item.image)
            }));
            localStorage.setItem("cart", JSON.stringify(normalizedCart));
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error(error);
        }
    }

    async function syncFavoritesFromFirestore() {
        if (!currentUserId) return;
        try {
            const favSnap = await getDoc(doc(db, "favorites", currentUserId));
            const cloudFavorites = favSnap.exists() ? (favSnap.data().items || []) : [];
            const normalizedFavorites = cloudFavorites.map((item) => ({
                ...item,
                image: normalizeImagePath(item.image)
            }));
            localStorage.setItem("favorites", JSON.stringify(normalizedFavorites));
        } catch (error) {
            console.error("Error syncing favorites:", error);
        }
    }

    function updateProductImage() {
        if (!currentProductData) return;

        const sizeIndex = Array.from(sizeContainer.querySelectorAll(".size-option")).findIndex((button) => button.classList.contains("active"));
        const colorIndex = Array.from(colorContainer.querySelectorAll(".size-option")).findIndex((button) => button.classList.contains("active"));

        const images = currentProductData.images || [];
        const colors = currentProductData.colors || [];
        const sizes = currentProductData.sizes || [];

        if (images.length === sizes.length * Math.max(1, colors.length)) {
            const colorCount = Math.max(1, colors.length);
            const imageIndex = (Math.max(0, sizeIndex) * colorCount) + (colorIndex >= 0 ? colorIndex : 0);
            modalImg.src = images[imageIndex] || images[0];
            return;
        }

        if (images.length === colors.length && colors.length > 0) {
            const imageIndex = colorIndex >= 0 ? colorIndex : 0;
            modalImg.src = images[imageIndex] || images[0];
            return;
        }

        modalImg.src = images[0] || '';
    }

    function updateSizeSelector(sizes, prices) {
        sizeContainer.innerHTML = "";
        sizeContainer.style.display = "none";

        if (!sizes?.length) {
            modalPrice.innerText = formatPrice(prices[0]);
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.classList.add("size-selector");
        sizeContainer.style.display = "block";

        sizes.forEach((size, index) => {
            const button = document.createElement("div");
            button.classList.add("size-option");
            button.innerText = size;
            if (index === 0) button.classList.add("active");

            button.addEventListener("click", () => {
                wrapper.querySelectorAll(".size-option").forEach((item) => item.classList.remove("active"));
                button.classList.add("active");
                modalPrice.innerText = formatPrice(prices[index]);
                updateProductImage();
                updateModalFavoriteUI();
            });

            wrapper.appendChild(button);
        });

        sizeContainer.appendChild(wrapper);
        modalPrice.innerText = formatPrice(prices[0]);
    }

    function updateColorSelector(colors) {
        colorContainer.innerHTML = "";
        colorContainer.style.display = "none";
        if (!colors?.length) return;

        const wrapper = document.createElement("div");
        wrapper.classList.add("size-selector");
        colorContainer.style.display = "block";

        colors.forEach((color, index) => {
            const button = document.createElement("div");
            button.classList.add("size-option");
            button.innerText = color;
            if (index === 0) button.classList.add("active");

            button.addEventListener("click", () => {
                wrapper.querySelectorAll(".size-option").forEach((item) => item.classList.remove("active"));
                button.classList.add("active");
                updateProductImage();
                updateModalFavoriteUI();
            });

            wrapper.appendChild(button);
        });

        colorContainer.appendChild(wrapper);
    }

    async function addToCart(productId, title, price, size, color, image) {
        if (!(await requireAuthenticatedUser("kos\u00e1rba helyez\u00e9s"))) return;

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const normalizedImage = normalizeImagePath(image);
        const newItem = {
            id: `${productId}_${Date.now()}`,
            productId,
            title,
            price: Number(price),
            size,
            color,
            image: normalizedImage,
            quantity: 1
        };

        cart.push(newItem);
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));

        try {
            await setDoc(doc(db, "carts", currentUserId), {
                items: cart,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("Firebase sync error:", error);
        }

        await forgeXModal("Kos\u00e1rba ker\u00fclt", `${title} a kosaradba ker\u00fclt.`);
    }

    function getFavorites() {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        return favorites.map((item) => ({
            ...item,
            image: normalizeImagePath(item.image)
        }));
    }

    function saveFavorites(list) {
        localStorage.setItem("favorites", JSON.stringify(list));
    }

    async function saveFavoritesToCloud() {
        if (!currentUserId) return;
        try {
            await setDoc(doc(db, "favorites", currentUserId), {
                items: getFavorites(),
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("Error saving favorites to cloud:", error);
        }
    }

    function makeFavoriteId(productId, size, color) {
        return `${productId}_${size}_${color || "no-color"}`;
    }

    function isFavorite(id) {
        return getFavorites().some((favorite) => favorite.id === id);
    }

    async function toggleFavorite(productId, title, price, size, color, image) {
        if (!(await requireAuthenticatedUser("kedvencekhez ad\u00e1s"))) return false;

        const favoriteId = makeFavoriteId(productId, size, color);
        const favorites = getFavorites();
        const normalizedImage = normalizeImagePath(image);
        const existingIndex = favorites.findIndex((favorite) => favorite.id === favoriteId);

        if (existingIndex >= 0) {
            favorites.splice(existingIndex, 1);
            saveFavorites(favorites);
            if (currentUserId) await saveFavoritesToCloud();
            await forgeXModal("Elt\u00e1vol\u00edtva", `${title} elt\u00e1vol\u00edtva a kedvencek k\u00f6z\u00fcl.`);
            return false;
        }

        favorites.push({ id: favoriteId, productId, title, price, size, color, image: normalizedImage });
        saveFavorites(favorites);
        if (currentUserId) await saveFavoritesToCloud();
        await forgeXModal("Hozz\u00e1adva", `${title} beker\u00fclt a kedvencek k\u00f6z\u00e9.`);
        return true;
    }

    function updateModalFavoriteUI() {
        const favoriteButton = modal.querySelector('.favorite-btn');
        if (!favoriteButton || !currentProductId) return;

        const size = sizeContainer.querySelector('.size-option.active')?.innerText || '';
        const color = colorContainer.querySelector('.size-option.active')?.innerText || null;
        const favoriteId = makeFavoriteId(currentProductId, size, color);
        const icon = favoriteButton.querySelector('i');

        if (isFavorite(favoriteId)) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            favoriteButton.classList.add('active');
            icon.style.color = '#ff3333';
        } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            favoriteButton.classList.remove('active');
            icon.style.color = '';
        }
    }

    function openProductModal(productId) {
        const product = getProductInfo(productId);
        if (!product) return;

        currentProductId = productId;
        currentProductData = product;
        modalTitle.innerText = product.title;
        modalDescription.innerText = product.description;
        modalImg.alt = product.title;
        updateSizeSelector(product.sizes, product.prices);
        updateColorSelector(product.colors);
        updateProductImage();
        modal.style.display = "flex";
        updateModalFavoriteUI();
    }

    function closeModal() {
        modal.style.display = "none";
    }

    modal.querySelector(".addToCart-btn").addEventListener("click", async () => {
        if (!currentProductData || !currentProductId) return;

        await addToCart(
            currentProductId,
            currentProductData.title,
            parseInt(modalPrice.innerText.replace(/\D/g, ""), 10),
            sizeContainer.querySelector(".active")?.innerText || "",
            colorContainer.querySelector(".active")?.innerText || null,
            modalImg.src
        );

        closeModal();
    });

    modal.querySelector(".favorite-btn").addEventListener("click", async (event) => {
        event.stopPropagation();
        if (!currentProductData || !currentProductId) return;

        const size = sizeContainer.querySelector('.size-option.active')?.innerText || '';
        const color = colorContainer.querySelector('.size-option.active')?.innerText || null;
        const price = parseInt(modalPrice.innerText.replace(/\D/g, ""), 10) || 0;
        const image = modalImg.src;

        await toggleFavorite(
            currentProductId,
            currentProductData.title,
            price,
            size,
            color,
            image
        );

        updateModalFavoriteUI();
    });

    closeButton.addEventListener("click", closeModal);
    closeButton.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            closeModal();
        }
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });

    const sideFilter = document.querySelector('.side-filter-container');

    function ensureFilterToggle() {
        if (!sideFilter) return;

        let header = sideFilter.querySelector('.side-filter-header');
        if (header) return;

        header = document.createElement('div');
        header.className = 'side-filter-header';
        header.innerHTML = `
            <div class="side-filter-title"><i class="fa-solid fa-sliders"></i><span>Sz\u0171r\u0151k</span></div>
            <button class="side-filter-toggle" aria-expanded="true"><i class="fa-solid fa-chevron-down"></i></button>
        `;
        sideFilter.insertBefore(header, sideFilter.firstChild);

        const toggleButton = header.querySelector('.side-filter-toggle');
        toggleButton.addEventListener('click', (event) => {
            event.stopPropagation();
            sideFilter.dataset.userToggled = 'true';
            const isCollapsed = sideFilter.classList.contains('collapsed');

            sideFilter.classList.toggle('collapsed', !isCollapsed);
            sideFilter.classList.toggle('expanded', isCollapsed);
            toggleButton.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');

            const icon = toggleButton.querySelector('i');
            icon.classList.toggle('fa-chevron-down', !isCollapsed);
            icon.classList.toggle('fa-chevron-up', isCollapsed);
        });
    }

    function syncResponsiveFilterState() {
        if (!sideFilter) return;

        ensureFilterToggle();

        const isCompact = window.innerWidth <= 980;
        const toggleButton = sideFilter.querySelector('.side-filter-toggle');
        const icon = toggleButton?.querySelector('i');

        sideFilter.classList.toggle('is-collapsible', isCompact);

        if (!isCompact) {
            sideFilter.classList.remove('collapsed', 'expanded');
            delete sideFilter.dataset.userToggled;
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
            if (icon) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
            return;
        }

        if (!sideFilter.dataset.userToggled) {
            sideFilter.classList.add('collapsed');
            sideFilter.classList.remove('expanded');
        }

        if (toggleButton) {
            toggleButton.setAttribute('aria-expanded', sideFilter.classList.contains('collapsed') ? 'false' : 'true');
        }

        if (icon) {
            icon.classList.toggle('fa-chevron-down', sideFilter.classList.contains('collapsed'));
            icon.classList.toggle('fa-chevron-up', !sideFilter.classList.contains('collapsed'));
        }
    }

    syncResponsiveFilterState();
    window.addEventListener('resize', syncResponsiveFilterState);
});
