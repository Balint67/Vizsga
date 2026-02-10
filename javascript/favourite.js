import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { forgeXModal } from './utils.js';

let currentUserId = null;

function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

function saveFavorites(list) {
    localStorage.setItem('favorites', JSON.stringify(list));
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function removeFavoriteById(id) {
    const favs = getFavorites();
    const idx = favs.findIndex(f => f.id === id);
    if (idx >= 0) {
        favs.splice(idx, 1);
        saveFavorites(favs);
        saveFavoritesToCloud();
    }
}

async function addToCartFromFavorite(item) {
    const product = {
        id: item.id,
        title: item.title,
        price: item.price,
        size: item.size,
        color: item.color,
        image: item.image,
        quantity: 1
    };

    const cart = getCart();
    cart.push(product);
    saveCart(cart);

    // Update cart count
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.innerText = cart.length;
    }

    // Save to cloud if logged in
    if (currentUserId) {
        await saveCartToCloud();
    }

    await forgeXModal('Kosárba téve', `${product.title} bekerült a kosárba!`);
}

async function saveFavoritesToCloud() {
    if (!currentUserId) return;

    const localFavorites = getFavorites();
    try {
        await setDoc(doc(db, "favorites", currentUserId), {
            items: localFavorites,
            updatedAt: new Date()
        });
        console.log("Favorites saved to cloud.");
    } catch (error) {
        console.error("Error saving favorites to cloud:", error);
    }
}

async function saveCartToCloud() {
    if (!currentUserId) return;

    const localCart = getCart();
    try {
        await setDoc(doc(db, "carts", currentUserId), {
            items: localCart,
            updatedAt: new Date()
        });
        console.log("Cart saved to cloud.");
    } catch (error) {
        console.error("Error saving cart to cloud:", error);
    }
}

async function syncFavoritesFromFirestore() {
    if (!currentUserId) return;

    try {
        const favSnap = await getDoc(doc(db, "favorites", currentUserId));
        if (favSnap.exists()) {
            const cloudFavorites = favSnap.data().items || [];
            localStorage.setItem('favorites', JSON.stringify(cloudFavorites));
            console.log("Favorites loaded from cloud.");
        }
    } catch (error) {
        console.error("Error loading favorites from cloud:", error);
    }
}

async function syncCartFromFirestore() {
    if (!currentUserId) return;

    try {
        const cartSnap = await getDoc(doc(db, "carts", currentUserId));
        if (cartSnap.exists()) {
            const cloudCart = cartSnap.data().items || [];
            localStorage.setItem('cart', JSON.stringify(cloudCart));
            updateCartCount();
            console.log("Cart loaded from cloud.");
        }
    } catch (error) {
        console.error("Error loading cart from cloud:", error);
    }
}

function updateCartCount() {
    const cart = getCart();
    const el = document.getElementById("cart-count");
    if (el) el.innerText = cart.length;
}

function renderFavorites() {
    const container = document.getElementById('favorites-list');
    const noFavs = document.getElementById('no-favs');
    const favs = getFavorites();
    container.innerHTML = '';

    if (!favs.length) {
        noFavs.style.display = 'block';
        return;
    }

    noFavs.style.display = 'none';

    favs.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title;
        img.className = 'product-image';

        const title = document.createElement('h3');
        title.innerText = item.title;

        const price = document.createElement('p');
        price.className = 'product-price';
        price.innerText = item.price + ' Ft';

        // Action buttons container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'fav-actions';

        // Add to cart button
        const addCartBtn = document.createElement('button');
        addCartBtn.className = 'login-btn';
        addCartBtn.innerText = 'Kosárba';

        addCartBtn.addEventListener('click', async () => {
            await addToCartFromFavorite(item);
        });

        // Remove from favorites button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'fav-remove';
        removeBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';

        removeBtn.addEventListener('click', () => {
            removeFavoriteById(item.id);
            renderFavorites();
        });

        actionsContainer.appendChild(addCartBtn);
        actionsContainer.appendChild(removeBtn);

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(actionsContainer);

        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Auth state listener
    onAuthStateChanged(auth, async (user) => {
        // Clear local cart on state change to prevent cross-user data leakage
        localStorage.removeItem("cart");

        if (user) {
            currentUserId = user.uid;
            await syncFavoritesFromFirestore();
            await syncCartFromFirestore();
        } else {
            currentUserId = null;
            updateCartCount();
        }

        renderFavorites();
    });
});
