// ===============================

// ===============================
import { auth, db } from './firebase.js';
import { api } from './api.js';
import { forgeXModal } from './utils.js';
import {
    refreshAndSyncCurrentUser,
    requiresEmailVerification
} from './auth-utils.js';

// ===============================

// ===============================
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ===============================

// ===============================
import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================

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
    loadUserBookings(user);
});

// ===============================

// ===============================
async function loadUserProfile(user) {
    const userRef = doc(db, "users", user.uid);

    try {
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) return;

        const userData = snapshot.data();
        const missingValueText = "Nincs megadva";
        const hasProvidedValue = (value) =>
            value && String(value).trim() && String(value).trim().toLowerCase() !== "not provided";

        document.getElementById('prof-name').innerText =
            hasProvidedValue(userData.fullname) ? userData.fullname : missingValueText;

        document.getElementById('prof-email').innerText =
            userData.email || user.email;

        document.getElementById('prof-phone').innerText =
            hasProvidedValue(userData.phone) ? userData.phone : missingValueText;

    } catch (error) {
        console.error("Error while loading user profile data:", error);
    }
}

// ===============================

// ===============================
async function loadUserBookings(user) {
    const container = document.getElementById('user-bookings');
    if (!container) return;

    try {
        const bookings = await api.getBookings(user);

        if (!bookings.length) {
            container.innerHTML = '<p>Nincsenek aktív foglalásai.</p>';
            return;
        }

        container.innerHTML = "";

        bookings.forEach((bookingData) => {
            const bookingElement = document.createElement('div');
            bookingElement.className = 'booking-item';
            bookingElement.innerHTML = `
                <div class="booking-info">
                    <p><strong>${bookingData.course}</strong></p>
                    <p>${bookingData.trainer} - ${bookingData.date} ${bookingData.time}</p>
                </div>
                <button class="delete-booking-btn" data-id="${bookingData.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            container.appendChild(bookingElement);
        });

        attachDeleteBookingHandlers(user);

    } catch (error) {
        console.error("Error while loading bookings:", error);
        container.innerHTML = '<p>Nem sikerült betölteni a foglalásokat.</p>';
    }
}

// ===============================

// ===============================
function attachDeleteBookingHandlers(user) {
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
                console.error("User is not authenticated during deletion.");
                return;
            }

            await deleteBooking(bookingId, user);
        });
    });
}

// ===============================

// ===============================
async function deleteBooking(bookingId, user) {
    try {
        await api.deleteBooking(user, bookingId);
        console.log("Booking deleted:", bookingId);

        // Reload bookings after deletion
        loadUserBookings(user);

    } catch (error) {
        console.error("Error while loading bookings:", error);
        await forgeXModal(
            "Sikertelen törlés",
            "\n" + "Nem tudtuk törölni ezt a foglalást. Kérjük, próbálja meg később."
        );
    }
}

// ===============================

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
