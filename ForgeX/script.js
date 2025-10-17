function showIcons() {
    document.querySelector('.btn').style.display = 'none'; // gomb eltűnik
    document.querySelector('.right-icons').style.display = 'flex'; // div megjelenik
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


