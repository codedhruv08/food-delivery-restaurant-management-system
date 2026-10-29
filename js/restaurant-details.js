/**
 * RESTAURANT-DETAILS.JS — Dynamic Restaurant Profile & Menu Tabs
 */

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get("id") || "spice-route";

    const restaurant = window.Store ? window.Store.getRestaurant(restaurantId) : null;
    if (!restaurant) return;

    // 1. Update Restaurant Header Info
    const bannerImg = document.querySelector(".restaurant-banner img, .restaurant-header img");
    if (bannerImg) bannerImg.src = restaurant.image;

    const titleEl = document.querySelector(".restaurant-info h1, .restaurant-details h1");
    if (titleEl) titleEl.textContent = restaurant.name;

    const metaDiv = document.querySelector(".restaurant-info .meta, .restaurant-details .meta");
    if (metaDiv) {
        metaDiv.innerHTML = `
            <span class="rating" style="color: var(--warning); font-weight: 700;">★ ${restaurant.rating} (${restaurant.reviewsCount || 100} reviews)</span>
            <span>|</span>
            <span>${(restaurant.cuisines || []).join(", ")}</span>
            <span>|</span>
            <span>📍 ${restaurant.address}</span>
            <span>|</span>
            <span>🕐 ${restaurant.deliveryTime}</span>
            <span>|</span>
            <span>Min order: ₹${restaurant.minOrder}</span>
        `;
    }

    const descEl = document.querySelector(".restaurant-info .description, .restaurant-details .description");
    if (descEl) descEl.textContent = restaurant.description;

    // 2. Fetch Restaurant Dishes
    const allDishes = window.Store ? window.Store.getFoodItems() : [];
    // If dishes exist specifically for this restaurant, filter them; else show dishes with fallback
    let restaurantDishes = allDishes.filter(d => d.restaurantId === restaurant.id || d.restaurantName === restaurant.name);
    if (restaurantDishes.length === 0) {
        // Fallback: assign sample dishes to this restaurant for demonstration
        restaurantDishes = allDishes.slice(0, 6);
    }

    // 3. Render Category Tabs & Dishes
    const categoryNav = document.querySelector(".category-nav");
    const menuSection = document.querySelector("#starters")?.parentNode || document.querySelector(".section:nth-of-type(2) .container");

    if (categoryNav && menuSection) {
        // Extract unique categories
        const categories = ["All", ...new Set(restaurantDishes.map(d => d.category || "Main Course"))];
        categoryNav.innerHTML = categories.map((cat, idx) => `
            <a href="#${cat.toLowerCase().replace(/\s+/g, '-')}" class="${idx === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</a>
        `).join("");

        const gridWrapper = document.createElement("div");
        gridWrapper.className = "grid-3 mt-3";
        gridWrapper.id = "restaurantDishesGrid";

        // Remove old hardcoded static sections
        const oldSections = menuSection.querySelectorAll("section[id], .grid-3");
        oldSections.forEach(el => el.remove());

        menuSection.appendChild(gridWrapper);

        let activeCat = "All";

        categoryNav.querySelectorAll("a").forEach(tab => {
            tab.addEventListener("click", (e) => {
                e.preventDefault();
                categoryNav.querySelectorAll("a").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                activeCat = tab.getAttribute("data-cat");
                renderDishes();
            });
        });

        function renderDishes() {
            const cart = window.Store ? window.Store.getCart() : [];
            const filtered = activeCat === "All" ? restaurantDishes : restaurantDishes.filter(d => d.category === activeCat);

            if (filtered.length === 0) {
                gridWrapper.innerHTML = `
                    <div style="grid-column: 1 / -1;" class="empty-state-box">
                        <span class="empty-state-icon">🍽️</span>
                        <h3>No dishes under ${activeCat}</h3>
                        <p class="text-muted">Check other categories above.</p>
                    </div>
                `;
                return;
            }

            gridWrapper.innerHTML = filtered.map(dish => {
                const inCart = cart.find(c => c.id === dish.id);
                const inCartQty = inCart ? inCart.quantity : 0;

                return `
                    <article class="food-card" data-id="${dish.id}">
                        <div class="card-img" style="position: relative;">
                            <img src="${dish.image}" alt="${dish.name}" onerror="this.src='images/food/classic-burger.jpg'">
                            <span style="position: absolute; top: 10px; left: 10px;" class="diet-badge ${dish.isVeg ? 'diet-veg' : 'diet-nonveg'}">
                                ${dish.isVeg ? '🌱 Veg' : '🍗 Non-Veg'}
                            </span>
                        </div>
                        <div class="card-body">
                            <h3>${dish.name}</h3>
                            <p class="food-restaurant">${restaurant.name}</p>
                            <p class="food-price">₹${dish.price}</p>
                            <p class="food-rating">★ ${dish.rating} <span class="text-muted">(${dish.reviewsCount})</span></p>
                            <p class="text-muted" style="font-size: 0.8125rem; margin-top: 6px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${dish.description || ''}
                            </p>
                        </div>
                        <div class="card-actions">
                            <a href="food-details.html?id=${dish.id}" class="btn btn-secondary btn-sm">Details</a>
                            ${inCartQty > 0 ? `
                                <div class="in-cart-ctrl">
                                    <button type="button" class="btn-rest-dec" data-id="${dish.id}">&minus;</button>
                                    <span>${inCartQty} in cart</span>
                                    <button type="button" class="btn-rest-inc" data-id="${dish.id}">&plus;</button>
                                </div>
                            ` : `
                                <button type="button" class="btn btn-primary btn-sm btn-rest-add" data-id="${dish.id}">
                                    🛒 Add to Cart
                                </button>
                            `}
                        </div>
                    </article>
                `;
            }).join("");

            // Attach events
            gridWrapper.querySelectorAll(".btn-rest-add").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    const item = window.Store.getFoodItem(id);
                    if (item) {
                        window.Store.addToCart(item, 1);
                        BiteBuddy.toast("Added to Cart!", `${item.name} has been added.`, "success");
                    }
                });
            });

            gridWrapper.querySelectorAll(".btn-rest-inc").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    const item = window.Store.getCartItem(id);
                    if (item) window.Store.updateCartQty(id, item.quantity + 1);
                });
            });

            gridWrapper.querySelectorAll(".btn-rest-dec").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    const item = window.Store.getCartItem(id);
                    if (item) window.Store.updateCartQty(id, item.quantity - 1);
                });
            });
        }

        renderDishes();

        // Listen for store cart changes
        if (window.Store) {
            window.Store.on("cart:updated", renderDishes);
        }
    }
});
