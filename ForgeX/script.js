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
