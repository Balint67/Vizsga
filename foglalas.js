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