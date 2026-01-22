/* =========================
   SLIDER (MANUAL + AUTO, TRUE INFINITE, FIXED + DOTS + RESIZE FIX)
========================= */
let startX = 0;
let startY = 0;
let isDragging = false;

document.querySelectorAll('.slider img').forEach(img => {

    img.addEventListener('mousedown', e => {
        startX = e.clientX;
        startY = e.clientY;
        isDragging = false;
    });

    img.addEventListener('mousemove', e => {
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);

        // ha elmozdulás nagyobb mint 5–10px → dragnek tekintjük
        if (dx > 8 || dy > 8) {
            isDragging = true;
        }
    });

    img.addEventListener('mouseup', e => {
        if (!isDragging) {
            // tényleges kattintás
            const link = img.getAttribute('data-link');
            if (link) location.href = link;
        }
    });
});

const slider = document.querySelector('.slider');

if (slider) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let currentIndex = 1;
    let autoInterval;
    const autoDelay = 5000;
    const dragSensitivity = 0.6;
    let isLooping = false; // lock a jumphoz

    // ---- KLÓNOZÁS (Végtelenítéshez) ----
    const slides = Array.from(slider.children);

    // Első és utolsó elem másolása
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    firstClone.classList.add('clone');
    lastClone.classList.add('clone');

    slider.appendChild(firstClone);
    slider.insertBefore(lastClone, slides[0]);

    const allSlides = slider.querySelectorAll('img');

    // FONTOS: let, hogy frissíthető legyen átméretezéskor
    let slideWidth = slider.offsetWidth;

    // Kezdő pozíció beállítása (az első valódi képre, ami az 1-es index)
    slider.scrollLeft = slideWidth * currentIndex;

    // ---- PÖTTYÖK (DOTS) KEZELÉSE ----
    const dots = document.querySelectorAll('.slider-nav a');

    function updateDots() {
        dots.forEach(dot => dot.style.backgroundColor = '#ffffff'); // alap fehér

        let dotIndex = currentIndex - 1; // a klónokat figyelembe véve korrigálunk

        // Ha túllépnénk a határokon a klónok miatt:
        if(dotIndex >= dots.length) dotIndex = 0;
        if(dotIndex < 0) dotIndex = dots.length - 1;

        // Biztonsági ellenőrzés és színezés
        if(dots[dotIndex]) {
            dots[dotIndex].style.backgroundColor = '#00ca65'; // aktív zöld
        }
    }

    updateDots(); // kezdeti állapot

    // ---- MOZGATÁS FUNKCIÓ ----
    function moveToSlide(index) {
        slider.scrollTo({
            left: index * slideWidth,
            behavior: 'smooth'
        });
        currentIndex = index;
        updateDots();
    }

    // ---- AUTOMATIKUS LÉPTETÉS ----
    function nextSlide() { moveToSlide(currentIndex + 1); }
    function prevSlide() { moveToSlide(currentIndex - 1); }

    function startAutoSlide() {
        stopAutoSlide();
        autoInterval = setInterval(() => {
            nextSlide();
        }, autoDelay);
    }

    function stopAutoSlide() { clearInterval(autoInterval); }

    // ---- MANUÁLIS HÚZÁS (DRAG) ----
    slider.addEventListener('mousedown', (e) => {
        stopAutoSlide();
        isDown = true;
        slider.classList.add('active');
        slider.style.scrollBehavior = 'auto'; // húzáskor nincs simítás
        startX = e.pageX;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const delta = e.pageX - startX;
        slider.scrollLeft = scrollLeft - delta * dragSensitivity;
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDown) return;
        isDown = false;
        slider.classList.remove('active');
        const dragDistance = e.pageX - startX;
        snapWithThreshold(dragDistance);
        startAutoSlide();
    });

    // Érintőképernyő támogatás
    slider.addEventListener('touchstart', () => stopAutoSlide());
    slider.addEventListener('touchend', () => {
        snapWithThreshold(0); // Itt nem számolunk delta-t külön, csak igazítunk
        startAutoSlide();
    });

    slider.addEventListener('dragstart', (e) => e.preventDefault());

    function snapWithThreshold(dragDistance) {
        const threshold = slideWidth * 0.15; // 15%-ot kell húzni a váltáshoz
        if (dragDistance < -threshold) nextSlide();
        else if (dragDistance > threshold) prevSlide();
        else moveToSlide(currentIndex);
    }

    // ---- VÉGTELENÍTÉS LOGIKA (LOOP FIX) ----
    slider.addEventListener('scroll', () => {
        if (isLooping) return;

        // Ha valamiért 0 lenne a szélesség (ritka hiba), újramérjük
        if (slideWidth === 0) slideWidth = slider.offsetWidth;

        // Ha az utolsó klónhoz értünk (jobb szél)
        if (currentIndex >= allSlides.length - 1 && slider.scrollLeft >= slideWidth * (allSlides.length - 1) - 10) {
            isLooping = true;
            slider.style.scrollBehavior = 'auto';
            slider.scrollLeft = slideWidth; // Ugrás az első valódi képre
            currentIndex = 1;
            updateDots();
            setTimeout(() => { slider.style.scrollBehavior = 'smooth'; isLooping = false; }, 20);
        }
        // Ha az első klónhoz értünk (bal szél)
        else if (currentIndex <= 0 && slider.scrollLeft <= 10) {
            isLooping = true;
            slider.style.scrollBehavior = 'auto';
            slider.scrollLeft = slideWidth * (allSlides.length - 2); // Ugrás az utolsó valódi képre
            currentIndex = allSlides.length - 2;
            updateDots();
            setTimeout(() => { slider.style.scrollBehavior = 'smooth'; isLooping = false; }, 20);
        }
    });

    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);

    // Indítás
    startAutoSlide();

    // ---- PÖTTYÖKRE KATTINTÁS ----
    dots.forEach((dot, i) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            moveToSlide(i + 1); // +1 a bal oldali klón miatt
        });
    });

    // ==========================================
    // RESIZE FIX: ABLAK ÁTMÉRETEZÉS KEZELÉSE
    // ==========================================
    window.addEventListener('resize', () => {
        // 1. Újraszámoljuk a slider aktuális szélességét
        slideWidth = slider.offsetWidth;

        // 2. Azonnal a helyes pozícióba görgetünk animáció nélkül
        // Így a kép közepe ott marad, ahol lennie kell
        slider.style.scrollBehavior = 'auto';
        slider.scrollLeft = currentIndex * slideWidth;

        // 3. Visszaállítjuk a smooth scrollt egy pillanat múlva
        setTimeout(() => {
            slider.style.scrollBehavior = 'smooth';
        }, 50);
    });

}

