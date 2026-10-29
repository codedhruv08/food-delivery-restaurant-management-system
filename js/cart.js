/**
 * CART.JS — Interactive Shopping Cart with DOM Manipulation
 * Handles dynamic rendering, quantity adjustments, item removal, coupons, and calculations
 */

document.addEventListener("DOMContentLoaded", function () {
    const cartContainer = document.querySelector(".checkout-layout > div:first-child");
    const summaryContainer = document.querySelector(".order-summary");

    if (!cartContainer || !summaryContainer) return;

    renderCart();

    // Re-render when cart updates
    if (window.Store) {
        window.Store.on("cart:updated", renderCart);
        window.Store.on("coupon:applied", renderCart);
        window.Store.on("coupon:removed", renderCart);
    }

    function renderCart() {
        const cart = window.Store.getCart();
        const totals = window.Store.getCartTotals();

        // 1. Render Left Column (Cart Items or Empty State)
        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-state-box">
                    <span class="empty-state-icon">🛒</span>
                    <h3 class="empty-state-title">Your Cart is Empty</h3>
                    <p class="empty-state-desc">Looks like you haven't added anything to your cart yet. Explore top dishes from popular restaurants!</p>
                    <a href="food-menu.html" class="btn btn-primary btn-lg">Explore Food Menu</a>
                </div>
            `;
            // Disable or hide checkout button in summary
            renderSummary(totals, false);
            return;
        }

        let itemsHtml = `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                    <h3 style="margin: 0;">Cart Items (${totals.itemCount})</h3>
                    <button type="button" id="clearCartBtn" style="background: none; border: none; color: var(--danger); font-size: 0.8125rem; font-weight: 600; cursor: pointer;">
                        🗑️ Clear Cart
                    </button>
                </div>
                <div class="cart-items-list">
        `;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            itemsHtml += `
                <div class="cart-item" data-id="${item.id}" id="cart-item-${item.id}">
                    <div class="cart-item-img">
                        <img src="${item.image || 'images/food/classic-burger.jpg'}" alt="${item.name}" onerror="this.src='images/food/classic-burger.jpg'">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="cart-item-restaurant">🏪 ${item.restaurant}</p>
                        <p class="cart-item-price">₹${item.price} each</p>
                    </div>
                    <div class="cart-item-qty">
                        <div class="qty-stepper">
                            <button type="button" class="qty-btn btn-dec" data-id="${item.id}" aria-label="Decrease">&minus;</button>
                            <input type="text" class="qty-input" value="${item.quantity}" readonly>
                            <button type="button" class="qty-btn btn-inc" data-id="${item.id}" aria-label="Increase">&plus;</button>
                        </div>
                    </div>
                    <div class="cart-item-total">₹${itemTotal}</div>
                    <button class="cart-item-remove btn-remove-item" type="button" data-id="${item.id}" title="Remove item">
                        ✕ Remove
                    </button>
                </div>
            `;
        });

        itemsHtml += `
                </div>
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <a href="food-menu.html" class="btn btn-secondary btn-sm">← Add More Items</a>
                    <span class="text-muted" style="font-size: 0.875rem;">🚚 Delivery in 30-40 min</span>
                </div>
            </div>
        `;

        cartContainer.innerHTML = itemsHtml;

        // Attach listeners for quantity and remove
        cartContainer.querySelectorAll(".btn-inc").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const item = window.Store.getCartItem(id);
                if (item) {
                    window.Store.updateCartQty(id, item.quantity + 1);
                }
            });
        });

        cartContainer.querySelectorAll(".btn-dec").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const item = window.Store.getCartItem(id);
                if (item) {
                    if (item.quantity > 1) {
                        window.Store.updateCartQty(id, item.quantity - 1);
                    } else {
                        // Confirm removal with nice animation
                        animateAndRemoveItem(id);
                    }
                }
            });
        });

        cartContainer.querySelectorAll(".btn-remove-item").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                animateAndRemoveItem(id);
            });
        });

        const clearBtn = document.getElementById("clearCartBtn");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                if (confirm("Are you sure you want to clear your entire cart?")) {
                    window.Store.clearCart();
                    BiteBuddy.toast("Cart Cleared", "All items have been removed.", "info");
                }
            });
        }

        // 2. Render Order Summary & Coupon Form
        renderSummary(totals, true);
    }

    function animateAndRemoveItem(itemId) {
        const itemEl = document.getElementById(`cart-item-${itemId}`);
        if (itemEl) {
            itemEl.style.transition = "all 0.25s ease";
            itemEl.style.opacity = "0";
            itemEl.style.transform = "translateX(30px)";
            setTimeout(() => {
                window.Store.removeFromCart(itemId);
                BiteBuddy.toast("Item Removed", "The item has been removed from your cart.", "info");
            }, 250);
        } else {
            window.Store.removeFromCart(itemId);
        }
    }

    function renderSummary(totals, hasItems) {
        const appliedCoupon = totals.couponCode;

        summaryContainer.innerHTML = `
            <h3>Order Summary</h3>
            
            <!-- Coupon Code Section -->
            <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border);">
                <label style="display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: var(--dark);">
                    🏷️ Have a Promo Code?
                </label>
                <div class="coupon-input-group">
                    <input type="text" id="couponInput" placeholder="Try BITE50 or WELCOME" value="${appliedCoupon || ''}" ${appliedCoupon ? 'disabled' : ''}>
                    ${appliedCoupon ? `
                        <button type="button" id="removeCouponBtn" class="btn btn-secondary btn-sm" style="color: var(--danger);">Remove</button>
                    ` : `
                        <button type="button" id="applyCouponBtn" class="btn btn-primary btn-sm">Apply</button>
                    `}
                </div>
                <div id="couponStatusMsg" class="coupon-msg">
                    ${appliedCoupon ? `<span class="coupon-msg success">✓ Code <strong>${appliedCoupon}</strong> active! ${totals.coupon?.description || ''}</span>` : ''}
                </div>
                <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
                    <span class="diet-badge diet-veg cursor-pointer quick-code" data-code="BITE50" style="cursor: pointer;">⚡ BITE50 (50% OFF)</span>
                    <span class="diet-badge diet-veg cursor-pointer quick-code" data-code="WELCOME" style="cursor: pointer;">🎉 WELCOME (₹100 OFF)</span>
                </div>
            </div>

            <!-- Totals Breakdown -->
            <div class="summary-row">
                <span class="label">Items Subtotal</span>
                <span class="value" id="subtotalVal">₹${totals.subtotal}</span>
            </div>

            ${totals.discount > 0 ? `
                <div class="summary-row discount">
                    <span class="label">Promo Discount (${appliedCoupon})</span>
                    <span class="value" style="color: var(--success); font-weight: 700;">&minus; ₹${totals.discount}</span>
                </div>
            ` : ''}

            <div class="summary-row">
                <span class="label">Delivery Fee ${totals.subtotal > 300 ? '<span class="diet-badge diet-veg" style="font-size: 0.65rem;">FREE</span>' : ''}</span>
                <span class="value">${totals.deliveryFee === 0 ? '<span style="color: var(--success); font-weight: 600;">FREE</span>' : `₹${totals.deliveryFee}`}</span>
            </div>

            <div class="summary-row">
                <span class="label">Taxes & Packaging (5% GST)</span>
                <span class="value">₹${totals.taxes}</span>
            </div>

            <div class="summary-total">
                <span class="label">Total Amount</span>
                <span class="value" id="grandTotalVal" style="color: var(--primary);">₹${totals.total}</span>
            </div>

            ${hasItems ? `
                <a href="checkout.html" class="btn btn-primary btn-lg btn-block mt-3" id="checkoutBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    Proceed to Checkout →
                </a>
            ` : `
                <button class="btn btn-secondary btn-lg btn-block mt-3" disabled style="opacity: 0.6; cursor: not-allowed;">
                    Cart is Empty
                </button>
            `}

            <div style="margin-top: 14px; text-align: center; font-size: 0.75rem; color: var(--muted);">
                🔒 Guaranteed Safe & Secure Checkout
            </div>
        `;

        // Coupon Handlers
        const applyBtn = document.getElementById("applyCouponBtn");
        const removeBtn = document.getElementById("removeCouponBtn");
        const couponInput = document.getElementById("couponInput");
        const statusMsg = document.getElementById("couponStatusMsg");

        if (applyBtn && couponInput) {
            applyBtn.addEventListener("click", () => {
                const code = couponInput.value.trim();
                const res = window.Store.applyCoupon(code);
                if (res.success) {
                    BiteBuddy.toast("Coupon Applied!", res.message, "success");
                } else {
                    statusMsg.innerHTML = `<span class="coupon-msg error">✕ ${res.message}</span>`;
                    BiteBuddy.toast("Invalid Coupon", res.message, "danger");
                }
            });

            couponInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    applyBtn.click();
                }
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener("click", () => {
                window.Store.removeCoupon();
                BiteBuddy.toast("Coupon Removed", "Discount has been removed.", "info");
            });
        }

        // Quick click on coupon badges
        summaryContainer.querySelectorAll(".quick-code").forEach(badge => {
            badge.addEventListener("click", () => {
                const code = badge.getAttribute("data-code");
                const res = window.Store.applyCoupon(code);
                if (res.success) {
                    BiteBuddy.toast("Coupon Applied!", res.message, "success");
                } else {
                    BiteBuddy.toast("Notice", res.message, "warning");
                }
            });
        });
    }
});
