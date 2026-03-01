document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    initModals();
    initLanguageSelector();
    initScrollAnimations();
    initRecommendationTable(); // New initializer for the table
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

    // Handle image click events
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
                const targetLink = img.getAttribute('data-link');
                if (targetLink) location.href = targetLink;
            }
        });
    });

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let currentIndex = 1;
    let autoSlideInterval;
    const autoDelay = 5000;
    const dragSensitivity = 0.6;
    let isLooping = false;

    // Infinite scroll clones
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

    const navDots = document.querySelectorAll('.slider-nav a');

    function updateDots() {
        navDots.forEach(dot => dot.style.backgroundColor = '#ffffff');
        let dotIndex = currentIndex - 1;
        if (dotIndex >= navDots.length) dotIndex = 0;
        if (dotIndex < 0) dotIndex = navDots.length - 1;
        if (navDots[dotIndex]) navDots[dotIndex].style.backgroundColor = '#00ca65';
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
        autoSlideInterval = setInterval(nextSlide, autoDelay);
    }
    function stopAutoSlide() { clearInterval(autoSlideInterval); }

    // Drag events
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
        const deltaX = e.pageX - startX;
        slider.scrollLeft = scrollLeft - deltaX * dragSensitivity;
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

    // Infinite loop scroll handler
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

    navDots.forEach((dot, i) => {
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
    const infoModal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalText = document.getElementById('modalText');
    const modalTriggers = document.querySelectorAll('.info-trigger-card');
    const closeBtn = document.querySelector('.close-modal');

    if (!infoModal) return;

    const modalContentMap = {
        'eatClean': { title: 'Eat Clean', text: 'A tiszta étkezés az egészséges életmód alapja...' },
        'trainHard': { title: 'Work Hard', text: 'A következetes edzés kulcsfontosságú...' },
        'sleepWell': { title: 'Sleep Well', text: 'A regeneráció legalább olyan fontos...' }
    };

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalType = trigger.getAttribute('data-modal');
            if (modalContentMap[modalType]) {
                modalTitle.innerText = modalContentMap[modalType].title;
                modalText.innerText = modalContentMap[modalType].text;
                infoModal.classList.add('is-open');
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => infoModal.classList.remove('is-open'));
    window.addEventListener('click', (e) => { if (e.target === infoModal) infoModal.classList.remove('is-open'); });
}

/* =========================
   3. LANGUAGE SELECTOR (Google Translate)
========================= */
function initLanguageSelector() {
    const langButtons = document.querySelectorAll('.lang-btn');

    // Check for saved language in localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
        // Wait for Google module to load
        setTimeout(() => {
            triggerGoogleTranslate(savedLanguage);
        }, 1000);
    }

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const langCode = btn.getAttribute('data-lang');
            localStorage.setItem('selectedLanguage', langCode);
            triggerGoogleTranslate(langCode);
        });
    });
}

// BFCache (back button) protection
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage) {
            triggerGoogleTranslate(savedLanguage);
        }
    }
});

function triggerGoogleTranslate(langCode) {
    const translateDropdown = document.querySelector(".goog-te-combo");

    if (translateDropdown) {
        translateDropdown.value = langCode;
        translateDropdown.dispatchEvent(new Event('change'));
        translateDropdown.dispatchEvent(new Event('input'));
    } else {
        console.warn("Waiting for Google Translate module...");

        // Retry once after 500ms
        setTimeout(() => {
            const retryDropdown = document.querySelector(".goog-te-combo");
            if (retryDropdown) {
                retryDropdown.value = langCode;
                retryDropdown.dispatchEvent(new Event('change'));
            } else {
                alert("A fordító szolgáltatás jelenleg nem elérhető. Kérjük, frissítse az oldalt!");
            }
        }, 500);
    }
}

// Global Google API Init
window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'hu',
        includedLanguages: 'en,de,hu',
        autoDisplay: false
    }, 'google_translate_element');
}

/* =========================
   4. SCROLL ANIMATIONS
========================= */
function initScrollAnimations() {
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add('show');
        });
    });
    document.querySelectorAll('.fadeIn').forEach((element) => scrollObserver.observe(element));
}

