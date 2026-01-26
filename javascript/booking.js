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
    let currentViewDate = new Date(); // Amit épp nézünk a naptárban
    let selectedDate = new Date();    // Amit kiválasztott a felhasználó
    let selectedTime = null;

    // --- 1. FUNKCIÓ: EGYEDI NAPTÁR GENERÁLÁSA ---
    function renderCalendar() {
        if (!calendarDays) return;
        calendarDays.innerHTML = '';

        const year = currentViewDate.getFullYear();
        const month = currentViewDate.getMonth();

        // Hónap és év kiírása
        const monthName = new Intl.DateTimeFormat('hu-HU', { month: 'long', year: 'numeric' }).format(currentViewDate);
        monthYearText.innerText = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Hétfői kezdéshez igazítás (JS-ben a vasárnap 0)
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
                    renderSlots(); // Újrarajzoljuk az időpontokat a választott naphoz
                };
                if (checkDate.toDateString() === today.toDateString()) {
                    dayDiv.classList.add('today');
                }
            }
            calendarDays.appendChild(dayDiv);
        }
    }

    // --- 2. FUNKCIÓ: IDŐPONTOK GENERÁLÁSA ---
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

    // --- 3. FUNKCIÓ: ÓRÁK GENERÁLÁSA (Meglévő logikád) ---
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
                renderCalendar(); // Megjelenítéskor generáljuk a naptárat
                renderSlots();    // És az időpontokat
            });

            courseContainer.appendChild(label);
        });
    }

    // --- 4. ESEMÉNYKEZELŐK A NAPTÁRHOZ ---
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

    // Edző választás figyelése
    trainerOptions.forEach(opt => {
        opt.addEventListener('change', () => renderCourses(opt.value));
    });

    // URL alapú kezdőállapot (Meglévő logikád)
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

    // --- 5. FORM BEKÜLDÉSE ---
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const selectedTrainerInput = document.querySelector('input[name="trainer"]:checked');
        const selectedCourseInput = document.querySelector('input[name="course"]:checked');

        if (!selectedCourseInput || !selectedDate || !selectedTime) {
            alert("Kérlek válassz órát, napot és időpontot is!");
            return;
        }

        const trainerName = selectedTrainerInput.parentElement.querySelector('.trainer-name').innerText;
        const courseName = selectedCourseInput.parentElement.querySelector('.course-box').innerText;
        const userName = document.getElementById('user-name').value;
        const formattedDate = selectedDate.toLocaleDateString('hu-HU');

        alert(`Sikeres foglalás!\n\nNév: ${userName}\nEdző: ${trainerName}\nÓra: ${courseName}\nIdőpont: ${formattedDate} ${selectedTime}`);
    });
});