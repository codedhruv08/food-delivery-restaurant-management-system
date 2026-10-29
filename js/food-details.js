/**
 * FOOD-DETAILS.JS — Dish Details, Interactive Customizers, Quantity Stepper, and Live Reviews
 */

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const dishId = urlParams.get("id") || "paneer-tikka";

    const dish = window.Store ? window.Store.getFoodItem(dishId) : null;
    if (!dish) return;

    // 1. Populate Main Food Info
    const imgEl = document.querySelector(".food-details-img");
    if (imgEl) {
        imgEl.src = dish.image;
        imgEl.alt = dish.name;
    }

    const titleEl = document.querySelector(".food-info h1");
    if (titleEl) titleEl.textContent = dish.name;

    const restLink = document.querySelector(".food-meta a");
    if (restLink) {
        restLink.textContent = dish.restaurantName;
        restLink.href = `restaurant-details.html?id=${dish.restaurantId || ''}`;
    }

    const descEl = document.querySelector(".food-description");
    if (descEl) descEl.textContent = dish.description;

    const priceEl = document.querySelector(".food-price-lg");
    if (priceEl) priceEl.textContent = `₹${dish.price}`;

    // Ingredients List
    const ingredientsUl = document.querySelector(".ingredients-list ul");
    if (ingredientsUl && dish.ingredients) {
        ingredientsUl.innerHTML = dish.ingredients.map(ing => `<li>${ing}</li>`).join("");
    }

    // Nutrition Table
    if (dish.nutrition) {
        const tbody = document.querySelector(".nutrition-table tbody");
        if (tbody) {
            tbody.innerHTML = `
                <tr><td>Calories</td><td>${dish.nutrition.calories || 'N/A'}</td></tr>
                <tr><td>Protein</td><td>${dish.nutrition.protein || 'N/A'}</td></tr>
                <tr><td>Carbohydrates</td><td>${dish.nutrition.carbs || 'N/A'}</td></tr>
                <tr><td>Fat</td><td>${dish.nutrition.fat || 'N/A'}</td></tr>
            `;
        }
    }

    // 2. Add-ons / Customization Modifiers
    const qtyRow = document.querySelector(".quantity-row");
    let selectedAddons = [];
    let spiceLevel = "Medium";

    if (qtyRow) {
        const customizerBox = document.createElement("div");
        customizerBox.className = "card mb-3";
        customizerBox.style.padding = "14px 18px";
        customizerBox.style.background = "var(--background)";
        customizerBox.innerHTML = `
            <h4 style="font-size: 0.9375rem; margin-bottom: 10px;">Customize Your Dish</h4>
            <div style="margin-bottom: 12px;">
                <label style="font-size: 0.8125rem; font-weight: 600; color: var(--muted); display: block; margin-bottom: 4px;">Spice Level:</label>
                <div style="display: flex; gap: 12px;">
                    <label style="display: flex; align-items: center; gap: 4px; font-size: 0.875rem; cursor: pointer;">
                        <input type="radio" name="spice" value="Mild"> Mild
                    </label>
                    <label style="display: flex; align-items: center; gap: 4px; font-size: 0.875rem; cursor: pointer;">
                        <input type="radio" name="spice" value="Medium" checked> Medium 🌶️
                    </label>
                    <label style="display: flex; align-items: center; gap: 4px; font-size: 0.875rem; cursor: pointer;">
                        <input type="radio" name="spice" value="Extra Spicy"> Extra Spicy 🌶️🌶️
                    </label>
                </div>
            </div>
            <div>
                <label style="font-size: 0.8125rem; font-weight: 600; color: var(--muted); display: block; margin-bottom: 4px;">Add-ons:</label>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; cursor: pointer;">
                        <span><input type="checkbox" class="addon-check" data-name="Extra Cheese" data-price="40"> Extra Cheese</span>
                        <strong style="color: var(--primary);">+₹40</strong>
                    </label>
                    <label style="display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; cursor: pointer;">
                        <span><input type="checkbox" class="addon-check" data-name="Special Mint Dip" data-price="25"> Special Mint Dip</span>
                        <strong style="color: var(--primary);">+₹25</strong>
                    </label>
                </div>
            </div>
        `;

        qtyRow.parentNode.insertBefore(customizerBox, qtyRow);

        customizerBox.querySelectorAll("input[name='spice']").forEach(radio => {
            radio.addEventListener("change", (e) => {
                spiceLevel = e.target.value;
            });
        });

        customizerBox.querySelectorAll(".addon-check").forEach(chk => {
            chk.addEventListener("change", () => {
                selectedAddons = [];
                let addonTotal = 0;
                customizerBox.querySelectorAll(".addon-check:checked").forEach(c => {
                    const name = c.getAttribute("data-name");
                    const price = parseInt(c.getAttribute("data-price"), 10);
                    selectedAddons.push({ name, price });
                    addonTotal += price;
                });
                updatePriceDisplay(addonTotal);
            });
        });
    }

    const qtySelect = document.getElementById("quantity");

    function updatePriceDisplay(extra = 0) {
        const qty = qtySelect ? parseInt(qtySelect.value, 10) : 1;
        const total = (dish.price + extra) * qty;
        if (priceEl) priceEl.textContent = `₹${total}`;
    }

    if (qtySelect) {
        qtySelect.addEventListener("change", () => updatePriceDisplay());
    }

    // 3. Add to Cart Button
    const addBtn = document.querySelector(".food-info .btn-primary");
    if (addBtn) {
        addBtn.removeAttribute("href");
        addBtn.setAttribute("type", "button");
        addBtn.style.cursor = "pointer";

        addBtn.addEventListener("click", () => {
            const qty = qtySelect ? parseInt(qtySelect.value, 10) : 1;
            const extraPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);

            const customizedItem = {
                ...dish,
                price: dish.price + extraPrice,
                name: selectedAddons.length > 0 ? `${dish.name} (Customized)` : dish.name
            };

            window.Store.addToCart(customizedItem, qty, {
                spiceLevel,
                addons: selectedAddons.map(a => a.name)
            });

            BiteBuddy.toast("Added to Cart!", `${qty} × ${dish.name} added to your cart.`, "success");

            // Temporary button animation feedback
            const originalText = addBtn.innerHTML;
            addBtn.innerHTML = "✓ Added to Cart!";
            addBtn.style.background = "var(--success)";
            setTimeout(() => {
                addBtn.innerHTML = originalText;
                addBtn.style.background = "";
            }, 1500);
        });
    }

    // 4. Interactive Reviews Section
    const reviewsCard = document.querySelector(".reviews-section, .nutrition-table")?.closest(".card")?.parentNode;
    if (reviewsCard) {
        const reviewsBox = document.createElement("div");
        reviewsBox.className = "card mt-4";
        reviewsBox.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0;">Customer Reviews (3)</h3>
                <span class="rating" style="color: var(--warning); font-weight: 700;">★ 4.6 / 5.0</span>
            </div>
            
            <div id="reviewsList" style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
                <div style="padding-bottom: 12px; border-bottom: 1px solid var(--border);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <strong>Aarav Mehta</strong>
                        <span style="color: var(--warning);">★★★★★</span>
                    </div>
                    <p style="font-size: 0.875rem; color: var(--text); margin: 0;">Incredible taste! Delivered piping hot and the packaging was top notch.</p>
                    <span style="font-size: 0.75rem; color: var(--muted);">2 days ago • Verified Purchase</span>
                </div>
                <div style="padding-bottom: 12px; border-bottom: 1px solid var(--border);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <strong>Pooja Singhania</strong>
                        <span style="color: var(--warning);">★★★★☆</span>
                    </div>
                    <p style="font-size: 0.875rem; color: var(--text); margin: 0;">Very flavorful and authentic spices. Highly recommend ordering with extra dip!</p>
                    <span style="font-size: 0.75rem; color: var(--muted);">1 week ago • Verified Purchase</span>
                </div>
            </div>

            <!-- Add Review Form -->
            <form id="addReviewForm" style="background: var(--background); padding: 16px; border-radius: var(--radius);">
                <h4 style="font-size: 0.9375rem; margin-bottom: 8px;">Leave a Review</h4>
                <div style="display: flex; gap: 12px; margin-bottom: 10px;">
                    <div style="flex: 1;">
                        <input type="text" id="reviewerName" placeholder="Your Name" required style="width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.875rem;">
                    </div>
                    <div style="width: 140px;">
                        <select id="reviewRating" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.875rem; background: var(--white);">
                            <option value="5">★★★★★ (5)</option>
                            <option value="4">★★★★☆ (4)</option>
                            <option value="3">★★★☆☆ (3)</option>
                            <option value="2">★★☆☆☆ (2)</option>
                            <option value="1">★☆☆☆☆ (1)</option>
                        </select>
                    </div>
                </div>
                <div style="margin-bottom: 10px;">
                    <textarea id="reviewComment" rows="2" placeholder="Write your review here..." required style="width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.875rem;"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-sm">Submit Review</button>
            </form>
        `;

        reviewsCard.appendChild(reviewsBox);

        const form = document.getElementById("addReviewForm");
        const list = document.getElementById("reviewsList");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("reviewerName").value.trim();
            const rating = parseInt(document.getElementById("reviewRating").value, 10);
            const comment = document.getElementById("reviewComment").value.trim();
            const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

            const newReview = document.createElement("div");
            newReview.style.paddingBottom = "12px";
            newReview.style.borderBottom = "1px solid var(--border)";
            newReview.style.animation = "fadeInDown 0.3s ease";
            newReview.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <strong>${name}</strong>
                    <span style="color: var(--warning);">${stars}</span>
                </div>
                <p style="font-size: 0.875rem; color: var(--text); margin: 0;">${comment}</p>
                <span style="font-size: 0.75rem; color: var(--muted);">Just now • Verified Purchase</span>
            `;

            list.insertBefore(newReview, list.firstChild);
            form.reset();
            BiteBuddy.toast("Review Submitted!", "Thank you for sharing your feedback.", "success");
        });
    }
});
