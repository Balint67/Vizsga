document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('saveCookiesBtn');
    const analyticsBox = document.getElementById('cookie_analytics');
    const marketingBox = document.getElementById('cookie_marketing');

    // 1. BETÖLTÉS: Megnézzük a mentett beállításokat a localStorage-ban
    const savedAnalytics = localStorage.getItem('forgex_analytics');
    const savedMarketing = localStorage.getItem('forgex_marketing');

    // Beállítás: Ha még nincs mentés (null), az analitika alapból be van kapcsolva
    if (analyticsBox) {
        analyticsBox.checked = savedAnalytics === null ? true : savedAnalytics === 'true';
    }
    if (marketingBox) {
        marketingBox.checked = savedMarketing === 'true';
    }

    // 2. MENTÉS: Amikor a gombra kattintanak
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            localStorage.setItem('forgex_analytics', analyticsBox.checked);
            localStorage.setItem('forgex_marketing', marketingBox.checked);

            // Vizuális visszajelzés
            const originalText = saveBtn.innerText;
            saveBtn.innerText = "BEÁLLÍTÁSOK MENTVE!";
            saveBtn.style.filter = "brightness(1.2)";

            setTimeout(() => {
                saveBtn.innerText = originalText;
                saveBtn.style.filter = "";
                alert("A süti beállításokat sikeresen frissítettük!");
            }, 600);
        });
    }
});
