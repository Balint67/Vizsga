document.addEventListener('DOMContentLoaded', function() {
    // Elemek kiválasztása
    const skeletonBtn = document.getElementById('skeletonBtn3D');
    const muscleBtn = document.getElementById('muscleBtn3D');
    const container = document.getElementById('iframeContainer');

    // iFrame kódok mentése
    const skeletonIframe = `<iframe class="IFrames_Iframe__WVuGl" src="https://human.biodigital.com/widget/?be=2Scq&amp;s=female&amp;background.colors=0,0,0,1,0,0,0,1&amp;initial.hand-hint=true&amp;ui-fullscreen=true&amp;ui-center=false&amp;ui-object-tree=false&amp;ui-dissect=true&amp;ui-zoom=true&amp;ui-help=true&amp;ui-tools-display=primary&amp;ui-info=true&amp;uaid=3M4a0" title="Skeletal System" width="100%" height="100%" data-testid="iframe" loading="lazy" sandbox="allow-modals allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"></iframe>`;

    const muscleIframe = `<iframe class="IFrames_Iframe__WVuGl" src="https://human.biodigital.com/widget/?be=2PcB&amp;background.colors=0,0,0,1,0,0,0,1&amp;initial.hand-hint=true&amp;ui-fullscreen=true&amp;ui-center=false&amp;ui-dissect=true&amp;ui-zoom=true&amp;ui-help=true&amp;ui-tools-display=primary&amp;ui-info=true&amp;uaid=3YfOR" title="Muscular System" width="100%" height="100%" data-testid="iframe" loading="lazy" sandbox="allow-modals allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"></iframe>`;

    // Ellenőrizzük, hogy léteznek-e az elemek (megelőzi a hibákat)
    if (skeletonBtn && muscleBtn && container) {

        skeletonBtn.addEventListener('click', function() {
            container.innerHTML = skeletonIframe;
            skeletonBtn.classList.add('active');
            muscleBtn.classList.remove('active');
        });

        muscleBtn.addEventListener('click', function() {
            container.innerHTML = muscleIframe;
            muscleBtn.classList.add('active');
            skeletonBtn.classList.remove('active');
        });
    }
});