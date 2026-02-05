/**
 * Displays a custom ForgeX modal dialog.
 * Can be used as an alert or a confirmation modal.
 *
 * @param {string} title - The modal title text
 * @param {string} message - The modal message text
 * @param {boolean} isConfirm - Determines if the modal has a cancel button
 * @returns {Promise<boolean>} Resolves true for OK, false for Cancel
 */
export const forgeXModal = (title, message, isConfirm = false) => {
    return new Promise((resolve) => {

        // Create modal overlay element
        const overlayElement = document.createElement('div');
        overlayElement.classList.add('custom-modal-overlay');

        // Build modal HTML structure
        overlayElement.innerHTML = `
            <div class="custom-modal-box">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="modal-buttons">
                    ${
            isConfirm
                ? `<button class="modal-btn modal-btn-secondary" id="modal-cancel">Mégse</button>`
                : ''
        }
                    <button class="modal-btn modal-btn-primary" id="modal-ok">OK</button>
                </div>
            </div>
        `;

        // Append modal to document body
        document.body.appendChild(overlayElement);

        // Activate entrance animation
        setTimeout(() => {
            overlayElement.classList.add('active');
        }, 10);

        /**
         * Closes the modal and resolves the promise
         * @param {boolean} result - User choice
         */
        const closeModal = (result) => {
            overlayElement.classList.remove('active');

            setTimeout(() => {
                overlayElement.remove();
                resolve(result);
            }, 300);
        };

        // OK button event handler
        const okButton = overlayElement.querySelector('#modal-ok');
        okButton.addEventListener('click', () => closeModal(true));

        // Cancel button event handler (only for confirm modals)
        if (isConfirm) {
            const cancelButton = overlayElement.querySelector('#modal-cancel');
            cancelButton.addEventListener('click', () => closeModal(false));
        }
    });
};
