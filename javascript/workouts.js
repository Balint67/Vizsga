function initModals() {
    const modal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const video = document.getElementById('modalVideo');
    const source = document.getElementById('modalVideoSource');
    const triggers = document.querySelectorAll('.info-trigger-card');
    const closeBtn = document.querySelector('.close-modal');

    if (!modal || !video || !source) return;

    const infoData = {
        hannah: {
            title: 'Fiatalkorúaknak Gyakorlatok',
            video: 'videos/workouts/hannahSitUp.mp4'
        },
        heath: {
            title: 'Fiatal felnőtteknek Gyakorlatok',
            video: 'videos/workouts/heathBiceps.mp4'
        },
        mayaSquats: {
            title: 'Középkorosztálynak Gyakorlatok',
            video: 'videos/workouts/mayaSquats.mp4'
        },
        mayaBench: {
            title: 'Negyven feletti Gyakorlatok',
            video: 'videos/workouts/mayaBench.mp4'
        },
        hayoto: {
            title: 'Idősebb korosztálynak Gyakorlatok',
            video: 'videos/workouts/hayotoElders.mp4'
        }
    };

    function openModal(type) {
        const data = infoData[type];
        if (!data) return;

        modalTitle.innerText = data.title;
        source.src = data.video;

        video.load(); // Frissíti a forrást
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');

        // Automatikus lejátszás megkísérlése
        video.play().catch(e => console.log("Auto-play megállítva a böngésző által"));
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

// FONTOS: Ez indítja el a kódot, amikor betölt az oldal!
document.addEventListener('DOMContentLoaded', initModals);