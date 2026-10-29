/**
 * RESTAURANTS.JS — Dynamic Restaurant Directory & Filtering Engine
 */

document.addEventListener("DOMContentLoaded", function () {
    const gridContainer = document.querySelector(".content-with-sidebar > div .grid-3, .content-with-sidebar > div");
    const sidebar = document.querySelector(".filter-sidebar");
    if (!gridContainer || !sidebar) return;

    // Ensure the inner grid exists
    let cardsGrid = gridContainer.querySelector(".grid-3");
    if (!cardsGrid) {
        cardsGrid = document.createElement("div");
        cardsGrid.className = "grid-3";
        cardsGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
        gridContainer.appendChild(cardsGrid);
    }

    // Add search bar and sort controls header above the grid
    const topBar = document.createElement("div");
    topBar.className = "card mb-3";
    topBar.style.padding = "14px 18px";
    topBar.innerHTML = `
        <div style="display: flex; gap: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 220px;">
                <input type="text" id="restaurantSearchInput" placeholder="🔍 Search restaurants or cuisines..." style="width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.875rem;">
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <label for="restaurantSortSelect" style="font-size: 0.8125rem; font-weight: 600; color: var(--muted); margin: 0;">Sort By:</label>
                <select id="restaurantSortSelect" style="padding: 7px 10px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.875rem; background: var(--white);">
                    <option value="rating">Rating: High to Low</option>
                    <option value="delivery">Delivery Time: Fastest</option>
                    <option value="name">Restaurant Name (A–Z)</option>
                </select>
            </div>
        </div>
        <div id="restaurantCountMeta" style="margin-top: 8px; font-size: 0.8125rem; color: var(--muted); display: flex; justify-content: space-between;">
            <span>Showing restaurants</span>
            <button id="resetRestaurantFilters" style="background: none; border: none; color: var(--primary); font-size: 0.8125rem; font-weight: 600; cursor: pointer; display: none;">Reset Filters</button>
        </div>
    `;

    cardsGrid.parentNode.insertBefore(topBar, cardsGrid);

    // Filter elements
    const searchInput = document.getElementById("restaurantSearchInput");
    const sortSelect = document.getElementById("restaurantSortSelect");
    const resetBtn = document.getElementById("resetRestaurantFilters");

    const cuisineCheckboxes = sidebar.querySelectorAll("input[type='checkbox']");
    const ratingSelect = sidebar.querySelector(".filter-group:nth-of-type(2) select") || sidebar.querySelectorAll("select")[0];
    const deliverySelect = sidebar.querySelector(".filter-group:nth-of-type(3) select") || sidebar.querySelectorAll("select")[1];
    const priceSelect = sidebar.querySelector(".filter-group:nth-of-type(4) select") || sidebar.querySelectorAll("select")[2];
    const applyBtn = sidebar.querySelector(".btn-primary");

    // Read URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("search")) {
        searchInput.value = urlParams.get("search");
    }

    function getSelectedCuisines() {
        const selected = [];
        cuisineCheckboxes.forEach(cb => {
            if (cb.checked) {
                const label = sidebar.querySelector(`label[for="${cb.id}"]`);
                if (label) selected.push(label.textContent.trim().toLowerCase());
            }
        });
        return selected;
    }

    function renderRestaurants() {
        const all = window.Store ? window.Store.getRestaurants() : [];
        const query = searchInput.value.trim().toLowerCase();
        const selectedCuisines = getSelectedCuisines();
        const minRating = ratingSelect && ratingSelect.value ? parseFloat(ratingSelect.value) : 0;
        const maxDelivery = deliverySelect && deliverySelect.value ? parseInt(deliverySelect.value, 10) : 0;
        const priceTier = priceSelect ? priceSelect.value : "";
        const sortBy = sortSelect ? sortSelect.value : "rating";

        let filtered = all.filter(r => {
            // Search
            if (query) {
                const name = r.name.toLowerCase();
                const cuisines = (r.cuisines || []).join(" ").toLowerCase();
                if (!name.includes(query) && !cuisines.includes(query)) return false;
            }

            // Cuisines checkbox
            if (selectedCuisines.length > 0) {
                const restaurantCuisines = (r.cuisines || []).map(c => c.toLowerCase());
                const matches = selectedCuisines.some(sc => restaurantCuisines.some(rc => rc.includes(sc) || sc.includes(rc)));
                if (!matches) return false;
            }

            // Rating
            if (minRating > 0 && (r.rating || 0) < minRating) return false;

            // Delivery time
            if (maxDelivery > 0 && (r.deliveryMinutes || 35) > maxDelivery) return false;

            // Price range
            if (priceTier === "low" && r.costForTwo > 350) return false;
            if (priceTier === "mid" && (r.costForTwo < 350 || r.costForTwo > 550)) return false;
            if (priceTier === "high" && r.costForTwo <= 550) return false;

            return true;
        });

        // Sorting
        filtered.sort((a, b) => {
            if (sortBy === "delivery") return (a.deliveryMinutes || 35) - (b.deliveryMinutes || 35);
            if (sortBy === "name") return a.name.localeCompare(b.name);
            return (b.rating || 0) - (a.rating || 0); // rating desc
        });

        // Update Meta Count
        const countMeta = document.getElementById("restaurantCountMeta");
        if (countMeta) {
            countMeta.querySelector("span").textContent = `Showing ${filtered.length} of ${all.length} restaurants`;
            const hasActiveFilter = query || selectedCuisines.length > 0 || minRating > 0 || maxDelivery > 0 || priceTier;
            resetBtn.style.display = hasActiveFilter ? "inline" : "none";
        }

        // Render Cards
        if (filtered.length === 0) {
            cardsGrid.innerHTML = `
                <div style="grid-column: 1 / -1;">
                    <div class="empty-state-box">
                        <span class="empty-state-icon">🏪</span>
                        <h3 class="empty-state-title">No Restaurants Found</h3>
                        <p class="empty-state-desc">No restaurants match your selected filter criteria. Try adjusting your filters or search terms.</p>
                        <button class="btn btn-secondary btn-sm" id="emptyResetBtn">Clear Filters</button>
                    </div>
                </div>
            `;
            const emptyResetBtn = document.getElementById("emptyResetBtn");
            if (emptyResetBtn) emptyResetBtn.addEventListener("click", resetAllFilters);
            return;
        }

        let html = "";
        filtered.forEach(r => {
            html += `
                <article class="restaurant-card" data-id="${r.id}">
                    <div class="card-img" style="position: relative;">
                        <img src="${r.image}" alt="${r.name}" onerror="this.src='images/restaurants/spice-route.jpg'">
                        <span style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.7); color: white; padding: 2px 8px; border-radius: var(--radius-sm); font-size: 0.75rem;">
                            ₹${r.costForTwo || 400} for two
                        </span>
                    </div>
                    <div class="card-body">
                        <h3>${r.name}</h3>
                        <div class="card-meta">
                            <span>${(r.cuisines || []).join(", ")}</span>
                            <span class="rating">★ ${r.rating} (${r.reviewsCount || 100})</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <span>🕐 ${r.deliveryTime || '30-40 min'}</span>
                        <a href="restaurant-details.html?id=${r.id}" class="btn btn-primary btn-sm">
                            View Menu →
                        </a>
                    </div>
                </article>
            `;
        });

        cardsGrid.innerHTML = html;
    }

    function resetAllFilters() {
        searchInput.value = "";
        cuisineCheckboxes.forEach(cb => cb.checked = false);
        if (ratingSelect) ratingSelect.value = "";
        if (deliverySelect) deliverySelect.value = "";
        if (priceSelect) priceSelect.value = "";
        if (sortSelect) sortSelect.value = "rating";
        renderRestaurants();
    }

    // Event Listeners
    searchInput.addEventListener("input", renderRestaurants);
    if (sortSelect) sortSelect.addEventListener("change", renderRestaurants);
    if (ratingSelect) ratingSelect.addEventListener("change", renderRestaurants);
    if (deliverySelect) deliverySelect.addEventListener("change", renderRestaurants);
    if (priceSelect) priceSelect.addEventListener("change", renderRestaurants);
    cuisineCheckboxes.forEach(cb => cb.addEventListener("change", renderRestaurants));

    if (applyBtn) {
        applyBtn.addEventListener("click", (e) => {
            e.preventDefault();
            renderRestaurants();
            BiteBuddy.toast("Filters Applied", "Restaurant list has been refreshed.", "info");
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", resetAllFilters);
    }

    renderRestaurants();
});
