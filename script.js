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