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
        const removedItem = favs[idx].title;
        favs.splice(idx, 1);
        saveFavorites(favs);
        console.log("✅ Removed from favorites:", removedItem);
        saveFavoritesToCloud();
    } else {
        console.warn("❌ Favorite not found:", id);
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
    console.log("✅ Added to cart from favorites:", product.title);

    // Update cart count
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.innerText = cart.length;
    }

    // Save to cloud if logged in
    if (currentUserId) {
        await saveCartToCloud();
    } else {
        console.warn("❌ Item added to cart but not logged in - not syncing to cloud");
    }

    await forgeXModal('Kosárba téve', `${product.title} bekerült a kosárba!`);
}

async function saveFavoritesToCloud() {
    if (!currentUserId) {
        console.warn("❌ Cannot save favorites - user not logged in");
        return;
    }

    const localFavorites = getFavorites();
    try {
        await setDoc(doc(db, "favorites", currentUserId), {
            items: localFavorites,
            updatedAt: new Date()
        });
        console.log("✅ Favorites saved to Firebase:", localFavorites.length, "items");
    } catch (error) {
        console.error("❌ Error saving favorites to cloud:", error);
    }
}

async function saveCartToCloud() {
    if (!currentUserId) {
        console.warn("❌ Cannot save cart - user not logged in");
        return;
    }

    const localCart = getCart();
    try {
        await setDoc(doc(db, "carts", currentUserId), {
            items: localCart,
            updatedAt: new Date()
        });
        console.log("✅ Cart saved to Firebase:", localCart.length, "items");
    } catch (error) {
        console.error("❌ Error saving cart to cloud:", error);
    }
}

async function syncFavoritesFromFirestore() {
    if (!currentUserId) return;

    try {
        const favSnap = await getDoc(doc(db, "favorites", currentUserId));
        if (favSnap.exists()) {
            const cloudFavorites = favSnap.data().items || [];
            localStorage.setItem('favorites', JSON.stringify(cloudFavorites));
            console.log("✅ Favorites loaded from Firebase:", cloudFavorites.length, "items");
        } else {
            // No favorites exist yet for this user - keep local
            const localFavCount = (JSON.parse(localStorage.getItem("favorites")) || []).length;
            console.log("ℹ️ No cloud favorites found. Using local favorites:", localFavCount, "items");
        }
    } catch (error) {
        console.error("❌ Error loading favorites from cloud:", error);
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
            console.log("✅ Cart loaded from Firebase:", cloudCart.length, "items");
        } else {
            // No cart exists yet - keep local items
            const localCartCount = (JSON.parse(localStorage.getItem("cart")) || []).length;
            console.log("ℹ️ No cloud cart found. Using local cart:", localCartCount, "items");
        }
    } catch (error) {
        console.error("❌ Error loading cart from cloud:", error);
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
    console.log("🌈 Rendering favorites:", favs.length, "items");

    if (!favs.length) {
        noFavs.style.display = 'block';
        console.log("💭 No favorites to display");
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
        if (user) {
            currentUserId = user.uid;
            // Sync from Firebase - don't clear local storage on page load
            // This preserves user's local additions until they log out
            await syncFavoritesFromFirestore();
            await syncCartFromFirestore();
            console.log("✅ Favorites page - User logged in:", currentUserId);
        } else {
            // Only clear on logout
            currentUserId = null;
            localStorage.removeItem("cart");
            localStorage.removeItem("favorites");
            updateCartCount();
            console.log("🚪 Favorites page - User logged out");
        }

        renderFavorites();
    });
});
