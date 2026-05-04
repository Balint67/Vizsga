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

document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveCookiesBtn');
    const analyticsBox = document.getElementById('cookie_analytics');
    const marketingBox = document.getElementById('cookie_marketing');

    const savedAnalytics = localStorage.getItem('forgex_analytics');
    const savedMarketing = localStorage.getItem('forgex_marketing');

    if (analyticsBox) {
        analyticsBox.checked = savedAnalytics === null ? true : savedAnalytics === 'true';
    }

    if (marketingBox) {
        marketingBox.checked = savedMarketing === 'true';
    }

    if (!saveButton || !analyticsBox || !marketingBox) {
        return;
    }

    saveButton.addEventListener('click', () => {
        localStorage.setItem('forgex_analytics', analyticsBox.checked);
        localStorage.setItem('forgex_marketing', marketingBox.checked);

        const originalText = saveButton.innerText;
        saveButton.innerText = 'BEALLITASOK MENTVE!';
        saveButton.style.filter = 'brightness(1.2)';

        setTimeout(() => {
            saveButton.innerText = originalText;
            saveButton.style.filter = '';
            showStatusModal(
                'Beallitasok elmentve',
                'A süti beállításokat sikeresen frissítettük.'
            );
        }, 600);
    });
});
