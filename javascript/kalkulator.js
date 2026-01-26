/* =========================
   BMI KALKULÁTOR RÉSZ (JAVÍTOTT)
========================= */
document.addEventListener('DOMContentLoaded', () => {
    const bmiForm = document.getElementById('bmiForm');
    const bmiCircle = document.getElementById('bmiCircle');
    const bmiValueEl = document.getElementById('bmiValue');
    const bmiStatusEl = document.getElementById('bmiStatus');
    const bmiDescriptionEl = document.getElementById('bmiDescription');

    // A r=52 sugárhoz tartozó pontos kerület: 2 * Math.PI * 52 ≈ 326.72
    const circumference = 326.72;

    if (bmiForm) {
        bmiForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const weight = parseFloat(document.getElementById('weight').value.toString().replace(',', '.'));
            const heightCm = parseFloat(document.getElementById('height').value.toString().replace(',', '.'));

            if (weight > 0 && heightCm > 0) {
                const heightM = heightCm / 100;
                const bmi = weight / (heightM * heightM);
                const finalBmi = Number(Math.round(bmi + 'e1') + 'e-1');

                updateUI(finalBmi);
            }
        });
    }

    function updateUI(bmi) {
        bmiValueEl.innerText = bmi.toString().replace('.', ',');

        let status = "";
        let color = "";
        let desc = "";

        if (bmi < 18.5) {
            status = "Sovány"; color = "#3498db"; desc = "Fokozott tápanyagbevitel javasolt.";
        } else if (bmi < 25) {
            status = "Normál"; color = "#2ecc71"; desc = "Optimális testsúly, gratulálunk!";
        } else if (bmi < 30) {
            status = "Túlsúly"; color = "#f1c40f"; desc = "Figyelj oda a mozgásra és az étrendre.";
        } else {
            status = "Elhízás"; color = "#e74c3c"; desc = "Életmódváltás és szakember javasolt.";
        }

        bmiStatusEl.innerText = status;
        bmiStatusEl.style.color = color;
        bmiDescriptionEl.innerText = desc;
        bmiValueEl.style.color = color;

        // Kör animáció: 40-es BMI-nél legyen 100% a kör
        const percentage = Math.min(bmi / 40, 1);
        const offset = circumference - (percentage * circumference);

        bmiCircle.style.strokeDashoffset = offset;
        bmiCircle.style.stroke = color;
    }
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show'); // Hozzáadjuk az osztályt
            // observer.unobserve(entry.target); // Ha csak egyszer akarod lejátszani, vedd ki a kommentet
        } else {
            entry.target.classList.remove('show'); // Ha azt akarod, hogy újra eltűnjön kigörgetéskor
        }
    });
});
