(function () {
    emailjs.init("mrWqT0EgKMuylPIYL");
})();

function showStatusModal(title, message) {
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
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeModal();
        }
    });

    setTimeout(() => overlay.classList.add('active'), 10);
}

window.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const submitButton = document.getElementById('submit-btn');

    if (!contactForm || !submitButton) {
        return;
    }

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        submitButton.disabled = true;
        const originalText = submitButton.innerText;
        submitButton.innerText = 'Kuldes folyamatban...';

        emailjs.sendForm('service_9bstzkn', 'template_oalzvqy', contactForm)
            .then(() => {
                showStatusModal(
                    'Uzenet elkuldve',
                    'Koszonjuk az uzenetet, hamarosan valaszolunk.'
                );
                contactForm.reset();
            })
            .catch((error) => {
                console.error('Hiba tortent:', error);
                showStatusModal(
                    'Kuldesi hiba',
                    'Az uzenet kuldese most nem sikerult. Kerlek, probald ujra kesobb.'
                );
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerText = originalText;
            });
    });
});
