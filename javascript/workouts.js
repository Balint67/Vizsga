function initModals() {
    const modal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const video = document.getElementById('modalVideo');
    const source = document.getElementById('modalVideoSource');
    const addToCartBtn = document.getElementById('modalAddToCart');
    const triggers = document.querySelectorAll('.info-trigger-card');
    const closeBtn = document.querySelector('.close-modal');
    const cartCountElement = document.getElementById('cart-count');

    if (!modal || !video || !source || !addToCartBtn) {
        console.error("Hiba: Néhány modal elem hiányzik a HTML-ből!");
        return;
    }

    const infoData = {
        hannah: {
            title: 'Fiatalkorúaknak Gyakorlatok',
            video: 'videos/workouts/hannahSitUp.mp4',
            price: 8590
        },
        heath: {
            title: 'Fiatal felnőtteknek Gyakorlatok',
            video: 'videos/workouts/heathBiceps.mp4',
            price: 12590
        },
        mayaSquats: {
            title: 'Középkorosztálynak Gyakorlatok',
            video: 'videos/workouts/mayaSquats.mp4',
            price: 19750
        },
        mayaBench: {
            title: 'Negyven feletti Gyakorlatok',
            video: 'videos/workouts/mayaBench.mp4',
            price: 19750
        },
        hayoto: {
            title: 'Idősebb korosztálynak Gyakorlatok',
            video: 'videos/workouts/hayotoElders.mp4',
            price: 19750
        }
    };

    // Price 19750 -> "19 750"
    function formatPrice(price) {
        return price.toLocaleString('hu-HU');
    }

    function openModal(type) {
        const data = infoData[type];
        if (!data) return;

        const formattedPrice = formatPrice(data.price);

        modalTitle.innerText = data.title;
        source.src = data.video;

        // Button Style
        addToCartBtn.innerText = `Kosárba teszem - ${formattedPrice} Ft`;

        addToCartBtn.onclick = function() {
            if (cartCountElement) {
                let currentCount = parseInt(cartCountElement.innerText) || 0;
                cartCountElement.innerText = currentCount + 1;
            }

            // Price Style in message
            alert(`${data.title} sikeresen hozzáadva a kosárhoz! Ár: ${formattedPrice} Ft`);

            closeModal();
        };

        video.load();
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');

        video.play().catch(e => console.log("Auto-play blokkolva"));
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        video.pause();
        video.currentTime = 0;
    }

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const type = trigger.getAttribute('data-modal');
            openModal(type);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', initModals);