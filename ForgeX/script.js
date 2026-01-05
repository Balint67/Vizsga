/* =========================
   SLIDER (MANUAL + AUTO, TRUE INFINITE, FIXED)
========================= */

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

    // ---- CLONE FIRST & LAST ----
    const slides = Array.from(slider.children);
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.classList.add('clone');
    lastClone.classList.add('clone');
    slider.appendChild(firstClone);
    slider.insertBefore(lastClone, slides[0]);

    const allSlides = slider.querySelectorAll('img');
    const slideWidth = slider.offsetWidth;

    slider.scrollLeft = slideWidth * currentIndex;

    // ---- MOVE FUNCTION ----
    function moveToSlide(index) {
        slider.scrollTo({
            left: index * slideWidth,
            behavior: 'smooth'
        });
        currentIndex = index;
    }

    // ---- AUTO SLIDE ----
    function nextSlide() { moveToSlide(currentIndex + 1); }
    function prevSlide() { moveToSlide(currentIndex - 1); }
    function startAutoSlide() {
        stopAutoSlide(); // biztosítjuk, hogy ne legyen több intervall
        autoInterval = setInterval(() => {
            // mindig 1 képpel megy előre az aktuális indexhez képest
            moveToSlide(currentIndex + 1);
        }, autoDelay);
    }

    function stopAutoSlide() { clearInterval(autoInterval); }

    // ---- MANUAL DRAG ----
    slider.addEventListener('mousedown', (e) => {
        stopAutoSlide();
        isDown = true;
        slider.classList.add('active');
        slider.style.scrollBehavior = 'auto';
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

    slider.addEventListener('touchstart', () => stopAutoSlide());
    slider.addEventListener('touchend', () => {
        snapWithThreshold(0);
        startAutoSlide();
    });

    slider.addEventListener('dragstart', (e) => e.preventDefault());

    function snapWithThreshold(dragDistance) {
        const threshold = slideWidth * 0.15;
        if (dragDistance < -threshold) nextSlide();
        else if (dragDistance > threshold) prevSlide();
        else moveToSlide(currentIndex);
    }

    // ---- LOOP FIX (ONLY ONCE) ----
    slider.addEventListener('scroll', () => {
        if (isLooping) return; // lock
        if (currentIndex === allSlides.length - 1 && slider.scrollLeft >= slideWidth * (allSlides.length - 1)) {
            isLooping = true;
            slider.style.scrollBehavior = 'auto';
            slider.scrollLeft = slideWidth; // első valódi kép
            currentIndex = 1;
            setTimeout(() => { slider.style.scrollBehavior = 'smooth'; isLooping = false; }, 20);
        } else if (currentIndex === 0 && slider.scrollLeft <= 0) {
            isLooping = true;
            slider.style.scrollBehavior = 'auto';
            slider.scrollLeft = slideWidth * (allSlides.length - 2); // utolsó valódi kép
            currentIndex = allSlides.length - 2;
            setTimeout(() => { slider.style.scrollBehavior = 'smooth'; isLooping = false; }, 20);
        }
    });

    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);

    startAutoSlide();
}
