// ===============================
// 🔹 LOCAL IMPORTS
// ===============================
import { auth, db } from './firebase.js';
import { forgeXModal } from './utils.js';

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
        window.location.replace("bejelentkezes.html");
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
            userData.fullname || "Not provided";

        document.getElementById('prof-email').innerText =
            userData.email || user.email;

        document.getElementById('prof-phone').innerText =
            userData.phone || "Not provided";

    } catch (error) {
        console.error("Error while loading user profile data:", error);
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
            container.innerHTML = '<p>You have no active bookings.</p>';
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
        console.error("Error while loading bookings:", error);
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
                "Delete confirmation",
                "Are you sure you want to delete this booking?",
                true
            );

            if (!confirmed) return;

            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.error("User not authenticated during deletion.");
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
        console.log("Booking deleted:", bookingId);

        // Reload bookings after deletion
        loadUserBookings(userId);

    } catch (error) {
        console.error("Error while deleting booking:", error);
        alert("Failed to delete booking.");
    }
}

// ===============================
// 🔹 LOGOUT HANDLER
// ===============================
const logoutButton = document.getElementById('logout-btn');

if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        await signOut(auth);
        window.location.replace("index.html");
    });
}
