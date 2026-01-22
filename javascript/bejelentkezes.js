import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.querySelector('form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Sikeres bejelentkezés!");
        window.location.href = "index.html"; // Vagy ahová küldeni akarod a júzert
    } catch (error) {
        console.error(error);
        alert("Hibás email vagy jelszó!");
    }
});