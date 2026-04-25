(function () {
    const initEmailJS = () => {
        if (window.emailjs) {
            emailjs.init("mrWqT0EgKMuylPIYL");
            console.log("EmailJS készen áll.");
        } else {
            setTimeout(initEmailJS, 100);
        }
    };
    initEmailJS();
})();

function showStatusModal(title, message) {
    const oldOverlay = document.querySelector('.custom-modal-overlay');
    if (oldOverlay) oldOverlay.remove();
    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';
    overlay.innerHTML = `
        <div class="custom-modal-box">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-primary" type="button">OK</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('button').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    setTimeout(() => overlay.classList.add('active'), 10);
}

window.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const submitButton = document.getElementById('submit-btn');

    if (!contactForm || !submitButton) return;

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        submitButton.disabled = true;
        const originalText = submitButton.innerText;
        submitButton.innerText = 'Küldés...';

        // Itt hívjuk meg a küldést
        emailjs.sendForm('service_9bstzkn', 'template_oalzvqy', contactForm)
            .then(() => {
                showStatusModal('Üzenet elküldve', 'Az üzenete sikeresen elküldve.');
                contactForm.reset();
            })
            .catch((error) => {
                console.error('Hiba:', error);
                showStatusModal('Hiba történt', 'Sajnos nem sikerült elküldeni az üzenetet.');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerText = originalText;
            });
    });
});