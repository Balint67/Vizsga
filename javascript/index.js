document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    initModals();
    initLanguageSelector();
    initScrollAnimations();
});

/* =========================
   1. SLIDER LOGIC
   ========================= */
function initSlider() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let currentIndex = 1; // 1-es index a klónok miatt
    let slideWidth = slider.offsetWidth;
    let autoInterval;
    const autoDelay = 5000;

    // Klónozás a végtelenítéshez
    const slides = Array.from(slider.children);
    if (slides.length === 0) return;

    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    slider.appendChild(firstClone);
    slider.insertBefore(lastClone, slides[0]);

    const allSlides = slider.querySelectorAll('img');
    const dots = document.querySelectorAll('.slider-nav a');

    // Kezdő pozíció
    slider.scrollLeft = slideWidth;

    // Képre kattintás kezelése (drag vs click megkülönböztetés)
    allSlides.forEach(img => {
        let clickStartX = 0;
        let clickStartY = 0;

        img.addEventListener('mousedown', e => {
            clickStartX = e.clientX;
            clickStartY = e.clientY;
        });

        img.addEventListener('mouseup', e => {
            const dx = Math.abs(e.clientX - clickStartX);
            const dy = Math.abs(e.clientY - clickStartY);
            // Ha keveset mozdult, az kattintás
            if (dx < 5 && dy < 5) {
                const link = img.getAttribute('data-link');
                if (link) location.href = link;
            }
        });
    });

    // Pöttyök frissítése
    function updateDots() {
        dots.forEach(dot => dot.style.backgroundColor = '#ffffff');
        let dotIndex = currentIndex - 1;
        if (dotIndex >= dots.length) dotIndex = 0;
        if (dotIndex < 0) dotIndex = dots.length - 1;
        if (dots[dotIndex]) dots[dotIndex].style.backgroundColor = '#00ca65';
    }
    updateDots();

    // Léptetés
    function moveToSlide(index, smooth = true) {
        slider.style.scrollBehavior = smooth ? 'smooth' : 'auto';
        slider.scrollLeft = index * slideWidth;
        currentIndex = index;
        updateDots();
    }

    function nextSlide() { moveToSlide(currentIndex + 1); }
    function prevSlide() { moveToSlide(currentIndex - 1); }

    // Auto Play
    function startAutoSlide() {
        stopAutoSlide();
        autoInterval = setInterval(nextSlide, autoDelay);
    }
    function stopAutoSlide() { clearInterval(autoInterval); }

    // Drag / Swipe események
    slider.addEventListener('mousedown', (e) => {
        stopAutoSlide();
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        slider.style.cursor = 'grabbing';
        slider.style.scrollBehavior = 'auto';
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'pointer';
        startAutoSlide();
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'pointer';
        snapToSlide();
        startAutoSlide();
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX);
        slider.scrollLeft = scrollLeft - walk;
    });

    // touchpad
    slider.addEventListener('touchstart', stopAutoSlide);
    slider.addEventListener('touchend', () => {
        snapToSlide();
        startAutoSlide();
    });

    function snapToSlide() {
        const exactIndex = slider.scrollLeft / slideWidth;
        const diff = exactIndex - currentIndex;

        let newIndex = currentIndex;
        const sensitivity = 0.05;

        if (diff > sensitivity) {
            newIndex = currentIndex + 1;
        } else if (diff < -sensitivity) {
            newIndex = currentIndex - 1;
        }

        moveToSlide(newIndex, true);
    }

    // Loop
    slider.addEventListener('scroll', () => {
        if (slider.scrollLeft <= 0) {
            slider.style.scrollBehavior = 'auto';
            slider.scrollLeft = slideWidth * (allSlides.length - 2);
            currentIndex = allSlides.length - 2;
        } else if (slider.scrollLeft >= slideWidth * (allSlides.length - 1)) {
            slider.style.scrollBehavior = 'auto';
            slider.scrollLeft = slideWidth;
            currentIndex = 1;
        }
    });

    // Resize Fix
    window.addEventListener('resize', () => {
        slideWidth = slider.offsetWidth;
        slider.style.scrollBehavior = 'auto';
        slider.scrollLeft = currentIndex * slideWidth;
    });

    // Pötty navigáció
    dots.forEach((dot, i) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            moveToSlide(i + 1);
        });
    });

    startAutoSlide();
}

/* =========================
   2. MODALS (Popups)
   ========================= */
function initModals() {
    const modal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalText = document.getElementById('modalText');
    const triggers = document.querySelectorAll('.info-trigger-card');
    const closeBtn = document.querySelector('.close-modal');

    if (!modal) return;

    const infoData = {
        'eatClean': {
            title: 'Eat Clean',
            text: 'A tiszta étkezés az egészséges életmód alapja. Fókuszálj a feldolgozatlan élelmiszerekre, sok zöldségre, minőségi fehérjére és komplex szénhidrátokra. Kerüld a hozzáadott cukrot és a mesterséges adalékanyagokat.'
        },
        'trainHard': {
            title: 'Work Hard',
            text: 'A következetes edzés kulcsfontosságú a fejlődéshez. Legyen szó súlyzós edzésről vagy kardióról, a lényeg a progresszió és a kitartás. Ne felejtsd el, az eredményekért meg kell dolgozni!'
        },
        'sleepWell': {
            title: 'Sleep Well',
            text: 'A regeneráció legalább olyan fontos, mint az edzés. Napi 7-9 óra minőségi alvás szükséges az izmok épüléséhez, a hormonháztartás egyensúlyához és a mentális frissességhez.'
        }
    };

    function openModal(type) {
        if (infoData[type]) {
            modalTitle.innerText = infoData[type].title;
            modalText.innerText = infoData[type].text;
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const type = trigger.getAttribute('data-modal');
            openModal(type);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Bezárás háttérre kattintva
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}

/* =========================
   3. NYELVVÁLASZTÓ (Google Translate)
   ========================= */
function initLanguageSelector() {
    const buttons = document.querySelectorAll('.nyelv-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const langCode = btn.getAttribute('data-lang');
            triggerGoogleTranslate(langCode);
        });
    });
}

