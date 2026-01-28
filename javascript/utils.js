export const forgeXModal = (title, message, isConfirm = false) => {
    return new Promise((resolve) => {
        // Create the background overlay
        const overlay = document.createElement('div');
        overlay.classList.add('custom-modal-overlay');

        // Build the modal structure using our ForgeX styles
        overlay.innerHTML = `
            <div class="custom-modal-box">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="modal-buttons">
                    ${isConfirm ? `<button class="modal-btn modal-btn-secondary" id="modal-cancel">Mégse</button>` : ''}
                    <button class="modal-btn modal-btn-primary" id="modal-ok">OK</button>
                </div>
            </div>
        `;

        // Add to the document body
        document.body.appendChild(overlay);

        // Trigger the entry animation after a tiny delay
        setTimeout(() => overlay.classList.add('active'), 10);

        // Helper function to handle closing and returning the result
        const closeModal = (value) => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                resolve(value); // Resolve the promise with true or false
            }, 300);
        };

        // Attach event listeners to buttons
        overlay.querySelector('#modal-ok').addEventListener('click', () => closeModal(true));

        if (isConfirm) {
            overlay.querySelector('#modal-cancel').addEventListener('click', () => closeModal(false));
        }
    });
};