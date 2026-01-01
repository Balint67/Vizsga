function showIcons() {
    document.querySelector('.btn').style.display = 'none'; // gomb eltűnik
    document.querySelector('.right-icons').style.display = 'flex';
    document.querySelector('.bejelentkez').style.display = 'flex'; // div megjelenik
}

function onpagehide(){
    document.querySelector('.bejelentkez').style.display = 'none'; // div eltűnik
}

const togglePassword = document.getElementById('togglePassword');
const password = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    const type = password.type === 'password' ? 'text' : 'password';
    password.type = type;

    // ikon váltás szem ↔ szem áthúzva
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
});


// Kiválasztjuk a videót (a .no-interact class alapján)
const video = document.querySelector('.no-interact');

if (video) {
    // Amikor véget ér, megállítjuk és az utolsó képkockán tartjuk
    video.addEventListener('ended', () => {
        video.pause();
        video.currentTime = video.duration;
    });
}

// Slide Show
const slider = document.querySelector('.slider');
let isDown = false;
let startX;
let scrollLeft;

// 1. Egér lenyomása
slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
});

// 2. Egér felengedése - JAVÍTVA
// Most már a 'window'-t figyeljük, nem a 'slider'-t.
// Így bárhol engeded el a gombot, megáll a húzás.
window.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('active');
});

// 3. Egér mozgatása
slider.addEventListener('mousemove', (e) => {
    if (!isDown) return; // Ha nincs lenyomva, nem csinál semmit
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // A *2 a sebesség, növelheted, ha gyorsabbat akarsz
    slider.scrollLeft = scrollLeft - walk;
});
slider.addEventListener('dragstart', (e) => {
    e.preventDefault();
});

