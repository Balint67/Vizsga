import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const authLink = document.getElementById('auth-link');

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Felhasználó felismerve, gomb átállítva a profilra.");
        authLink.href = "profil.html";
    } else {
        console.log("Nincs bejelentkezett felhasználó.");
        authLink.href = "bejelentkezes.html";
    }
});