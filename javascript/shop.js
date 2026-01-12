document.addEventListener("DOMContentLoaded", () => {

    // -------- TERMÉK ADATOK --------
    const productData = {
        "Shaker": {
            images: ["images/shaker1.png", "images/shaker2.png"],
            description: "ForgeX shaker 0,7L – prémium minőségű, BPA-mentes műanyag, tökéletes edzéshez.",
            sizes: ["0.7L", "1L"],
            prices: [2990, 3990]
        },
        "Póló": {
            images: ["images/shirt1.png", "images/shirt2.png"],
            description: "ForgeX edzőpóló – légáteresztő, gyorsan száradó anyag.",
            sizes: ["S", "M", "L", "XL"],
            prices: [3990, 3990, 3990, 3990]
        },
        "Protein por": {
            images: ["images/eper.png", "images/vanilla.png"],
            description: "ForgeX whey protein 1kg – csokoládé és vanília ízben.",
            sizes: ["1kg", "2kg"],
            prices: [24990, 39990]
        },
        "Kreatin": {
            images: ["images/creatine.png"],
            description: "100% kreatin-monohidrát 500g – teljesítménynövelésre.",
            sizes: ["500g", "1kg"],
            prices: [6990, 12990]
        },
        "Nadrág": {
            images: ["images/gatya1.jpeg", "images/gatya2.jpeg"],
            description: "ForgeX női sportnadrág – kényelmes és rugalmas.",
            sizes: ["XS", "S", "M", "L"],
            prices: [4990, 4990, 4990, 4990]
        },
        "Sportcipő": {
            images: ["images/cipo.png", "images/cipo2.png"],
            description: "ForgeX futócipő – könnyű, rugalmas talp.",
            sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
            prices: [12990, 12990, 12990, 12990, 12990, 12990, 12990, 12990]
        },
        "Sapka": {
            images: ["images/sapka1.jpeg", "images/sapka2.jpeg"],
            description: "ForgeX sapka – stílusos és kényelmes.",
            sizes: ["M", "L"],
            prices: [3990, 3990]
        },
        "Sporttáska": {
            images: ["images/bag1.jpg", "images/bag2.jpg"],
            description: "ForgeX sporttáska – sok zsebbel, tartós anyagból.",
            sizes: ["25L", "45L"],
            prices: [17990, 27990]
        },
        "Fehérje szelet": {
            images: ["images/csoki1.jpg", "images/csoki2.jpg"],
            description: "ForgeX fehérje szelet – energiadús snack.",
            sizes: ["50g", "100g"],
            prices: [990, 1790]
        }
    };

    // -------- MODAL LÉTREHOZÁSA (Frissített stílusokkal) --------
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <div class="modal-images">
                <button class="prev-img">&#10094;</button>
                <img id="modal-img" src="">
                <button class="next-img">&#10095;</button>
            </div>
            <h2 id="modal-title" style="margin-top:15px;"></h2>
            <p id="modal-description" style="color:#cbd5e1; margin-bottom:10px;"></p>
            <div id="size-selector-container"></div>
            <p id="modal-price" style="color:#00ca65; font-weight:bold; font-size:24px; margin-top:15px;"></p>
            <button class="login-btn" style="margin-top:20px; width:80%;">Hozzáadás a kosárhoz</button>
        </div>
    `;
    document.body.appendChild(modal);

    const modalImg = document.getElementById("modal-img");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalPrice = document.getElementById("modal-price");
    const sizeContainer = document.getElementById("size-selector-container");

    let currentImages = [];
    let currentIndex = 0;

    // -------- LAPOZÁS ESEMÉNYEK --------
    modal.querySelector(".prev-img").addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        modalImg.src = currentImages[currentIndex];
    });

    modal.querySelector(".next-img").addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % currentImages.length;
        modalImg.src = currentImages[currentIndex];
    });

    // -------- MÉRETVÁLASZTÓ FUNKCIÓ --------
    function updateSizeSelector(sizes, prices) {
        sizeContainer.innerHTML = ""; // kiürítjük a régit
        const wrapper = document.createElement("div");
        wrapper.classList.add("size-selector");

        sizes.forEach((size, index) => {
            const btn = document.createElement("div");
            btn.classList.add("size-option");
            btn.textContent = size;
            if (index === 0) btn.classList.add("active");

            btn.addEventListener("click", () => {
                wrapper.querySelectorAll(".size-option").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                modalPrice.innerText = prices[index].toLocaleString() + " Ft";
            });
            wrapper.appendChild(btn);
        });
        sizeContainer.appendChild(wrapper);
        modalPrice.innerText = prices[0].toLocaleString() + " Ft";
    }

// -------- TERMÉKRE KATTINTÁS --------
    document.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("click", (e) => {
            const title = card.querySelector("h3").innerText;
            const data = productData[title];

            // Ha a "Kosárba" gombra kattintunk a főoldalon
            if (e.target.classList.contains('login-btn')) {
                // Meghívjuk a mentés funkciót az első mérettel és árral
                addToCart(title, data.prices[0], data.sizes[0], data.images[0]);
                alert(title + " bekerült a kosárba!");
                return;
            }

            // Ha nem a gombra, hanem a kártyára kattintunk, nyílik a modal
            if (!data) return;

            modalTitle.innerText = title;
            modalDescription.innerText = data.description;
            currentImages = data.images;
            currentIndex = 0;
            modalImg.src = currentImages[0];

            updateSizeSelector(data.sizes, data.prices);
            modal.style.display = "flex";
        });
    });

    // -------- KOSÁR KEZELÉS FUNKCIÓK --------

    // Ez a gomb a MODAL-on belül van
    const modalAddToCartBtn = modal.querySelector(".login-btn");
    modalAddToCartBtn.addEventListener("click", () => {
        const title = modalTitle.innerText;
        const priceText = modalPrice.innerText;
        const price = parseInt(priceText.replace(/[^0-9]/g, ""));
        const activeSize = sizeContainer.querySelector(".size-option.active").innerText;
        const image = modalImg.src;

        addToCart(title, price, activeSize, image);
        modal.style.display = "none";
        alert(title + " (" + activeSize + ") bekerült a kosárba!");
    });

    // Funkció, ami elmenti az adatokat a böngészőbe
    function addToCart(title, price, size, image) {
        const product = {
            id: Date.now(), 
            title: title,
            price: price,
            size: size,
            image: image
        };

        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));

        updateCartCount();
    }

    // Funkció, ami frissíti a piros számot az ikon felett
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const countElement = document.getElementById("cart-count");
        if (countElement) {
            countElement.innerText = cart.length;
        }
    }

    // Frissítés indításkor is
    updateCartCount();

    // -------- BEZÁRÁS --------
    modal.querySelector(".close-btn").addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });
});