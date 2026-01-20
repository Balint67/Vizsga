document.addEventListener('DOMContentLoaded', function() {
    const trainerOptions = document.querySelectorAll('input[name="trainer"]');
    const courseContainer = document.getElementById('course-container');
    const timeArea = document.getElementById('time-selection-area');
    const slotsContainer = document.getElementById('available-slots');
    const bookingForm = document.getElementById('bookingForm');
    const dateInput = document.getElementById('booking-date');

    // 1. NAPTÁR LIMITÁLÁSA (Csak a mai naptól lehessen foglalni)
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today;

    // 2. ADATOK (Edzők és Specializációk)
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

    const times = ['08:00', '10:00', '14:00', '16:00', '18:00'];
    let selectedTime = null;

    // 3. FÜGGVÉNY: Órák generálása
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
                renderSlots();
            });

            courseContainer.appendChild(label);
        });
    }

    // 4. FÜGGVÉNY: Időpontok generálása
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

    // 5. ESEMÉNYKEZELŐK
    trainerOptions.forEach(opt => {
        opt.addEventListener('change', () => renderCourses(opt.value));
    });


    // URL és KEZDŐÁLLAPOT
    function initBooking() {
        // 1. Megnézzük, van-e paraméter a linkben (pl. ?edzo=maya)
        const urlParams = new URLSearchParams(window.location.search);
        const trainerFromUrl = urlParams.get('edzo');

        // 2. Eldöntjük, ki legyen a kiválasztott
        let selectedTrainer = 'hayoto';

        if (trainerFromUrl && trainerSpecs[trainerFromUrl]) {
            selectedTrainer = trainerFromUrl;
        }

        // 3. Bejelöljük a megfelelő gombot a HTML-ben
        const radioToSelect = document.querySelector(`input[name="trainer"][value="${selectedTrainer}"]`);
        if (radioToSelect) {
            radioToSelect.checked = true;
        }

        // 4. Kirajzoljuk az órákat
        renderCourses(selectedTrainer);
    }

    // Indítás
    initBooking();


    // 6. FORM BEKÜLDÉSE
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const selectedTrainerInput = document.querySelector('input[name="trainer"]:checked');
        const selectedCourseInput = document.querySelector('input[name="course"]:checked');
        const date = dateInput.value;

        if (!selectedCourseInput || !date || !selectedTime) {
            alert("Kérlek válassz órát, dátumot és időpontot is!");
            return;
        }

        const trainerName = selectedTrainerInput.parentElement.querySelector('span').innerText;
        const courseName = selectedCourseInput.parentElement.querySelector('.course-box').innerText;
        const userName = document.getElementById('user-name').value;

        alert(`Sikeres foglalás!\n\nNév: ${userName}\nEdző: ${trainerName}\nÓra: ${courseName}\nIdőpont: ${date} ${selectedTime}`);
    });
});