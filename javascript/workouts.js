import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { forgeXModal } from './utils.js';

let currentUserId = null;

// Figyeljük a bejelentkezést a szinkronizációhoz
onAuthStateChanged(auth, (user) => {
    currentUserId = user ? user.uid : null;
});

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
        hannah: { id: 'plan-10-16', title: 'Junior Edzésterv', video: 'videos/workouts/hannahSitUp.mp4', price: 8590 },
        heath: { id: 'plan-17-30', title: 'Fiatal felnőtt Edzésterv', video: 'videos/workouts/heathBiceps.mp4', price: 12590 },
        mayaSquats: { id: 'plan-30-45', title: 'Adult Edzésterv', video: 'videos/workouts/mayaSquats.mp4', price: 19750 },
        mayaBench: { id: 'plan-45-plus', title: 'Master Edzésterv', video: 'videos/workouts/mayaBench.mp4', price: 19750 },
        hayoto: { id: 'plan-60-plus', title: 'Senior Edzésterv', video: 'videos/workouts/hayotoElders.mp4', price: 19750 }
    };

    async function handleAddToCart(item) {
        // 1. LocalStorage betöltése
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        // 2. Új tétel összeállítása a közös formátum szerint
        const newItem = {
            id: Date.now().toString(), // Egyedi ID a törléshez
            title: item.title,
            price: Number(item.price),
            size: "Digitális",
            color: null,
            image: "images/icons/wrkouts.jpg",
            quantity: 1
        };

        cart.push(newItem);
        localStorage.setItem("cart", JSON.stringify(cart));

        // 3. Fejléc számláló frissítése
        if (cartCountElement) {
            cartCountElement.innerText = cart.length;
        }

        // 4. Firestore szinkronizáció
        if (currentUserId) {
            try {
                await setDoc(doc(db, "carts", currentUserId), {
                    items: cart,
                    updatedAt: new Date()
                });
            } catch (error) {
                console.error("Firebase hiba:", error);
            }
        }

        // 5. Vizuális visszajelzés
        if (typeof forgeXModal === "function") {
            await forgeXModal("Kosárba téve", `${item.title} bekerült a kosaradba!`);
        } else {
            alert(`${item.title} hozzáadva!`);
        }

        closeModal();
    }

    function openModal(type) {
        const data = infoData[type];
        if (!data) return;

        modalTitle.innerText = data.title;
        source.src = data.video;
        addToCartBtn.innerText = `Kosárba teszem - ${data.price.toLocaleString('hu-HU')} Ft`;

        // Gomb eseménykezelő beállítása
        addToCartBtn.onclick = () => handleAddToCart(data);

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
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}

document.addEventListener('DOMContentLoaded', initModals);