document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('reviewModal');
    const openBtn = document.getElementById('openReviewModal');
    const closeBtn = document.querySelector('.close-modal');
    const reviewForm = document.getElementById('reviewForm');
    const reviewLayout = document.querySelector('.review-layout');

    // Modal nyitás/zárás
    openBtn.onclick = () => modal.style.display = 'flex';
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; }

    // Vélemény beküldése
    reviewForm.onsubmit = (e) => {
        e.preventDefault();

        const name = document.getElementById('revName').value;
        const text = document.getElementById('revText').value;
        const rating = document.querySelector('input[name="stars"]:checked')?.value || 5;
        const date = new Date().toLocaleDateString('hu-HU').replace(/\s/g, '');

        // Új kártya létrehozása
        const newCard = document.createElement('div');
        newCard.className = 'info-card review-card';

        // Csillagok generálása
        let starsHtml = '';
        for(let i=1; i<=5; i++) {
            starsHtml += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        }

        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        newCard.innerHTML = `
            <div class="avatar-row">
                <span class="avatar" style="background: #00ca65;">${initials}</span>
            </div>
            <h4>${name}</h4>
            <div class="stars">${starsHtml}</div>
            <p class="review-body">"${text}"</p>
            <span class="date">${date}</span>
        `;

        // Hozzáadás az elejére és bezárás
        reviewLayout.prepend(newCard);
        reviewForm.reset();
        modal.style.display = 'none';

        // Görgetés az új véleményhez
        newCard.scrollIntoView({ behavior: 'smooth' });
    };
});

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('reviewModal');
    const openBtn = document.getElementById('openReviewModal');
    const closeBtn = document.querySelector('.close-modal');
    const reviewForm = document.getElementById('reviewForm');
    const reviewLayout = document.querySelector('.review-layout');

    // Modal nyitás/zárás
    openBtn.onclick = () => modal.style.display = 'flex';
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; }

    // Vélemény beküldése
    reviewForm.onsubmit = (e) => {
        e.preventDefault();

        const name = document.getElementById('revName').value;
        const text = document.getElementById('revText').value;
        const rating = document.querySelector('input[name="stars"]:checked')?.value || 5;
        const date = new Date().toLocaleDateString('hu-HU').replace(/\s/g, '');

        // Új kártya létrehozása
        const newCard = document.createElement('div');
        newCard.className = 'info-card review-card my-review'; // Kap egy extra osztályt a törléshez

        let starsHtml = '';
        for(let i=1; i<=5; i++) {
            starsHtml += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        }

        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        newCard.innerHTML = `
            <button class="delete-review" title="Vélemény törlése">
                <i class="fas fa-trash-alt"></i>
            </button>
            <div class="avatar-row">
                <span class="avatar" style="background: #00ca65;">${initials}</span>
            </div>
            <h4>${name}</h4>
            <div class="stars">${starsHtml}</div>
            <p class="review-body">"${text}"</p>
            <span class="date">${date}</span>
        `;

        // Törlés funkció hozzáadása az új gombhoz
        const deleteBtn = newCard.querySelector('.delete-review');
        deleteBtn.onclick = () => {
            if(confirm('Biztosan törölni szeretnéd a véleményedet?')) {
                newCard.style.transform = 'scale(0.8)';
                newCard.style.opacity = '0';
                setTimeout(() => newCard.remove(), 300);
            }
        };

        reviewLayout.prepend(newCard);
        reviewForm.reset();
        modal.style.display = 'none';
        newCard.scrollIntoView({ behavior: 'smooth' });
    };
});


