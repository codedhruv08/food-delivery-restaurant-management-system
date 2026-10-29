/**
 * MENU.JS — Interactive Food Menu with Category Filters, Search, Diet Toggle, and Live Cart Controls
 */

document.addEventListener("DOMContentLoaded", function () {
    const gridContainer = document.querySelector(".grid-4");
    const categoryNav = document.querySelector(".category-nav");
    if (!gridContainer || !categoryNav) return;

    // Insert Filter Bar above grid
    const filterBar = document.createElement("div");
    filterBar.className = "card mb-4";
    filterBar.style.padding = "16px 20px";
    filterBar.innerHTML = `
        <div style="display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <!-- Live Search -->
            <div style="flex: 1; min-width: 240px; position: relative;">
                <input type="text" id="menuSearchInput" placeholder="🔍 Search menu by dish or ingredient..." style="width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.9375rem;">
            </div>

            <!-- Veg Only Toggle -->
            <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; font-size: 0.875rem; font-weight: 600;">
                <input type="checkbox" id="vegOnlyToggle" style="width: 18px; height: 18px; accent-color: var(--success); cursor: pointer;">
                <span class="diet-badge diet-veg">🌱 Veg Only</span>
            </label>

            <!-- Price & Sorting Dropdown -->
            <div style="display: flex; gap: 12px; align-items: center;">
                <select id="priceFilterSelect" style="padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.875rem; background: var(--white);">
                    <option value="all">All Prices</option>
                    <option value="under150">Under ₹150</option>
                    <option value="150to250">₹150 – ₹250</option>
                    <option value="above250">Above ₹250</option>
                </select>

                <select id="sortSelect" style="padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.875rem; background: var(--white);">
                    <option value="rating">Top Rated ★</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                </select>
            </div>
        </div>
        <div id="filterResultMeta" style="margin-top: 10px; font-size: 0.8125rem; color: var(--muted); display: flex; justify-content: space-between;">
            <span>Showing all items</span>
            <button id="resetFiltersBtn" style="background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.8125rem; font-weight: 600; display: none;">Reset Filters</button>
        </div>
    `;

    categoryNav.parentNode.insertBefore(filterBar, gridContainer);

    let activeCategory = "All";
    let searchQuery = "";
    let vegOnly = false;
    let priceFilter = "all";
    let sortBy = "rating";

    // Read URL params if any
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("category")) activeCategory = urlParams.get("category");
    if (urlParams.get("search")) searchQuery = urlParams.get("search");

    // Init category links
    const categoryLinks = categoryNav.querySelectorAll("a");
    categoryLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            categoryLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            activeCategory = link.textContent.trim();
            renderFilteredMenu();
        });
    });

    // Search input
    const searchInput = document.getElementById("menuSearchInput");
    if (searchQuery) searchInput.value = searchQuery;
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderFilteredMenu();
    });

    // Veg Only toggle
    document.getElementById("vegOnlyToggle").addEventListener("change", (e) => {
        vegOnly = e.target.checked;
        renderFilteredMenu();
    });

    // Price select
    document.getElementById("priceFilterSelect").addEventListener("change", (e) => {
        priceFilter = e.target.value;
        renderFilteredMenu();
    });

    // Sort select
    document.getElementById("sortSelect").addEventListener("change", (e) => {
        sortBy = e.target.value;
        renderFilteredMenu();
    });

    // Reset button
    const resetBtn = document.getElementById("resetFiltersBtn");
    resetBtn.addEventListener("click", () => {
        activeCategory = "All";
        searchQuery = "";
        vegOnly = false;
        priceFilter = "all";
        sortBy = "rating";

        searchInput.value = "";
        document.getElementById("vegOnlyToggle").checked = false;
        document.getElementById("priceFilterSelect").value = "all";
        document.getElementById("sortSelect").value = "rating";

        categoryLinks.forEach(l => {
            if (l.textContent.trim() === "All") l.classList.add("active");
            else l.classList.remove("active");
        });

        renderFilteredMenu();
    });

    // Listen to cart updates to refresh in-card buttons
    if (window.Store) {
        window.Store.on("cart:updated", renderFilteredMenu);
    }

    renderFilteredMenu();

    function renderFilteredMenu() {
        const allItems = window.Store ? window.Store.getFoodItems() : [];
        const cart = window.Store ? window.Store.getCart() : [];

        let filtered = allItems.filter(item => {
            // Category filter
            if (activeCategory !== "All") {
                const itemCat = (item.category || "").toLowerCase();
                const activeCatLower = activeCategory.toLowerCase();
                const matchesCat = itemCat.includes(activeCatLower) || activeCatLower.includes(itemCat);
                if (!matchesCat) return false;
            }

            // Search filter
            if (searchQuery) {
                const name = item.name.toLowerCase();
                const desc = (item.description || "").toLowerCase();
                const ingr = (item.ingredients || []).join(" ").toLowerCase();
                const rest = (item.restaurantName || "").toLowerCase();
                if (!name.includes(searchQuery) && !desc.includes(searchQuery) && !ingr.includes(searchQuery) && !rest.includes(searchQuery)) {
                    return false;
                }
            }

            // Veg only
            if (vegOnly && !item.isVeg) return false;

            // Price filter
            if (priceFilter === "under150" && item.price >= 150) return false;
            if (priceFilter === "150to250" && (item.price < 150 || item.price > 250)) return false;
            if (priceFilter === "above250" && item.price <= 250) return false;

            return true;
        });

        // Sorting
        filtered.sort((a, b) => {
            if (sortBy === "price-asc") return a.price - b.price;
            if (sortBy === "price-desc") return b.price - a.price;
            if (sortBy === "name") return a.name.localeCompare(b.name);
            return (b.rating || 0) - (a.rating || 0); // default rating
        });

        // Update meta
        const metaEl = document.getElementById("filterResultMeta");
        if (metaEl) {
            metaEl.querySelector("span").textContent = `Found ${filtered.length} dish${filtered.length === 1 ? '' : 'es'} in ${activeCategory}`;
            resetBtn.style.display = (activeCategory !== "All" || searchQuery || vegOnly || priceFilter !== "all") ? "inline" : "none";
        }

        // Render Cards
        if (filtered.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1;">
                    <div class="empty-state-box">
                        <span class="empty-state-icon">🍽️</span>
                        <h3 class="empty-state-title">No Dishes Found</h3>
                        <p class="empty-state-desc">We couldn't find any dish matching your current filters. Try searching for something else or clearing filters.</p>
                        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('resetFiltersBtn').click()">Clear All Filters</button>
                    </div>
                </div>
            `;
            return;
        }

        let html = "";
        filtered.forEach(item => {
            const inCartItem = cart.find(c => c.id === item.id);
            const inCartQty = inCartItem ? inCartItem.quantity : 0;

            html += `
                <article class="food-card" data-id="${item.id}">
                    <div class="card-img" style="position: relative;">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='images/food/classic-burger.jpg'">
                        <span style="position: absolute; top: 10px; left: 10px;" class="diet-badge ${item.isVeg ? 'diet-veg' : 'diet-nonveg'}">
                            ${item.isVeg ? '🌱 Veg' : '🍗 Non-Veg'}
                        </span>
                    </div>
                    <div class="card-body">
                        <h3>${item.name}</h3>
                        <p class="food-restaurant">
                            <a href="restaurant-details.html?id=${item.restaurantId || ''}" style="color: inherit;">
                                🏪 ${item.restaurantName}
                            </a>
                        </p>
                        <p class="food-price">₹${item.price}</p>
                        <p class="food-rating">★ ${item.rating} <span class="text-muted" style="font-size: 0.75rem;">(${item.reviewsCount})</span></p>
                    </div>
                    <div class="card-actions">
                        <a href="food-details.html?id=${item.id}" class="btn btn-secondary btn-sm">Details</a>
                        ${inCartQty > 0 ? `
                            <div class="in-cart-ctrl">
                                <button type="button" class="btn-card-dec" data-id="${item.id}">&minus;</button>
                                <span>${inCartQty} in cart</span>
                                <button type="button" class="btn-card-inc" data-id="${item.id}">&plus;</button>
                            </div>
                        ` : `
                            <button type="button" class="btn btn-primary btn-sm btn-menu-add" data-id="${item.id}">
                                🛒 Add to Cart
                            </button>
                        `}
                    </div>
                </article>
            `;
        });

        gridContainer.innerHTML = html;

        // Attach action handlers
        gridContainer.querySelectorAll(".btn-menu-add").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const item = window.Store.getFoodItem(id);
                if (item) {
                    window.Store.addToCart(item, 1);
                    BiteBuddy.toast("Added to Cart!", `${item.name} has been added to your cart.`, "success");
                }
            });
        });

        gridContainer.querySelectorAll(".btn-card-inc").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const item = window.Store.getCartItem(id);
                if (item) {
                    window.Store.updateCartQty(id, item.quantity + 1);
                }
            });
        });

        gridContainer.querySelectorAll(".btn-card-dec").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const item = window.Store.getCartItem(id);
                if (item) {
                    window.Store.updateCartQty(id, item.quantity - 1);
                }
            });
        });
    }
});
