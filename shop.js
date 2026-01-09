document.addEventListener("DOMContentLoaded", () => {

    // -------- TERMÉK ADATOK (bármikor bővíthető) --------
    const productData = {
        "Shaker": {
            images: ["images/shaker1.png", "images/shaker2.png"],
            description: "ForgeX shaker 0,7L – prémium minőségű, BPA-mentes műanyag, tökéletes edzéshez.",
            sizes: ["0.7L", "1L"],
            prices: [2990, 3990] // 0.7L - 2990, 1L - 3990
        },
        "Póló": {
            images: ["images/shirt1.png", "images/shirt2.png"],
            description: "ForgeX edzőpóló – légáteresztő, gyorsan száradó anyag.",
            sizes: ["S", "M", "L", "XL"],
            prices: [3990, 3990, 3990, 3990] // minden méret azonos ár
        },
        "Protein por": {
            images: ["images/eper.png", "images/vanilla.png"],
            description: "ForgeX whey protein 1kg – csokoládé és vanília ízben.",
            sizes: ["1kg", "2kg"],
            prices: [24990, 39990] // 1kg - 24990, 2kg - 39990
        },
        "Kreatin": {
            images: ["images/creatine.png"],
            description: "100% kreatin-monohidrát 500g – teljesítménynövelésre.",
            sizes: ["500g", "1kg"],
            prices: [6990, 12990] // 500g - 6990, 1kg - 12990
        },
        "Nadrág": {
            images: ["images/gatya1.jpeg", "images/gatya2.jpeg"],
            description: "ForgeX női sportnadrág – kényelmes és rugalmas.",
            sizes: ["XS", "S", "M", "L"],
            prices: [4990, 4990, 4990, 4990]
        },
        "Sportcipő": {
            images: ["images/cipo.png", "images/cipo2.png", "images/cipo3.jpg"],
            description: "ForgeX futócipő – könnyű, rugalmas talp.",
            sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
            prices: [12990,12990,12990,12990,12990,12990,12990,12990]
        },
        "Sapka": {
            images: ["images/sapka1.jpeg", "images/sapka2.jpeg"],
            description: "ForgeX sapka – stílusos és kényelmes.",
            sizes: ["Gyermek", "Felnőtt" ],
            prices: [3990, 3990]
        },
        "Sporttáska": {
            images: ["images/bag1.jpg", "images/bag2.jpg"],
            description: "ForgeX sporttáska – sok zsebbel, tartós anyagból.",
            sizes: ["25L", "45L"],
            prices: [17990, 27990] // lehet különböző ár, itt mindkettő 17990
        },
        "Fehérje szelet": {
            images: ["images/csoki1.jpg", "images/csoki2.jpg"],
            description: "ForgeX fehérje szelet – energiadús snack.",
            sizes: ["50g", "100g"],
            prices: [990, 1790] // 50g - 990, 100g - 1790
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
                <img id="modal-img" src="">
                <button class="next-img">&#10095;</button>
            </div>

            <h2 id="modal-title"></h2>
            <p id="modal-description"></p>
            <p id="modal-price" style="color:#0fa36b; font-weight:bold; font-size:20px; margin-top:10px;"></p>
        </div>
    `;
    document.body.appendChild(modal);

    const modalImg = document.getElementById("modal-img");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalPrice = document.getElementById("modal-price");

    let currentImages = [];
    let currentIndex = 0;
    let currentSizeSelector = null;
    let currentPrices = [];

    // -------- KÉP LAPOZÁS --------
    document.querySelector(".prev-img").addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        modalImg.src = currentImages[currentIndex];
    });

    document.querySelector(".next-img").addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % currentImages.length;
        modalImg.src = currentImages[currentIndex];
    });

    // -------- MÉRETVÁLASZTÓ GOMBOK LÉTREHOZÁSA --------
    function createSizeSelector(sizes, prices) {
        const container = document.createElement("div");
        container.classList.add("size-selector");

        sizes.forEach((size, index) => {
            const btn = document.createElement("div");
            btn.classList.add("size-option");
            btn.textContent = size;

            btn.addEventListener("click", () => {
                container.querySelectorAll(".size-option").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                // Ár frissítése a kiválasztott mérethez
                modalPrice.innerText = prices[index] + " Ft";
            });

            container.appendChild(btn);
        });

        // Alapértelmezett: első méret aktív és ár megjelenítése
        container.querySelector(".size-option").classList.add("active");
        modalPrice.innerText = prices[0] + " Ft";

        return container;
    }

    // -------- TERMÉKRE KATTINTÁS --------
    document.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("click", () => {
            const title = card.querySelector("h3").innerText;
            const data = productData[title];
            if (!data) return;

            modalTitle.innerText = title;
            modalDescription.innerText = data.description;

            // képek betöltése
            currentImages = data.images;
            currentIndex = 0;
            modalImg.src = currentImages[0];

            // árak tárolása
            currentPrices = data.prices;

            // régi méretválasztó törlése (ha van)
            if (currentSizeSelector) currentSizeSelector.remove();

            // új méretválasztó létrehozása
            currentSizeSelector = createSizeSelector(data.sizes, data.prices);
            modalDescription.insertAdjacentElement("afterend", currentSizeSelector);

            modal.style.display = "flex";
        });
    });

    // -------- MODAL BEZÁRÁS --------
    document.querySelector(".close-btn").addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

});
