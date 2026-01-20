document.addEventListener('DOMContentLoaded', function() {
    const courseOptions = document.querySelectorAll('input[name="course"]');
    const timeArea = document.getElementById('time-selection-area');
    const slotsContainer = document.getElementById('available-slots');
    const bookingForm = document.getElementById('bookingForm');

    // Időrend (szimulált adat)
    const schedule = {
        'rehab': ['08:00', '09:30', '16:00'],
        'spine': ['10:00', '11:30', '17:00'],
        'mindful': ['07:30', '18:30', '19:45'],
        'corrective': ['14:00', '15:15', '20:00']
    };

    let selectedTime = null;

    // Óra választás esemény
    courseOptions.forEach(opt => {
        opt.addEventListener('change', function() {
            timeArea.style.display = 'block';
            renderSlots(this.value);
        });
    });

    function renderSlots(courseKey) {
        slotsContainer.innerHTML = '';
        selectedTime = null;

        schedule[courseKey].forEach(time => {
            const btn = document.createElement('button');
            btn.type = 'button';
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

    // Beküldés kezelése
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const trainer = document.querySelector('input[name="trainer"]:checked').value;
        const course = document.querySelector('input[name="course"]:checked');
        const date = document.getElementById('booking-date').value;

        if (!course || !date || !selectedTime) {
            alert("Kérlek válassz órát, dátumot és időpontot is!");
            return;
        }

        const courseName = course.parentElement.querySelector('.course-box').innerText;
        const name = document.getElementById('user-name').value;

        alert(`Sikeres foglalás!\n\nNév: ${name}\nEdző: ${trainer}\nÓra: ${courseName}\nIdőpont: ${date} ${selectedTime}`);
        // Itt küldheted tovább az adatokat szerverre
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const trainerOptions = document.querySelectorAll('input[name="trainer"]');
    const courseContainer = document.getElementById('course-container');
    const timeArea = document.getElementById('time-selection-area');
    const slotsContainer = document.getElementById('available-slots');
    const bookingForm = document.getElementById('bookingForm');

    // Edzők és az ő saját óráik (Specializációik)
    const trainerSpecs = {
        'hayoto': [
            "Post-traumás rehabilitáció",
            "Ízületi mobilitás & gerinc",
            "Mindfulness & légzés",
            "Korrektív gyakorlatok"
        ],
        'maya': [
            "Testtartás javítás",
            "Súlykontroll és alakformálás",
            "Funkcionális köredzések",
            "Kezdők felépítése az alapoktól"
        ],
        'hannah': [
            "HIIT (Intervallum edzés)",
            "Szálkásítás és alakformálás",
            "Állóképesség fejlesztés",
            "Dinamikus nyújtás és core"
        ],
        'heath': [
            "Erőemelő felkészítés",
            "Izomtömeg-növelés",
            "Táplálkozási tanácsadás",
            "Periodizált edzéstervezés"
        ]
    };

    // Fix időpontok (minden órához ezeket rendeljük most hozzá)
    const times = ['08:00', '10:00', '14:00', '16:00', '18:00'];
    let selectedTime = null;

    // FÜGGVÉNY: Órák (gombok) legenerálása az edző alapján
    function renderCourses(trainerKey) {
        courseContainer.innerHTML = ''; // Régi órák törlése
        timeArea.style.display = 'none'; // Időpontok elrejtése az új választásig

        trainerSpecs[trainerKey].forEach((spec, index) => {
            const label = document.createElement('label');
            label.className = 'course-option';

            label.innerHTML = `
                <input type="radio" name="course" value="course-${index}">
                <div class="course-box">${spec}</div>
            `;

            // Ha kiválasztanak egy órát, mutassuk az időpontokat
            label.querySelector('input').addEventListener('change', function() {
                timeArea.style.display = 'block';
                renderSlots();
            });

            courseContainer.appendChild(label);
        });
    }

    // FÜGGVÉNY: Időpontok kirajzolása
    function renderSlots() {
        slotsContainer.innerHTML = '';
        selectedTime = null;

        times.forEach(time => {
            const btn = document.createElement('button');
            btn.type = 'button';
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

    // Edző váltás esemény
    trainerOptions.forEach(opt => {
        opt.addEventListener('change', () => renderCourses(opt.value));
    });

    // Alapértelmezett betöltés (Hayoto órái)
    renderCourses('hayoto');

    // Beküldés
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const trainer = document.querySelector('input[name="trainer"]:checked').value;
        const course = document.querySelector('input[name="course"]:checked');
        const date = document.getElementById('booking-date').value;

        if (!course || !date || !selectedTime) {
            alert("Kérlek válassz órát, dátumot és időpontot is!");
            return;
        }

        const courseName = course.parentElement.querySelector('.course-box').innerText;
        alert(`Sikeres foglalás!\n\nEdző: ${trainer}\nÓra: ${courseName}\nIdőpont: ${date} ${selectedTime}`);
    });
});