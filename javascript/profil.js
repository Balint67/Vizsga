import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Profil oldal: Felhasználó azonosítva:", user.uid);

        // 1. Alapadatok betöltése (Név, Email, Telefon)
        const userRef = doc(db, "users", user.uid);
        try {
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                document.getElementById('prof-name').innerText = userData.fullname || "Nincs megadva";
                document.getElementById('prof-email').innerText = userData.email || user.email;
                document.getElementById('prof-phone').innerText = userData.phone || "Nincs megadva";
            }
        } catch (error) {
            console.error("Hiba az adatok lekérésekor:", error);
        }

        // 2. FOGLALÁSOK BETÖLTÉSE
        loadUserBookings(user.uid);

    } else {
        window.location.replace("bejelentkezes.html");
    }
});

async function loadUserBookings(uid) {
    const bookingsContainer = document.getElementById('user-bookings');
    if (!bookingsContainer) return;

    try {
        const q = query(collection(db, "bookings"), where("userId", "==", uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            bookingsContainer.innerHTML = '<p>Nincsenek aktív foglalásaid.</p>';
            return;
        }

        bookingsContainer.innerHTML = '';

        querySnapshot.forEach((doc) => {
            const booking = doc.data();
            const bookingId = doc.id;

            const bookingItem = document.createElement('div');
            bookingItem.className = 'booking-item';
            bookingItem.innerHTML = `
                <div class="booking-info">
                    <p><strong>${booking.course}</strong></p>
                    <p>${booking.trainer} - ${booking.date} ${booking.time}</p>
                </div>
                <button class="delete-booking-btn" data-id="${bookingId}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            bookingsContainer.appendChild(bookingItem);
        });

        document.querySelectorAll('.delete-booking-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const bId = e.currentTarget.getAttribute('data-id');
                if (confirm("Biztosan törölni szeretnéd ezt a foglalást?")) {
                    await deleteBooking(bId, uid);
                }
            });
        });

    } catch (error) {
        console.error("Hiba a foglalások betöltésekor:", error);
        bookingsContainer.innerHTML = '<p>Hiba történt a foglalások betöltésekor.</p>';
    }
}

async function deleteBooking(id, uid) {
    try {
        await deleteDoc(doc(db, "bookings", id));
        console.log("Foglalás törölve:", id);
        // Frissítjük a listát a törlés után
        loadUserBookings(uid);
    } catch (error) {
        console.error("Hiba a törlés során:", error);
        alert("Nem sikerült törölni a foglalást.");
    }
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => window.location.replace("index.html"));
    });
}