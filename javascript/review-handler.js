import { auth, db } from './firebase.js';
import { forgeXModal } from './utils.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

    const reviewsCollection = collection(db, 'reviews');
    let pendingDeleteId = null;
    let currentUser = auth.currentUser;
    let hasLoadedReviews = false;

    onAuthStateChanged(auth, (user) => {
        currentUser = user;

        if (hasLoadedReviews) {
            loadReviews();
        }
    });

    const openModal = (modalElement) => {
        modalElement.style.display = 'flex';
    };

    const closeModal = (modalElement) => {
        modalElement.style.display = 'none';
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

    const formatDate = (timestamp) => {
        if (!timestamp) {
            return new Date().toLocaleDateString('hu-HU').replace(/\s/g, '');
        }

        const date = typeof timestamp.toDate === 'function'
            ? timestamp.toDate()
            : new Date(timestamp);

        return date.toLocaleDateString('hu-HU').replace(/\s/g, '');
    };

    const createDeleteButton = (reviewId) => {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-review';
        deleteButton.type = 'button';
        deleteButton.setAttribute('aria-label', 'Delete review');
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.addEventListener('click', () => {
            pendingDeleteId = reviewId;
            openModal(deleteModal);
        });
        return deleteButton;
    };

    const buildReviewCard = (review) => {
        const card = document.createElement('div');
        card.className = 'info-card review-card';
        card.dataset.reviewId = String(review.id);

        if (currentUser && review.userId === currentUser.uid) {
            card.appendChild(createDeleteButton(review.id));
        }

        const avatarRow = document.createElement('div');
        avatarRow.className = 'avatar-row';

        const avatar = document.createElement('span');
        avatar.className = 'avatar';
        avatar.style.background = '#00ca65';
        avatar.textContent = getInitials(review.name || 'FX');
        avatarRow.appendChild(avatar);

        const title = document.createElement('h4');
        title.textContent = review.name || 'ForgeX User';

        const body = document.createElement('p');
        body.className = 'review-body';
        body.textContent = `"${review.text || ''}"`;

        const date = document.createElement('span');
        date.className = 'date';
        date.textContent = review.date;

        card.appendChild(avatarRow);
        card.appendChild(title);
        card.appendChild(createStars(review.rating || 5));
        card.appendChild(body);
        card.appendChild(date);

        return card;
    };

    const renderReview = (review, options = {}) => {
        const { prepend = false, scrollIntoView = false } = options;
        const existingCard = reviewLayout.querySelector(`[data-review-id="${review.id}"]`);

        if (existingCard) {
            existingCard.remove();
        }

        const card = buildReviewCard(review);

        if (prepend) {
            reviewLayout.prepend(card);
        } else {
            reviewLayout.appendChild(card);
        }

        if (scrollIntoView) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    const loadReviews = async () => {
        try {
            reviewLayout.querySelectorAll('[data-review-id]').forEach((card) => card.remove());
            const reviewsQuery = query(reviewsCollection, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(reviewsQuery);

            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                renderReview({
                    id: docSnap.id,
                    name: data.name || 'ForgeX User',
                    text: data.text || '',
                    rating: Number(data.rating || 5),
                    userId: data.userId || null,
                    date: formatDate(data.createdAt)
                });
            });
            hasLoadedReviews = true;
        } catch (error) {
            console.error('Error while loading reviews from Firestore:', error);
        }
    };

    const removeReviewCard = (reviewId) => {
        const card = reviewLayout.querySelector(`[data-review-id="${reviewId}"]`);
        if (!card) {
            return;
        }

        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        setTimeout(() => card.remove(), 300);
    };

    openButton.addEventListener('click', async () => {
        if (!currentUser) {
            await forgeXModal(
                'Bejelentkezés szükséges',
                'A vélemény írás művelethez bejelentezés szükséges.'
            );
            window.location.href = 'signIn.html';
            return;
        }

        openModal(reviewModal);
    });

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

    confirmDeleteButton?.addEventListener('click', async () => {
        if (!pendingDeleteId) {
            closeModal(deleteModal);
            return;
        }

        try {
            await deleteDoc(doc(db, 'reviews', pendingDeleteId));
            removeReviewCard(pendingDeleteId);
        } catch (error) {
            console.error('Hiba az üzenet törlése közben:', error);
            await forgeXModal(
                'A törlés sikertelen',
                'Jelneleg nem tudjuk törölni ezt az értékelést. Kérjük, probálja meg késöbb.'
            );
        } finally {
            pendingDeleteId = null;
            closeModal(deleteModal);
        }
    });

    reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = reviewForm.querySelector('button[type="submit"]');
        const nameInput = document.getElementById('revName');
        const textInput = document.getElementById('revText');
        const ratingInput = document.querySelector('input[name="stars"]:checked');
        const name = nameInput.value.trim();
        const text = textInput.value.trim();
        const rating = Number(ratingInput?.value || 5);

        if (!currentUser) {
            await forgeXModal(
                'Bejelentkezés szükséges',
                'A vélemény írás művelethez bejelentezés szükséges.'
            );
            window.location.href = 'signIn.html';
            return;
        }

        if (!name || !text) {
            await forgeXModal(
                'Hiányzó információ',
                'Kérjük, a vélemény elküldéséhez tüntesse fel nevét és üzenetét.'
            );
            return;
        }

        const originalButtonText = submitButton.innerText;
        submitButton.disabled = true;
        submitButton.innerText = 'Sending...';

        try {
            const docRef = await addDoc(reviewsCollection, {
                name,
                text,
                rating,
                userId: currentUser.uid,
                createdAt: serverTimestamp()
            });

            renderReview({
                id: docRef.id,
                name,
                text,
                rating,
                userId: currentUser.uid,
                date: formatDate(new Date())
            }, {
                prepend: true,
                scrollIntoView: true
            });

            reviewForm.reset();
            closeModal(reviewModal);
            await forgeXModal(
                'Üzenet elküldve',
                'A véleményét sikeresen mentettük.'
            );
        } catch (error) {
            console.error('Error while saving review:', error);
            await forgeXModal(
                'Save failed',
                'We could not save your review. Please make sure you are signed in and that Firestore allows writes to the reviews collection.'
            );
        } finally {
            submitButton.disabled = false;
            submitButton.innerText = originalButtonText;
        }
    });

    loadReviews();
});
