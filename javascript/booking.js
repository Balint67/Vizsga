import { auth, db } from './firebase.js';
// Import the custom modal tool
import { forgeXModal } from './utils.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// Hozzáadtuk: collection, addDoc, serverTimestamp
import { doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    const trainerOptions = document.querySelectorAll('input[name="trainer"]');
    const courseContainer = document.getElementById('course-container');
    const timeArea = document.getElementById('time-selection-area');
    const slotsContainer = document.getElementById('available-slots');
    const bookingForm = document.getElementById('bookingForm');

    // Naptár elemei
    const calendarDays = document.getElementById('calendar-days');
    const monthYearText = document.getElementById('currentMonthYear');
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    // --- ADATOK (Meglévő edzők és órák) ---
    const trainerSpecs = {
        'hayoto': ["Post-traumás rehabilitáció", "Ízületi mobilitás & gerinc", "Mindfulness & légzés", "Korrektív gyakorlatok"],
        'maya': ["Testtartás javítás", "Súlykontroll és alakformálás", "Funkcionális köredzések", "Kezdők felépítése az alapoktól"],
        'hannah': ["HIIT (Intervallum edzés)", "Szálkásítás és alakformálás", "Állóképesség fejlesztés", "Dinamikus nyújtás és core"],
        'heath': ["Erőemelő felkészítés", "Izomtömeg-növelés", "Táplálkozási tanácsadás", "Periodizált edzéstervezés"]
    };

    const times = ['08:00', '10:00', '14:00', '16:00', '18:00'];

    // Állapotváltozók
    let currentViewDate = new Date();
    let selectedDate = new Date();
    let selectedTime = null;

    // --- ÚJ FUNKCIÓ: AUTOMATIKUS KITÖLTÉS ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Felhasználó felismerve, adatok lekérése...");
            try {
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    // Kitöltjük a form mezőit a Firestore-ból
                    if(document.getElementById('user-name')) document.getElementById('user-name').value = userData.fullname || "";
                    if(document.getElementById('user-email')) document.getElementById('user-email').value = userData.email || user.email;
                    console.log("Mezők automatikusan kitöltve.");
                }
            } catch (error) {
                console.error("Hiba az adatok előtöltésekor:", error);
            }
        } else {
            // Opcionális: Ha nincs belépve, átküldheted a loginra,
            // hogy ne is tudjon foglalni
            console.log("Nincs bejelentkezve felhasználó.");
        }
    });

    // --- 1. FUNKCIÓ: EGYEDI NAPTÁR GENERÁLÁSA (Változatlan) ---
    function renderCalendar() {
        if (!calendarDays) return;
        calendarDays.innerHTML = '';
        const year = currentViewDate.getFullYear();
        const month = currentViewDate.getMonth();
        const monthName = new Intl.DateTimeFormat('hu-HU', { month: 'long', year: 'numeric' }).format(currentViewDate);
        monthYearText.innerText = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let emptySlots = firstDay === 0 ? 6 : firstDay - 1;
        for (let i = 0; i < emptySlots; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarDays.appendChild(emptyDiv);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.innerText = day;
            const checkDate = new Date(year, month, day);
            if (checkDate < today) {
                dayDiv.classList.add('past');
            } else {
                if (checkDate.toDateString() === selectedDate.toDateString()) {
                    dayDiv.classList.add('selected');
                }
                dayDiv.onclick = () => {
                    selectedDate = new Date(checkDate);
                    renderCalendar();
                    renderSlots();
                };
                if (checkDate.toDateString() === today.toDateString()) {
                    dayDiv.classList.add('today');
                }
            }
            calendarDays.appendChild(dayDiv);
        }
    }

    // --- 2. FUNKCIÓ: IDŐPONTOK GENERÁLÁSA (Változatlan) ---
    function renderSlots() {
        slotsContainer.innerHTML = '';
        selectedTime = null;
        times.forEach(time => {
            const btn = document.createElement('div');
            btn.className = 'slot';
            btn.innerText = time;
            btn.onclick = function() {
                document.querySelectorAll('.slot').forEach(s => s.classList.remove('active'));
                this.classList.add('active');
                selectedTime = time;
            };
            slotsContainer.appendChild(btn);
        });
    }

    // --- 3. FUNKCIÓ: ÓRÁK GENERÁLÁSA (Változatlan) ---
    function renderCourses(trainerKey) {
        courseContainer.innerHTML = '';
        timeArea.style.display = 'none';
        trainerSpecs[trainerKey].forEach((spec, index) => {
            const label = document.createElement('label');
            label.className = 'course-option';
            label.innerHTML = `
                <input type="radio" name="course" value="course-${index}">
                <div class="course-box">${spec}</div>
            `;
            label.querySelector('input').addEventListener('change', function() {
                timeArea.style.display = 'block';
                renderCalendar();
                renderSlots();
            });
            courseContainer.appendChild(label);
        });
    }

    // --- 4. ESEMÉNYKEZELŐK A NAPTÁRHOZ (Változatlan) ---
    if(prevBtn) {
        prevBtn.onclick = (e) => {
            e.preventDefault();
            currentViewDate.setMonth(currentViewDate.getMonth() - 1);
            renderCalendar();
        };
    }
    if(nextBtn) {
        nextBtn.onclick = (e) => {
            e.preventDefault();
            currentViewDate.setMonth(currentViewDate.getMonth() + 1);
            renderCalendar();
        };
    }

    trainerOptions.forEach(opt => {
        opt.addEventListener('change', () => renderCourses(opt.value));
    });

    function initBooking() {
        const urlParams = new URLSearchParams(window.location.search);
        const trainerFromUrl = urlParams.get('edzo');
        let selectedTrainer = 'hayoto';
        if (trainerFromUrl && trainerSpecs[trainerFromUrl]) {
            selectedTrainer = trainerFromUrl;
        }
        const radioToSelect = document.querySelector(`input[name="trainer"][value="${selectedTrainer}"]`);
        if (radioToSelect) {
            radioToSelect.checked = true;
        }
        renderCourses(selectedTrainer);
    }

    initBooking();

