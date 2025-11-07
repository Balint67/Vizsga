function showIcons() {
  document.querySelector('.singIn-btn').style.display = 'none'; // gomb eltűnik
  document.querySelector('.right-icons').style.display = 'flex'; // div megjelenik
}




/* kalkulátor*/
document.getElementById("bmiForm").addEventListener("submit", function(e) {
  e.preventDefault();

  let weight = parseFloat(document.getElementById("weight").value);
  let height = parseFloat(document.getElementById("height").value) / 100;

  if (weight > 0 && height > 0) {
    let bmi = (weight / (height * height)).toFixed(1);
    let category = "";
    let cssClass = "";

    if (bmi < 18.5) {
      category = "Sovány";
      cssClass = "result-under";
    } else if (bmi < 25) {
      category = "Normál súly";
      cssClass = "result-normal";
    } else if (bmi < 30) {
      category = "Túlsúlyos";
      cssClass = "result-over";
    } else {
      category = "Elhízott";
      cssClass = "result-obese";
    }

    document.getElementById("result").innerHTML = `
            A BMI értéked: <span style="color:#22c55e">${bmi}</span>
            <div class="result-box ${cssClass}">${category}</div>
        `;
  } else {
    document.getElementById("result").innerHTML =
      `<span style="color:red">Kérlek adj meg helyes adatokat!</span>`;
  }
});
/* === ÚJ BMI KIEGÉSZÍTÉS === */

const progressCircle = document.getElementById("progressCircle");
const bmiValueSpan = document.getElementById("bmiValue");
const bmiDesc = document.getElementById("bmiDescription");

// amikor a felhasználó újra kiszámol
document.getElementById("bmiForm").addEventListener("submit", function() {
  const weight = parseFloat(document.getElementById("weight").value);
  const height = parseFloat(document.getElementById("height").value) / 100;
  const bmi = (weight / (height * height)).toFixed(1);

  let color, text;
  if (bmi < 18.5) {
    color = "#3b82f6";
    text = "Sovány – Próbálj meg többet enni és figyelj a tápanyagokra.";
  } else if (bmi < 25) {
    color = "#22c55e";
    text = "Normál testsúly – Gratulálok, tartsd meg az egészséges életmódot!";
  } else if (bmi < 30) {
    color = "#eab308";
    text = "Túlsúly – Érdemes kicsit jobban figyelni a táplálkozásra és a mozgásra.";
  } else {
    color = "#ef4444";
    text = "Elhízott – Fontos lehet szakemberrel egyeztetni az étrendről és mozgásról.";
  }

  // kördiagram kitöltése
  const percentage = Math.min((bmi / 40) * 360, 360);
  progressCircle.style.background = `conic-gradient(${color} ${percentage}deg, #333 ${percentage}deg)`;
  bmiValueSpan.textContent = bmi;

  // leírás megjelenítése animáltan
  bmiDesc.textContent = text;
  bmiDesc.classList.add("show");

  // adatok mentése localStorage-be
  localStorage.setItem("lastWeight", weight);
  localStorage.setItem("lastHeight", height * 100);
});


