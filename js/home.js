/**
 * HOME.JS — Interactive Homepage Controller
 * Manages Popular Food Add to Cart, Dynamic Badges, and Query Routing
 */

document.addEventListener("DOMContentLoaded", function () {
    const popularFoodGrid = document.querySelector(".section:has(.grid-4) .grid-4") || document.querySelectorAll(".grid-4")[0];
    const popularRestGrid = document.querySelector(".section:has(.grid-3) .grid-3") || document.querySelectorAll(".grid-3")[0];

    // 1. Wire up Food Cards
    if (popularFoodGrid) {
        const foodCards = popularFoodGrid.querySelectorAll(".food-card");
        
        // Map food items by title
        foodCards.forEach(card => {
            const title = card.querySelector("h3")?.textContent.trim();
            const food = (window.Store ? window.Store.getFoodItems() : []).find(f => f.name.toLowerCase() === title?.toLowerCase()) ||
                         (window.Store ? window.Store.getFoodItems() : []).find(f => title?.toLowerCase().includes(f.name.toLowerCase()));

            if (food) {
                // Update View button link
                const viewBtn = card.querySelector("a[href*='food-details.html']");
                if (viewBtn) viewBtn.href = `food-details.html?id=${food.id}`;

                // Update Add to Cart button
                const addBtn = card.querySelector("a[href*='cart.html'], .btn-primary");
                if (addBtn) {
                    addBtn.setAttribute("data-id", food.id);
                    addBtn.classList.add("btn-home-add");
                }
            }
        });

        function refreshHomeFoodButtons() {
            const cart = window.Store ? window.Store.getCart() : [];
            foodCards.forEach(card => {
                const addBtn = card.querySelector(".btn-home-add");
                if (!addBtn) return;
                const id = addBtn.getAttribute("data-id");
                const inCart = cart.find(c => c.id === id);

                let actionsDiv = card.querySelector(".card-actions");
                if (!actionsDiv) return;

                if (inCart) {
                    let ctrl = actionsDiv.querySelector(".in-cart-ctrl");
                    if (!ctrl) {
                        ctrl = document.createElement("div");
                        ctrl.className = "in-cart-ctrl";
                        addBtn.style.display = "none";
                        actionsDiv.appendChild(ctrl);
                    }
                    ctrl.innerHTML = `
                        <button type="button" class="home-dec" data-id="${id}">&minus;</button>
                        <span>${inCart.quantity} in cart</span>
                        <button type="button" class="home-inc" data-id="${id}">&plus;</button>
                    `;

                    ctrl.querySelector(".home-inc").onclick = (e) => {
                        e.preventDefault();
                        window.Store.updateCartQty(id, inCart.quantity + 1);
                    };
                    ctrl.querySelector(".home-dec").onclick = (e) => {
                        e.preventDefault();
                        window.Store.updateCartQty(id, inCart.quantity - 1);
                    };
                } else {
                    const ctrl = actionsDiv.querySelector(".in-cart-ctrl");
                    if (ctrl) ctrl.remove();
                    addBtn.style.display = "inline-flex";
                    addBtn.innerHTML = "Add to Cart";
                }
            });
        }

        refreshHomeFoodButtons();

        popularFoodGrid.addEventListener("click", (e) => {
            const addBtn = e.target.closest(".btn-home-add");
            if (addBtn) {
                e.preventDefault();
                const id = addBtn.getAttribute("data-id");
                const food = window.Store.getFoodItem(id);
                if (food) {
                    window.Store.addToCart(food, 1);
                    BiteBuddy.toast("Added to Cart!", `${food.name} has been added.`, "success");
                }
            }
        });

        if (window.Store) {
            window.Store.on("cart:updated", refreshHomeFoodButtons);
        }
    }

    // 2. Wire up Restaurant Cards on Home
    if (popularRestGrid) {
        const restCards = popularRestGrid.querySelectorAll(".restaurant-card");
        restCards.forEach(card => {
            const name = card.querySelector("h3")?.textContent.trim();
            const rest = (window.Store ? window.Store.getRestaurants() : []).find(r => r.name.toLowerCase() === name?.toLowerCase());
            if (rest) {
                const btn = card.querySelector("a[href*='restaurant-details.html']");
                if (btn) btn.href = `restaurant-details.html?id=${rest.id}`;
            }
        });
    }
});
