import { auth } from './firebase.js'; // A te meglévő fájlodat használjuk
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // Kiválasztjuk az összes ikont/linket, ami alapból a signIn.html-re mutat
    const profileLinks = document.querySelectorAll('a[href="signIn.html"], #profile-link');

    onAuthStateChanged(auth, (user) => {
        profileLinks.forEach(link => {
            if (user) {
                // Ha be van jelentkezve: a profilra küldjük
                link.href = "profil.html";
                console.log("Státusz: Bejelentkezve -> Cél: profil.html");
            } else {
                // Ha nincs bejelentkezve: marad a bejelentkezésnél
                link.href = "signIn.html";
                console.log("Státusz: Kijelentkezve -> Cél: signIn.html");
            }
        });
    });
});