/* =========================
   BMI KALKULÁTOR RÉSZ (JAVÍTOTT)
========================= */
document.addEventListener('DOMContentLoaded', () => {
    const bmiForm = document.getElementById('bmiForm');
    const bmiCircle = document.getElementById('bmiCircle');
    const bmiValueEl = document.getElementById('bmiValue');
    const bmiStatusEl = document.getElementById('bmiStatus');
    const bmiDescriptionEl = document.getElementById('bmiDescription');

    // A r=52 sugárhoz tartozó pontos kerület: 2 * Math.PI * 52 ≈ 326.72
    const circumference = 326.72;

    if (bmiForm) {
        bmiForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const weight = parseFloat(document.getElementById('weight').value.toString().replace(',', '.'));
            const heightCm = parseFloat(document.getElementById('height').value.toString().replace(',', '.'));

            if (weight > 0 && heightCm > 0) {
                const heightM = heightCm / 100;
                const bmi = weight / (heightM * heightM);
                const finalBmi = Number(Math.round(bmi + 'e1') + 'e-1');

                updateUI(finalBmi);
            }
        });
    }

    function updateUI(bmi) {
        bmiValueEl.innerText = bmi.toString().replace('.', ',');

        let status = "";
        let color = "";
        let desc = "";

        if (bmi < 18.5) {
            status = "Sovány"; color = "#3498db"; desc = "Fokozott tápanyagbevitel javasolt.";
        } else if (bmi < 25) {
            status = "Normál"; color = "#2ecc71"; desc = "Optimális testsúly, gratulálunk!";
        } else if (bmi < 30) {
            status = "Túlsúly"; color = "#f1c40f"; desc = "Figyelj oda a mozgásra és az étrendre.";
        } else {
            status = "Elhízás"; color = "#e74c3c"; desc = "Életmódváltás és szakember javasolt.";
        }

        bmiStatusEl.innerText = status;
        bmiStatusEl.style.color = color;
        bmiDescriptionEl.innerText = desc;
        bmiValueEl.style.color = color;

        // Kör animáció: 40-es BMI-nél legyen 100% a kör
        const percentage = Math.min(bmi / 40, 1);
        const offset = circumference - (percentage * circumference);

        bmiCircle.style.strokeDashoffset = offset;
        bmiCircle.style.stroke = color;
    }
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show'); // Hozzáadjuk az osztályt
            // observer.unobserve(entry.target); // Ha csak egyszer akarod lejátszani, vedd ki a kommentet
        } else {
            entry.target.classList.remove('show'); // Ha azt akarod, hogy újra eltűnjön kigörgetéskor
        }
    });
});

