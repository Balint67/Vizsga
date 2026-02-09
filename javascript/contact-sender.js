(function() {
    // NAGYON FONTOS: Ide másold be a Public Key-t az Account menüpontból!
    // Ez valahogy így néz ki: "user_xxxxxxxxxxxxxxxx" vagy "A1b2C3d4..."
    emailjs.init("mrWqT0EgKMuylPIYL");
})();

window.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Gomb zárolása, hogy ne lehessen többször rákattintani
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Küldés folyamatban...';

            // Küldés az adataiddal
            // Paraméterek: Service ID (a képedről), Template ID (amit küldtél), és maga a form
            emailjs.sendForm('service_9bstzkn', 'template_oalzvqy', this)
                .then(() => {
                    alert('Sikeres küldés! Köszönjük az üzenetet, hamarosan válaszolunk.');
                    contactForm.reset(); // Mezők kiürítése
                })
                .catch((error) => {
                    console.error('Hiba történt:', error);
                    alert('Sajnos hiba történt a küldés során. Próbálja újra később!');
                })
                .finally(() => {
                    // Gomb visszaállítása eredeti állapotba
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                });
        });
    }
});