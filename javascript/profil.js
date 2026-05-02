// ===============================
// 🔹 LOCAL IMPORTS
// ===============================
import { auth, db } from './firebase.js';
import { forgeXModal } from './utils.js';
import {
    refreshAndSyncCurrentUser,
    requiresEmailVerification
} from './auth-utils.js';

// ===============================
// 🔹 FIREBASE AUTH IMPORTS
// ===============================
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ===============================
// 🔹 FIRESTORE IMPORTS
// ===============================
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================
// 🔹 AUTH STATE LISTENER
// ===============================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // Redirect to login page if not authenticated
        window.location.replace("signIn.html");
        return;
    }

    user = await refreshAndSyncCurrentUser() || user;

    if (requiresEmailVerification(user)) {
        await forgeXModal(
            "E-mail ellenőrzés szükséges",
            "Kérjük, ellenőrizze az e-mail címét a profil megnyitása előtt."
        );
        await signOut(auth);
        window.location.replace("signIn.html");
        return;
    }

    console.log("Profile page – authenticated user:", user.uid);

    // Load basic user profile data
    await loadUserProfile(user);

    // Load user bookings
    loadUserBookings(user.uid);
});

// ===============================
// 🔹 LOAD USER PROFILE DATA
// ===============================
async function loadUserProfile(user) {
    const userRef = doc(db, "users", user.uid);

    try {
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) return;

        const userData = snapshot.data();

        document.getElementById('prof-name').innerText =
            userData.fullname || "Nem biztosított";

        document.getElementById('prof-email').innerText =
            userData.email || user.email;

        document.getElementById('prof-phone').innerText =
            userData.phone || "Nem biztosított";

    } catch (error) {
        console.error("\n" + "Hiba a felhasználói profil adatainak betöltésekor:", error);
    }
}

// ===============================
// 🔹 LOAD USER BOOKINGS
// ===============================
async function loadUserBookings(userId) {
    const container = document.getElementById('user-bookings');
    if (!container) return;

    try {
        const bookingsQuery = query(
            collection(db, "bookings"),
            where("userId", "==", userId)
        );

        const snapshot = await getDocs(bookingsQuery);

        if (snapshot.empty) {
            container.innerHTML = '<p>Nincsenek aktív foglalásai.</p>';
            return;
        }

        container.innerHTML = "";

        snapshot.forEach((docSnap) => {
            const bookingData = docSnap.data();
            const bookingId = docSnap.id;

            const bookingElement = document.createElement('div');
            bookingElement.className = 'booking-item';
            bookingElement.innerHTML = `
                <div class="booking-info">
                    <p><strong>${bookingData.course}</strong></p>
                    <p>${bookingData.trainer} - ${bookingData.date} ${bookingData.time}</p>
                </div>
                <button class="delete-booking-btn" data-id="${bookingId}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            container.appendChild(bookingElement);
        });

        attachDeleteBookingHandlers(userId);

    } catch (error) {
        console.error("Hiba a foglalások betöltése során:", error);
        container.innerHTML = '<p>Failed to load bookings.</p>';
    }
}

// ===============================
// 🔹 ATTACH DELETE BUTTON HANDLERS
// ===============================
function attachDeleteBookingHandlers(userId) {
    document.querySelectorAll('.delete-booking-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const bookingId = event.currentTarget.getAttribute('data-id');

            const confirmed = await forgeXModal(
                "Megerősítés törlése",
                "Biztosan törölni szeretné ezt a foglalást?",
                true
            );

            if (!confirmed) return;

            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.error("A felhasználó nem lett hitelesítve a törlés során.");
                return;
            }

            await deleteBooking(bookingId, userId);
        });
    });
}

// ===============================
// 🔹 DELETE BOOKING
// ===============================
async function deleteBooking(bookingId, userId) {
    try {
        await deleteDoc(doc(db, "bookings", bookingId));
        console.log("Foglalás törölve:", bookingId);

        // Reload bookings after deletion
        loadUserBookings(userId);

    } catch (error) {
        console.error("Hiba a foglalás törlésekor:", error);
        await forgeXModal(
            "Sikertelen törlés",
            "\n" + "Nem tudtuk törölni ezt a foglalást. Kérjük, próbálja meg később."
        );
    }
}

// ===============================
// 🔹 LOGOUT HANDLER
// ===============================
const logoutButton = document.getElementById('logout-btn');

if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        const confirmed = await forgeXModal(
            "Kijelentkezés",
            "Ha most kijelentkezik, a kosarában és a kedvencekben lévő tételek törlődnek. Ha később ugyanabba a fiókba jelentkezik be, fiókadatai továbbra is elérhetők lesznek.",
            true
        );

        if (!confirmed) {
            return;
        }

        await signOut(auth);
        localStorage.removeItem("cart");
        localStorage.removeItem("favorites");
        window.location.replace("index.html");
    });
}
