// Megvárjuk, amíg a HTML oldal teljesen betöltődik
document.addEventListener('DOMContentLoaded', function () {
    
    // Megkeressük a szem ikont és a jelszó mezőt az ID alapján
    const togglePassword = document.querySelector('#togglePassword');
    const passwordField = document.querySelector('#password');

    // Csak akkor fut le a kód, ha mindkét elem létezik az adott oldalon
    if (togglePassword && passwordField) {
        
        togglePassword.addEventListener('click', function () {
            // Megnézzük az aktuális típust (password vagy text)
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            
            // Beállítjuk az új típust
            passwordField.setAttribute('type', type);
            
            // Ikon cseréje: ha látszik a jelszó, áthúzott szemet mutatunk
            // A FontAwesome 'fa-eye' és 'fa-eye-slash' osztályait váltogatjuk
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
});