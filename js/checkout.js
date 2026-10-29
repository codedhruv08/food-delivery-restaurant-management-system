/**
 * CHECKOUT.JS — Dynamic Order Summary, Address Autofill, Payment Methods & Order Placement
 */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form[action*='order-confirmation.html']");
    const summaryCard = document.querySelector(".order-summary");

    if (!form || !summaryCard) return;

    // Prevent default static navigation
    form.removeAttribute("action");
    form.removeAttribute("method");

    // 1. Autofill User Address Info from Store
    const user = window.Store ? window.Store.getUser() : null;
    if (user) {
        setVal("fullName", user.name);
        setVal("phone", user.phone);
        setVal("email", user.email);
        setVal("address", user.address);
        setVal("city", user.city || "Mumbai");
        setVal("state", user.state || "Maharashtra");
        setVal("pincode", user.pincode || "400050");
    }

    function setVal(id, val) {
        const el = document.getElementById(id);
        if (el && val) el.value = val;
    }

    // 2. Add Delivery Partner Tip selector before payment
    let selectedTip = 0;
    const paymentCard = document.querySelector(".card:has(input[name='paymentMethod'])") || document.querySelectorAll(".checkout-layout > div:first-child .card")[1];
    if (paymentCard) {
        const tipBox = document.createElement("div");
        tipBox.className = "card mb-3";
        tipBox.innerHTML = `
            <h3 class="mb-2">💖 Delivery Partner Tip</h3>
            <p class="text-muted" style="font-size: 0.8125rem; margin-bottom: 12px;">100% of the tip goes to your delivery executive for their effort and care.</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;" id="tipBtnGroup">
                <button type="button" class="btn btn-secondary btn-sm tip-btn" data-tip="0" style="background: var(--primary-light); border-color: var(--primary); font-weight: 700;">No Tip</button>
                <button type="button" class="btn btn-secondary btn-sm tip-btn" data-tip="20">₹20</button>
                <button type="button" class="btn btn-secondary btn-sm tip-btn" data-tip="30">₹30</button>
                <button type="button" class="btn btn-secondary btn-sm tip-btn" data-tip="50">₹50 (Popular)</button>
            </div>
        `;
        paymentCard.parentNode.insertBefore(tipBox, paymentCard);

        tipBox.querySelectorAll(".tip-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                tipBox.querySelectorAll(".tip-btn").forEach(b => {
                    b.style.background = "";
                    b.style.borderColor = "";
                    b.style.fontWeight = "";
                });
                btn.style.background = "var(--primary-light)";
                btn.style.borderColor = "var(--primary)";
                btn.style.fontWeight = "700";
                selectedTip = parseInt(btn.getAttribute("data-tip"), 10);
                renderCheckoutSummary();
            });
        });
    }

    // 3. Render Dynamic Order Summary on Right Column
    renderCheckoutSummary();

    function renderCheckoutSummary() {
        const cart = window.Store ? window.Store.getCart() : [];
        const totals = window.Store ? window.Store.getCartTotals() : { subtotal: 0, total: 0 };

        if (cart.length === 0) {
            summaryCard.innerHTML = `
                <h3>Order Summary</h3>
                <div class="empty-state-box" style="padding: 24px 12px;">
                    <p class="text-muted" style="margin-bottom: 12px;">Your cart is empty.</p>
                    <a href="food-menu.html" class="btn btn-primary btn-sm">Browse Food</a>
                </div>
            `;
            return;
        }

        const grandTotal = totals.total + selectedTip;

        let itemsHtml = `
            <h3>Order Summary (${cart.length} items)</h3>
            <div style="max-height: 220px; overflow-y: auto; margin-bottom: 12px; padding-right: 4px; border-bottom: 1px solid var(--border);">
        `;

        cart.forEach(item => {
            itemsHtml += `
                <div class="summary-row" style="margin-bottom: 8px;">
                    <span class="label" style="display: flex; align-items: center; gap: 6px;">
                        <strong>${item.quantity}×</strong> ${item.name}
                    </span>
                    <span class="value">₹${item.price * item.quantity}</span>
                </div>
            `;
        });

        itemsHtml += `
            </div>
            
            <div class="summary-row">
                <span class="label">Items Subtotal</span>
                <span class="value">₹${totals.subtotal}</span>
            </div>

            ${totals.discount > 0 ? `
                <div class="summary-row discount">
                    <span class="label">Promo Discount (${totals.couponCode})</span>
                    <span class="value" style="color: var(--success); font-weight: 700;">&minus; ₹${totals.discount}</span>
                </div>
            ` : ''}

            <div class="summary-row">
                <span class="label">Delivery Fee</span>
                <span class="value">${totals.deliveryFee === 0 ? '<span style="color: var(--success); font-weight: 600;">FREE</span>' : `₹${totals.deliveryFee}`}</span>
            </div>

            <div class="summary-row">
                <span class="label">Taxes & Packaging (5%)</span>
                <span class="value">₹${totals.taxes}</span>
            </div>

            ${selectedTip > 0 ? `
                <div class="summary-row">
                    <span class="label">Delivery Partner Tip</span>
                    <span class="value" style="color: var(--primary); font-weight: 600;">₹${selectedTip}</span>
                </div>
            ` : ''}

            <div class="summary-total mt-2">
                <span class="label">To Pay</span>
                <span class="value" style="color: var(--primary); font-size: 1.25rem;">₹${grandTotal}</span>
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-block mt-3" id="placeOrderBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>🔒 Place Order (₹${grandTotal})</span>
            </button>
            
            <div style="margin-top: 10px; text-align: center; font-size: 0.75rem; color: var(--muted);">
                ⚡ Avg. delivery time: 30–40 mins
            </div>
        `;

        summaryCard.innerHTML = itemsHtml;
    }

    // 4. Form Submission & Order Creation
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const cart = window.Store ? window.Store.getCart() : [];
        if (cart.length === 0) {
            BiteBuddy.toast("Empty Cart", "Please add items to your cart before checking out.", "danger");
            return;
        }

        const fullName = document.getElementById("fullName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const address = document.getElementById("address").value.trim();
        const city = document.getElementById("city").value.trim();
        const state = document.getElementById("state").value.trim();
        const pincode = document.getElementById("pincode").value.trim();
        const instructions = (document.getElementById("instructions")?.value || "").trim();

        if (!fullName || !phone || !address || !pincode) {
            BiteBuddy.toast("Missing Fields", "Please fill in all required delivery details.", "warning");
            return;
        }

        // Get selected payment method
        const paymentRadio = document.querySelector("input[name='paymentMethod']:checked");
        const paymentMethodValue = paymentRadio ? paymentRadio.value : "cod";
        const paymentLabels = {
            cod: "Cash on Delivery (COD)",
            upi: "UPI Instant Payment",
            card: "Credit / Debit Card",
            netbanking: "Net Banking"
        };
        const paymentMethod = paymentLabels[paymentMethodValue] || "Cash on Delivery";

        const totals = window.Store.getCartTotals();
        const grandTotal = totals.total + selectedTip;

        // Button loading state
        const placeBtn = document.getElementById("placeOrderBtn");
        if (placeBtn) {
            placeBtn.disabled = true;
            placeBtn.innerHTML = `<span>⏳ Confirming with Restaurant...</span>`;
        }

        setTimeout(() => {
            const newOrder = window.Store.createOrder({
                items: [...cart],
                subtotal: totals.subtotal,
                discount: totals.discount,
                deliveryFee: totals.deliveryFee,
                taxes: totals.taxes,
                tip: selectedTip,
                total: grandTotal,
                paymentMethod: paymentMethod,
                deliveryAddress: `${address}, ${city}, ${state} - ${pincode}`,
                instructions: instructions,
                customer: { name: fullName, phone, email }
            });

            // Update user's saved info
            window.Store.saveUser({
                name: fullName,
                phone: phone,
                email: email,
                address: address,
                city: city,
                state: state,
                pincode: pincode
            });

            BiteBuddy.toast("Order Placed!", `Your order #${newOrder.id} has been placed successfully!`, "success");

            setTimeout(() => {
                window.location.href = `order-confirmation.html?id=${newOrder.id}`;
            }, 600);
        }, 800);
    });
});
