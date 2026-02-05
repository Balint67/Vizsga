document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    initModals();
    initLanguageSelector();
    initScrollAnimations();
    initRecommendationTable(); // Új inicializáló a táblázathoz
});

/* =========================
   1. SLIDER LOGIC
========================= */
let startX_click = 0;
let startY_click = 0;
let isDragging_click = false;

function initSlider() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    // Képre kattintás kezelése
    document.querySelectorAll('.slider img').forEach(img => {
        img.addEventListener('mousedown', e => {
            startX_click = e.clientX;
            startY_click = e.clientY;
            isDragging_click = false;
        });

        img.addEventListener('mousemove', e => {
            const dx = Math.abs(e.clientX - startX_click);
            const dy = Math.abs(e.clientY - startY_click);
            if (dx > 8 || dy > 8) isDragging_click = true;
        });

        img.addEventListener('mouseup', e => {
            if (!isDragging_click) {
                const link = img.getAttribute('data-link');
                if (link) location.href = link;
            }
        });
    });

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let currentIndex = 1;
    let autoInterval;
    const autoDelay = 5000;
    const dragSensitivity = 0.6;
    let isLooping = false;

    const slides = Array.from(slider.children);
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    firstClone.classList.add('clone');
    lastClone.classList.add('clone');
    slider.appendChild(firstClone);
    slider.insertBefore(lastClone, slides[0]);

    const allSlides = slider.querySelectorAll('img');
    let slideWidth = slider.offsetWidth;
    slider.scrollLeft = slideWidth * currentIndex;

    const dots = document.querySelectorAll('.slider-nav a');

    function updateDots() {
        dots.forEach(dot => dot.style.backgroundColor = '#ffffff');
        let dotIndex = currentIndex - 1;
        if (dotIndex >= dots.length) dotIndex = 0;
        if (dotIndex < 0) dotIndex = dots.length - 1;
        if (dots[dotIndex]) dots[dotIndex].style.backgroundColor = '#00ca65';
    }

    updateDots();

    function moveToSlide(index) {
        slider.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
        currentIndex = index;
        updateDots();
    }

    function nextSlide() { moveToSlide(currentIndex + 1); }
    function prevSlide() { moveToSlide(currentIndex - 1); }

    function startAutoSlide() {
        stopAutoSlide();
        autoInterval = setInterval(nextSlide, autoDelay);
    }
    function stopAutoSlide() { clearInterval(autoInterval); }

    slider.addEventListener('mousedown', (e) => {
        stopAutoSlide();
        isDown = true;
        slider.classList.add('active');
        slider.style.scrollBehavior = 'auto';
        startX = e.pageX;
        scrollLeft = slider.scrollLeft;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const delta = e.pageX - startX;
        slider.scrollLeft = scrollLeft - delta * dragSensitivity;
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDown) return;
        isDown = false;
        slider.classList.remove('active');
        const dragDistance = e.pageX - startX;
        if (dragDistance < -(slideWidth * 0.15)) nextSlide();
        else if (dragDistance > (slideWidth * 0.15)) prevSlide();
        else moveToSlide(currentIndex);
        startAutoSlide();
    });

    slider.addEventListener('scroll', () => {
        if (isLooping) return;
        if (currentIndex >= allSlides.length - 1 && slider.scrollLeft >= slideWidth * (allSlides.length - 1) - 10) {
            isLooping = true;
            slider.style.scrollBehavior = 'auto';
            slider.scrollLeft = slideWidth;
            currentIndex = 1;
            updateDots();
            setTimeout(() => { slider.style.scrollBehavior = 'smooth'; isLooping = false; }, 20);
        } else if (currentIndex <= 0 && slider.scrollLeft <= 10) {
            isLooping = true;
            slider.style.scrollBehavior = 'auto';
            slider.scrollLeft = slideWidth * (allSlides.length - 2);
            currentIndex = allSlides.length - 2;
            updateDots();
            setTimeout(() => { slider.style.scrollBehavior = 'smooth'; isLooping = false; }, 20);
        }
    });

    window.addEventListener('resize', () => {
        slideWidth = slider.offsetWidth;
        slider.style.scrollBehavior = 'auto';
        slider.scrollLeft = currentIndex * slideWidth;
        setTimeout(() => { slider.style.scrollBehavior = 'smooth'; }, 50);
    });

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
        'eatClean': { title: 'Eat Clean', text: 'A tiszta étkezés az egészséges életmód alapja...' },
        'trainHard': { title: 'Work Hard', text: 'A következetes edzés kulcsfontosságú...' },
        'sleepWell': { title: 'Sleep Well', text: 'A regeneráció legalább olyan fontos...' }
    };

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const type = trigger.getAttribute('data-modal');
            if (infoData[type]) {
                modalTitle.innerText = infoData[type].title;
                modalText.innerText = infoData[type].text;
                modal.classList.add('is-open');
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('is-open'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('is-open'); });
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
    const select = document.querySelector(".goog-te-combo");

    if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
        select.dispatchEvent(new Event('input'));
    } else {
        // Ha nem találja, megpróbáljuk megvárni (pl. lassú net esetén)
        console.warn("Várakozás a Google Translate modulra...");

        // Egyetlen újrapróbálkozás 500ms múlva
        setTimeout(() => {
            const retrySelect = document.querySelector(".goog-te-combo");
            if (retrySelect) {
                retrySelect.value = langCode;
                retrySelect.dispatchEvent(new Event('change'));
            } else {
                alert("A fordító szolgáltatás jelenleg nem elérhető. Kérjük, frissítse az oldalt!");
            }
        }, 500);
    }
}

// Google API inicializáló (globális környzetbe)
window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'hu',
        includedLanguages: 'en,de,hu',
        autoDisplay: false
    }, 'google_translate_element');
}

/* =========================
   4. SCROLL ANIMÁCIÓK
========================= */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add('show');
        });
    });
    document.querySelectorAll('.fadeIn').forEach((el) => observer.observe(el));
}

/* =========================
   5. RECOMMENDATION TABLE
========================= */
function initRecommendationTable() {
    const recommendationsData = {
        treadmill: { title: "FORGEX TREADMILL", description: "A világ első számú futópadjai...", image: "images/treadmill.JPEG" },
        cableMachine: { title: "FORGEX CABLE CROSSOVER", description: "Több mint 200 gyakorlat...", image: "images/mayaCable.jpeg" },
        equipment: { title: "MI NEM RIADUNK EL A VÁLTOZÁSTÓL", description: "", image: "images/equipment.jpeg" },
        balance: { title: "RECLINE PERSONAL", description: "", image: "images/balance.jpeg" },
        bench: { title: "FORGEX BENCH", description: "", image: "images/benchPress.jpg" },
        legPress: { title: "FORGEX LEG PRESS", description: "Ergonómikus kialakítás...", image: "images/legPress.JPG" }
    };

    document.querySelectorAll('.recommendations-menu-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.recommendations-menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            const target = this.getAttribute('data-target');
            const data = recommendationsData[target];

            const titleEl = document.querySelector('.recommendations-title');
            const descEl = document.querySelector('.recommendations-description');
            const imgEl = document.querySelector('#recommendations-display-img');

            if (data && titleEl) {
                [titleEl, descEl, imgEl].forEach(el => el.style.opacity = 0);
                setTimeout(() => {
                    titleEl.textContent = data.title;
                    descEl.textContent = data.description;
                    imgEl.src = data.image;
                    [titleEl, descEl, imgEl].forEach(el => el.style.opacity = 1);
                }, 300);
            }
        });
    });
}