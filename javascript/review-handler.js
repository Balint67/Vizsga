document.addEventListener('DOMContentLoaded', () => {
    const reviewModal = document.getElementById('reviewModal');
    const deleteModal = document.getElementById('deleteConfirmModal');
    const openButton = document.getElementById('openReviewModal');
    const closeButton = reviewModal?.querySelector('.close-modal');
    const reviewForm = document.getElementById('reviewForm');
    const reviewLayout = document.querySelector('.review-layout');
    const confirmDeleteButton = document.getElementById('confirmDeleteBtn');
    const cancelDeleteButton = document.getElementById('cancelDeleteBtn');

    if (!reviewModal || !deleteModal || !openButton || !closeButton || !reviewForm || !reviewLayout) {
        return;
    }

    let pendingDeleteId = null;

    const openModal = (modalElement) => {
        modalElement.style.display = 'flex';
    };

    const closeModal = (modalElement) => {
        modalElement.style.display = 'none';
    };

    const getStoredReviews = () => JSON.parse(localStorage.getItem('forgeX_reviews')) || [];

    const saveStoredReviews = (reviews) => {
        localStorage.setItem('forgeX_reviews', JSON.stringify(reviews));
    };

    const createStars = (rating) => {
        const stars = document.createElement('div');
        stars.className = 'stars';

        for (let index = 1; index <= 5; index += 1) {
            const icon = document.createElement('i');
            icon.className = index <= Number(rating) ? 'fas fa-star' : 'far fa-star';
            stars.appendChild(icon);
        }

        return stars;
    };

    const getInitials = (name) =>
        name
            .trim()
            .split(/\s+/)
            .map((part) => part[0] || '')
            .join('')
            .toUpperCase()
            .slice(0, 2);

    const renderReview = (review, scrollIntoView = false) => {
        const card = document.createElement('div');
        card.className = 'info-card review-card';
        card.dataset.id = String(review.id);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-review';
        deleteButton.type = 'button';
        deleteButton.setAttribute('aria-label', 'Velemeny torlese');
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.addEventListener('click', () => {
            pendingDeleteId = review.id;
            openModal(deleteModal);
        });

        const avatarRow = document.createElement('div');
        avatarRow.className = 'avatar-row';

        const avatar = document.createElement('span');
        avatar.className = 'avatar';
        avatar.style.background = '#00ca65';
        avatar.textContent = getInitials(review.name);
        avatarRow.appendChild(avatar);

        const title = document.createElement('h4');
        title.textContent = review.name;

        const body = document.createElement('p');
        body.className = 'review-body';
        body.textContent = `"${review.text}"`;

        const date = document.createElement('span');
        date.className = 'date';
        date.textContent = review.date;

        card.appendChild(deleteButton);
        card.appendChild(avatarRow);
        card.appendChild(title);
        card.appendChild(createStars(review.rating));
        card.appendChild(body);
        card.appendChild(date);

        reviewLayout.prepend(card);

        if (scrollIntoView) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    const loadReviews = () => {
        getStoredReviews().forEach((review) => renderReview(review));
    };

    const removeReviewCard = (reviewId) => {
        const card = reviewLayout.querySelector(`[data-id="${reviewId}"]`);
        if (!card) {
            return;
        }

        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        setTimeout(() => card.remove(), 300);
    };

    openButton.addEventListener('click', () => openModal(reviewModal));
    closeButton.addEventListener('click', () => closeModal(reviewModal));

    reviewModal.addEventListener('click', (event) => {
        if (event.target === reviewModal) {
            closeModal(reviewModal);
        }
    });

    deleteModal.addEventListener('click', (event) => {
        if (event.target === deleteModal) {
            closeModal(deleteModal);
            pendingDeleteId = null;
        }
    });

    cancelDeleteButton?.addEventListener('click', () => {
        closeModal(deleteModal);
        pendingDeleteId = null;
    });

    confirmDeleteButton?.addEventListener('click', () => {
        if (pendingDeleteId === null) {
            closeModal(deleteModal);
            return;
        }

        const updatedReviews = getStoredReviews().filter((review) => String(review.id) !== String(pendingDeleteId));
        saveStoredReviews(updatedReviews);
        removeReviewCard(pendingDeleteId);
        pendingDeleteId = null;
        closeModal(deleteModal);
    });

    reviewForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nameInput = document.getElementById('revName');
        const textInput = document.getElementById('revText');
        const ratingInput = document.querySelector('input[name="stars"]:checked');

        const review = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: nameInput.value.trim(),
            text: textInput.value.trim(),
            rating: ratingInput?.value || 5,
            date: new Date().toLocaleDateString('hu-HU').replace(/\s/g, '')
        };

        const reviews = getStoredReviews();
        reviews.push(review);
        saveStoredReviews(reviews);
        renderReview(review, true);

        reviewForm.reset();
        closeModal(reviewModal);
    });

    loadReviews();
});
