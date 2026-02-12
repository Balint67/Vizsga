let currentSlide = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');

    // Aktuális eltávolítása
    slides[currentSlide].classList.remove('active');

    // Új index kiszámítása (körforgással)
    currentSlide = (currentSlide + direction + slides.length) % slides.length;

    // Új megjelenítése
    slides[currentSlide].classList.add('active');
}