function triggerGoogleTranslate(langCode) {
    // Megkeressük a Google rejtett select mezőjét
    const select = document.querySelector(".goog-te-combo");

    if (select) {
        select.value = langCode;
        // Fontos: mindkét eseményt elsütjük a biztos működésért
        select.dispatchEvent(new Event('change'));
        select.dispatchEvent(new Event('input'));
    } else {
        console.error("A Google Translate modul még nem töltött be.");
    }
}

// Ezt a függvényt a window objektumhoz kell csatolni, hogy a Google API megtalálja
window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'hu',
        includedLanguages: 'en,de,hu',
        autoDisplay: false // Ne jelenjen meg a Google sáv
    }, 'google_translate_element');
}

/* =========================
   4. SCROLL ANIMÁCIÓK
   ========================= */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.fadeIn');
    hiddenElements.forEach((el) => observer.observe(el));
}

/* =========================
   5. recommendation table
   ========================= */
const recommendationsData = {
    treadmill: {
        title: "FORGEX TREADMILL - AZ ERŐ ÉS ÁLLÓKÉPESSÉG ÚJ SZINTJE",
        description: "A világ első számú futópadjai. Ergonómikus kialakítás, miközben maximális kardió élményt nyújt a legmodernebb kijelzővel.",
        image: "images/treadmill.JPEG"
    },
    cableMachine: {
        title: "FORGEX CABLE CROSSOVER - MINDEN EGY HELYEN",
        description: "Több mint 200 gyakorlat egyetlen eszközön. Kompakt, stílusos és mindent tartalmaz, amire a súlyzós edzéshez szükséged van. Tolj vagy húzz – korlátok nélkül.",
        image: "images/mayaCable.jpeg"
    },
    equipment: {
        title: "MI NEM RIADUNK EL A VÁLTOZÁSTÓL",
        description: "Világszínvonalú felszereltség! Edzőtermeinkben a nemzetközi fitneszpiac élvonalába tartozó, prémium márkák legújabb modelljei biztosítják a kompromisszummentes edzésélményt már szerte a világon.",
        image: "images/equipment.jpeg"
    },
    balance: {
        title: "TÖKÉLETES EGYENSÚLY - KÉNYELEM ÉS REGENERÁLÓDÁS",
        description: "A fejlődés nemcsak az edzésen, hanem a regeneráción is múlik. Személyre szabott rehabilitációs programjaink és célzott nyújtásaink segítenek visszaállítani tested természetes egyensúlyát és mozgásszabadságát.",
        image: "images/balance.jpeg"
    },
    bench: {
        title: "FORGEX BENCH - AZ ELSŐ LÁTÁSRA SZERELEM",
        description: "Vannak gépek, amik mellett nem lehet szó nélkül elmenni. A Forgex Bench az elegáns dizájnt ötvözi a nyers erővel: amint kipróbálod, érezni fogod a stabilitás és a precizitás új szintjét.",
        image: "images/benchPress.jpg"
    },
    legPress: {
        title: "FORGEX LEG PRESS - AZ ERŐ ÚJ DIMENZIÓJA",
        description: "Nincs többé kifogás a lábnapokon. A Forgex Leg Press-t úgy terveztük, hogy a legnagyobb terhelés mellett is egyenletes, sima mozgást biztosítson. Építs masszív izomzatot a szakma legstabilabb lábtológépével!",
        image: "images/legPress.JPG"
    }
};

document.querySelectorAll('.recommendations-menu-item').forEach(item => {
    item.addEventListener('click', function() {
        // 1. Aktív osztály kezelése a menüben
        document.querySelectorAll('.recommendations-menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');

        // 2. Azonosító lekérése a data-target attribútumból
        const target = this.getAttribute('data-target');
        const data = recommendationsData[target];

        // 3. Tartalom frissítése animációval (opcionális)
        const titleEl = document.querySelector('.recommendations-title');
        const descEl = document.querySelector('.recommendations-description');
        const imgEl = document.querySelector('#recommendations-display-img');

        // Egyszerű fade-out/fade-in hatás
        [titleEl, descEl, imgEl].forEach(el => el.style.opacity = 0);

        setTimeout(() => {
            titleEl.textContent = data.title;
            descEl.textContent = data.description;
            imgEl.src = data.image;
            imgEl.alt = data.title;

            [titleEl, descEl, imgEl].forEach(el => el.style.opacity = 1);
        }, 300);
    });
});