document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('reviewModal');
    const openBtn = document.getElementById('openReviewModal');
    const closeBtn = document.querySelector('.close-modal');
    const reviewForm = document.getElementById('reviewForm');
    const reviewLayout = document.querySelector('.review-layout');

    // --- 1. VÉLEMÉNYEK BETÖLTÉSE A TÁRHELYRŐL ---
    loadReviews();

    // Modal nyitás/zárás
    openBtn.onclick = () => modal.style.display = 'flex';
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; }

    // --- 2. VÉLEMÉNY BEKÜLDÉSE ÉS MENTÉSE ---
    reviewForm.onsubmit = (e) => {
        e.preventDefault();

        const name = document.getElementById('revName').value;
        const text = document.getElementById('revText').value;
        const rating = document.querySelector('input[name="stars"]:checked')?.value || 5;
        const date = new Date().toLocaleDateString('hu-HU').replace(/\s/g, '');

        // Egyedi ID a törléshez
        const reviewId = Date.now();

        const reviewData = {
            id: reviewId,
            name: name,
            text: text,
            rating: rating,
            date: date
        };

        // Mentés LocalStorage-ba
        saveReviewToLocal(reviewData);

        // Megjelenítés az oldalon
        renderReview(reviewData, true);

        reviewForm.reset();
        modal.style.display = 'none';
    };

    function renderReview(data, isNew = false) {
        const newCard = document.createElement('div');
        newCard.className = 'info-card review-card';
        newCard.dataset.id = data.id;

        let starsHtml = '';
        for(let i=1; i<=5; i++) {
            starsHtml += i <= data.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        }

        const initials = data.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        newCard.innerHTML = `
            <button class="delete-review" onclick="deleteReview(${data.id})">
                <i class="fas fa-trash-alt"></i>
            </button>
            <div class="avatar-row">
                <span class="avatar" style="background: #00ca65;">${initials}</span>
            </div>
            <h4>${data.name}</h4>
            <div class="stars">${starsHtml}</div>
            <p class="review-body">"${data.text}"</p>
            <span class="date">${data.date}</span>
        `;

        reviewLayout.prepend(newCard);
        if(isNew) newCard.scrollIntoView({ behavior: 'smooth' });
    }

    function saveReviewToLocal(review) {
        let reviews = JSON.parse(localStorage.getItem('forgeX_reviews')) || [];
        reviews.push(review);
        localStorage.setItem('forgeX_reviews', JSON.stringify(reviews));
    }

    function loadReviews() {
        let reviews = JSON.parse(localStorage.getItem('forgeX_reviews')) || [];
        reviews.forEach(review => renderReview(review));
    }
});

// --- 3. TÖRLÉS A TÁRHELYRŐL IS ---
function deleteReview(id) {
    if(confirm('Biztosan törölni szeretnéd a véleményedet?')) {
        let reviews = JSON.parse(localStorage.getItem('forgeX_reviews')) || [];
        reviews = reviews.filter(r => r.id !== id);
        localStorage.setItem('forgeX_reviews', JSON.stringify(reviews));

        const card = document.querySelector(`[data-id="${id}"]`);
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        setTimeout(() => card.remove(), 300);
    }
}


let currentDeleteId = null;

function deleteReview(id) {
    currentDeleteId = id;
    const deleteModal = document.getElementById('deleteConfirmModal');
    deleteModal.style.display = 'flex';
}

// Törlés megerősítése
document.getElementById('confirmDeleteBtn').onclick = () => {
    if (currentDeleteId) {
        let reviews = JSON.parse(localStorage.getItem('forgeX_reviews')) || [];
        reviews = reviews.filter(r => r.id !== currentDeleteId);
        localStorage.setItem('forgeX_reviews', JSON.stringify(reviews));

        const card = document.querySelector(`[data-id="${currentDeleteId}"]`);
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            setTimeout(() => card.remove(), 300);
        }

        document.getElementById('deleteConfirmModal').style.display = 'none';
        currentDeleteId = null;
    }
};

// Mégse gomb és modal zárása
document.getElementById('cancelDeleteBtn').onclick = () => {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    currentDeleteId = null;
};

// Zárás ha mellékattintanak
window.addEventListener('click', (event) => {
    const deleteModal = document.getElementById('deleteConfirmModal');
    if (event.target == deleteModal) {
        deleteModal.style.display = 'none';
        currentDeleteId = null;
    }
});