// --- 5. FORM SUBMISSION (Updated with Glassmorphism Modal) ---
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // 1. Collect data
        const selectedTrainerInput = document.querySelector('input[name="trainer"]:checked');
        const selectedCourseInput = document.querySelector('input[name="course"]:checked');

        // 2. Validation with custom modal
        if (!selectedCourseInput || !selectedDate || !selectedTime) {
            // Await the modal so the code pauses until the user clicks OK
            await forgeXModal("Figyelem", "Kérlek válassz órát, napot és időpontot is!");
            return;
        }

        const trainerName = selectedTrainerInput.parentElement.querySelector('.trainer-name').innerText;
        const courseName = selectedCourseInput.parentElement.querySelector('.course-box').innerText;
        const userName = document.getElementById('user-name').value;
        const userEmail = document.getElementById('user-email').value;
        const userNote = document.getElementById('user-note').value;

        // Format date
        const formattedDate = selectedDate.toISOString().split('T')[0];

        // 3. Auth check
        const user = auth.currentUser;
        if (!user) {
            await forgeXModal("Bejelentkezés szükséges", "A foglaláshoz kérlek jelentkezz be!");
            window.location.href = "bejelentkezes.html";
            return;
        }

        try {
            // 4. Save to Firestore
            const weightVal = document.getElementById('user-weight').value;
            const ageVal = document.getElementById('user-age').value;
            const docRef = await addDoc(collection(db, "bookings"), {
                userId: user.uid,
                userName: userName,
                userEmail: userEmail,
                trainer: trainerName,
                course: courseName,
                date: formattedDate,
                time: selectedTime,
                note: userNote,
                createdAt: serverTimestamp(),
                weight: Number(weightVal),
                age: Number(ageVal),
            });

            // 5. Success message with Glassmorphism
            // The code waits here for the user to click "OK" before redirecting
            await forgeXModal(
                "Sikeres foglalás!",
                `Kedves ${userName}, rögzítettük az időpontodat a(z) ${trainerName} edzőhöz.`
            );

            // 6. Redirect to profile page
            window.location.href = "profil.html";

        } catch (error) {
            console.error("Firebase save error: ", error);
            await forgeXModal("Hiba", "Sajnos nem sikerült elmenteni a foglalást. Próbáld újra!");
        }
    });
});