const hiddenElements = document.querySelectorAll('.fadeIn');
hiddenElements.forEach((el) => observer.observe(el));

/* --- Google Translate Inicializálás --- */
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'hu',      // Az oldalad eredeti nyelve
        includedLanguages: 'en,de,hu', // Támogatott nyelvek
        autoDisplay: false       // Ne dobja fel a sávot automatikusan
    }, 'google_translate_element');
}

/* --- Egyedi gomb vezérlő függvény --- */
function valtsNyelvet(nyelvKod) {
    // Megkeressük a Google által generált rejtett legördülő listát
    var selectMezo = document.querySelector(".goog-te-combo");

    if (selectMezo) {
        selectMezo.value = nyelvKod; // Beállítjuk a kiválasztott nyelvet

        // "Becsapjuk" a rendszert, mintha a felhasználó kattintott volna
        selectMezo.dispatchEvent(new Event('change'));
    }
}
function showInfo(type) {
    const modal = document.getElementById('infoModal');
    const title = document.getElementById('modalTitle');
    const text = document.getElementById('modalText');

    const infoData = {
        'eatClean': {
            title: 'Eat Clean',
            text: 'A tiszta étkezés az egészséges életmód alapja. Fókuszálj a feldolgozatlan élelmiszerekre, sok zöldségre, minőségi fehérjére és komplex szénhidrátokra. Kerüld a hozzáadott cukrot és a mesterséges adalékanyagokat.'
        },
        'trainHard': {
            title: 'Work Hard',
            text: 'A következetes edzés kulcsfontosságú a fejlődéshez. Legyen szó súlyzós edzésről vagy kardióról, a lényeg a progresszió és a kitartás. Ne felejtsd el: az eredményekért meg kell dolgozni!'
        },
        'sleepWell': {
            title: 'Sleep Well',
            text: 'A regeneráció legalább olyan fontos, mint az edzés. Napi 7-9 óra minőségi alvás szükséges az izmok épüléséhez, a hormonháztartás egyensúlyához és a mentális frissességhez.'
        }
    };

    title.innerText = infoData[type].title;
    text.innerText = infoData[type].text;
    modal.style.display = 'grid';
}

function closeInfo() {
    document.getElementById('infoModal').style.display = 'none';
}

// Bezárás ha a modál mellé kattintunk
window.onclick = function(event) {
    const modal = document.getElementById('infoModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}