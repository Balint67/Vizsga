document.addEventListener("DOMContentLoaded", () => {

    // -------- TERMÉK ADATOK --------
    const productData = {
        "Shaker": {
            images: ["images/shaker2.png", "images/shaker1.png"],
            description: "ForgeX shaker 0,7L – prémium minőségű, BPA-mentes műanyag, tökéletes edzéshez.",
            sizes: ["0.7L", "1L"],
            color: ["Fekete", "Fehér"],
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
            images: [
                "images/hat-white.jpg",
                "images/hat-black.jpeg",
                "images/hat-green.jpeg",
            ],
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

    // -------- MODAL LÉTREHOZÁSA --------
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

    // -------- KÉP FRISSÍTÉSE A KIVÁLASZTOTT OPCIÓK ALAPJÁN (JAVÍTOTT) --------
    function updateProductImage() {
        if (!currentProductData) return;

        const sizes = sizeContainer.querySelectorAll(".size-option");
        const colors = colorContainer.querySelectorAll(".size-option");

        let sizeIndex = 0;
        sizes.forEach((btn, idx) => { if (btn.classList.contains("active")) sizeIndex = idx; });

        let colorIndex = 0;
        colors.forEach((btn, idx) => { if (btn.classList.contains("active")) colorIndex = idx; });

        // Hány szín variáció van? Ha nincs szín, akkor 1-nek vesszük.
        const colorCount = currentProductData.color ? currentProductData.color.length : 1;

        // 1. opció: Teljes mátrix keresés (Méret + Szín kombináció)
        // Ezt használja pl. a Protein por (ahol a méret miatt más a csomagolás képe)
        const complexIndex = (sizeIndex * colorCount) + colorIndex;

        // 2. opció: Egyszerű szín keresés
        // Ezt használja a Cipő, Póló, Sapka (ahol a méret nem változtat a képen)
        const simpleIndex = colorIndex;

        // LOGIKA:
        // Megnézzük, létezik-e kép a "bonyolult" (méret+szín) indexen.
        if (currentProductData.images[complexIndex] !== undefined) {
            modalImg.src = currentProductData.images[complexIndex];
        }
        // Ha nem létezik (pl. cipőnél a 42-es méret indexe túl nagy), akkor megnézzük a sima szín indexet.
        else if (currentProductData.images[simpleIndex] !== undefined) {
            modalImg.src = currentProductData.images[simpleIndex];
        }
        // Ha semmi nem jön be, marad az alapértelmezett első kép.
        else {
            modalImg.src = currentProductData.images[0];
        }
    }

    // -------- MÉRET VÁLASZTÓ FRISSÍTÉSE --------
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
                updateProductImage(); // Kép frissítése méretváltáskor
            });
            wrapper.appendChild(btn);
        });
        sizeContainer.appendChild(wrapper);
        modalPrice.innerText = prices[0] + " Ft";
    }

    // -------- SZÍN VÁLASZTÓ FRISSÍTÉSE --------
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
                updateProductImage(); // Kép frissítése színváltáskor
            });
            wrapper.appendChild(btn);
        });
        colorContainer.appendChild(wrapper);
    }

    // -------- TERMÉK KATTINTÁS ESEMÉNY --------
    document.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("click", (e) => {
            const title = card.querySelector("h3").innerText;
            const data = productData[title];
            if (!data) return;

            if (e.target.classList.contains("login-btn")) {
                addToCart(title, data.prices[0], data.sizes[0], data.color ? data.color[0] : null, data.images[0]);
                alert("Kosárba téve!");
                return;
            }

            currentProductData = data; // Eltároljuk az aktuális terméket
            modalTitle.innerText = title;
            modalDescription.innerText = data.description;

            updateSizeSelector(data.sizes, data.prices);
            updateColorSelector(data.color);
            updateProductImage(); // Kezdőkép beállítása

            modal.style.display = "flex";
        });
    });

    // -------- KOSÁRBA TÉTEL A MODALBÓL --------
    modal.querySelector(".login-btn").addEventListener("click", () => {
        const title = modalTitle.innerText;
        const sizeEl = sizeContainer.querySelector(".size-option.active");
        const size = sizeEl ? sizeEl.innerText : "";

        const colorEl = colorContainer.querySelector(".size-option.active");
        const color = colorEl ? colorEl.innerText : null;

        const price = parseInt(modalPrice.innerText.replace(/\D/g, ""));
        const image = modalImg.src;

        addToCart(title, price, size, color, image);
        modal.style.display = "none";
        alert(`${title} (${size}, ${color || ''}) bekerült a kosárba`);
    });

    function addToCart(title, price, size, color, image) {
        const product = {
            id: Date.now(),
            title: `${title} ${size}${color ? " " + color : ""}`,
            price,
            size,
            color,
            image
        };

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const el = document.getElementById("cart-count");
        if (el) el.innerText = cart.length;
    }

    updateCartCount();

    modal.querySelector(".close-btn").onclick = () => modal.style.display = "none";
    window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };
});