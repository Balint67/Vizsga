import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Belépett felhasználó azonosítója:", user.uid);

        // Megpróbáljuk lekérni az adatokat
        try {
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                console.log("Adatok megtalálva:", userData);

                // Csak akkor írjuk be, ha létezik az elem a HTML-ben
                if(document.getElementById('prof-name')) document.getElementById('prof-name').innerText = userData.fullname;
                if(document.getElementById('prof-email')) document.getElementById('prof-email').innerText = userData.email;
                if(document.getElementById('prof-phone')) document.getElementById('prof-phone').innerText = userData.phone;
            } else {
                console.log("Sajnos nincs adatbázis-bejegyzés ehhez a felhasználóhoz!");
                // Ha nincs adatbázisban, legalább az emailt írjuk ki a bejelentkezésből
                if(document.getElementById('prof-email')) document.getElementById('prof-email').innerText = user.email;
            }
        } catch (error) {
            console.error("Hiba történt az adatok lekérésekor:", error);
        }
    } else {
        window.location.replace("bejelentkezes.html");
    }
});

// Kijelentkezés gomb - ellenőrizzük, hogy létezik-e az oldalon
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.replace("index.html");
        });
    });
}