/**
 * ORDER-CONFIRMATION.JS — Live Order Stepper, Real-time Status Simulator, & Order Breakdown
 */

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("id") || urlParams.get("orderId") || "FD10245";

    const order = (window.Store ? window.Store.getOrder(orderId) : null) || (window.Store ? window.Store.getOrders()[0] : null);
    if (!order) return;

    // 1. Update Order ID and Estimation
    const idEl = document.querySelector(".order-id span, .order-id");
    if (idEl) idEl.innerHTML = `#${order.id.replace('#', '')}`;

    const estEl = document.querySelector(".delivery-estimate .est-value");
    if (estEl) estEl.innerHTML = `⚡ ${order.estimatedMinutes || 30}–40 Minutes`;

    // 2. Insert Live Tracking Stepper above the details card
    const detailsCard = document.querySelector(".success-card .card, .container .card");
    if (detailsCard) {
        const trackerBox = document.createElement("div");
        trackerBox.className = "order-tracking-card";
        trackerBox.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <h4 style="margin: 0; font-size: 1.05rem;">📍 Live Order Tracking</h4>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span id="currentStatusBadge" class="badge ${order.statusBadge || 'badge-warning'}">${order.statusText || '⚡ Order Placed'}</span>
                    <button type="button" id="advanceStatusBtn" class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 4px 8px;" title="Click to test order state progression">
                        ▶ Advance Status (Demo)
                    </button>
                </div>
            </div>

            <div class="order-stepper">
                <div class="order-stepper-progress" id="stepperProgress"></div>
                
                <div class="step-node" id="step-placed">
                    <div class="step-icon-circle">📝</div>
                    <div class="step-title">Order Placed</div>
                    <div class="step-time">Confirmed</div>
                </div>

                <div class="step-node" id="step-preparing">
                    <div class="step-icon-circle">🍳</div>
                    <div class="step-title">Preparing</div>
                    <div class="step-time">In Kitchen</div>
                </div>

                <div class="step-node" id="step-out">
                    <div class="step-icon-circle">🛵</div>
                    <div class="step-title">On the Way</div>
                    <div class="step-time">Dispatched</div>
                </div>

                <div class="step-node" id="step-delivered">
                    <div class="step-icon-circle">🎉</div>
                    <div class="step-title">Delivered</div>
                    <div class="step-time">Enjoy your meal!</div>
                </div>
            </div>
            
            <div style="background: var(--background); padding: 10px 14px; border-radius: var(--radius); display: flex; align-items: center; justify-content: space-between; font-size: 0.8125rem;">
                <span>🚴 Delivery Executive: <strong>Vikram Singh</strong> (+91 91234 56789)</span>
                <span style="color: var(--success); font-weight: 600;">✓ Temperature Checked</span>
            </div>
        `;

        detailsCard.parentNode.insertBefore(trackerBox, detailsCard);

        updateStepperUI(order.status || "placed");

        // Advance Status Demo button
        const advanceBtn = document.getElementById("advanceStatusBtn");
        if (advanceBtn) {
            const nextStates = {
                "placed": "preparing",
                "preparing": "out_for_delivery",
                "out_for_delivery": "delivered",
                "delivered": "placed"
            };

            advanceBtn.addEventListener("click", () => {
                const next = nextStates[order.status] || "preparing";
                window.Store.updateOrderStatus(order.id, next);
                order.status = next;
                updateStepperUI(next);
                BiteBuddy.toast("Status Updated!", `Order #${order.id} status is now: ${order.statusText}`, "info");
            });
        }
    }

    function updateStepperUI(status) {
        const progressEl = document.getElementById("stepperProgress");
        const badgeEl = document.getElementById("currentStatusBadge");
        const nodePlaced = document.getElementById("step-placed");
        const nodePrep = document.getElementById("step-preparing");
        const nodeOut = document.getElementById("step-out");
        const nodeDelivered = document.getElementById("step-delivered");

        // Reset
        [nodePlaced, nodePrep, nodeOut, nodeDelivered].forEach(node => {
            if (node) {
                node.className = "step-node";
            }
        });

        if (status === "placed") {
            if (nodePlaced) nodePlaced.classList.add("completed");
            if (nodePrep) nodePrep.classList.add("active");
            if (progressEl) progressEl.style.width = "15%";
            if (badgeEl) { badgeEl.className = "badge badge-warning"; badgeEl.textContent = "⚡ Order Placed"; }
        } else if (status === "preparing") {
            if (nodePlaced) nodePlaced.classList.add("completed");
            if (nodePrep) nodePrep.classList.add("active");
            if (progressEl) progressEl.style.width = "45%";
            if (badgeEl) { badgeEl.className = "badge badge-warning"; badgeEl.textContent = "🍳 Preparing in Kitchen"; }
        } else if (status === "out_for_delivery") {
            if (nodePlaced) nodePlaced.classList.add("completed");
            if (nodePrep) nodePrep.classList.add("completed");
            if (nodeOut) nodeOut.classList.add("active");
            if (progressEl) progressEl.style.width = "75%";
            if (badgeEl) { badgeEl.className = "badge badge-info"; badgeEl.textContent = "🛵 Out for Delivery"; }
        } else if (status === "delivered") {
            if (nodePlaced) nodePlaced.classList.add("completed");
            if (nodePrep) nodePrep.classList.add("completed");
            if (nodeOut) nodeOut.classList.add("completed");
            if (nodeDelivered) nodeDelivered.classList.add("completed");
            if (progressEl) progressEl.style.width = "90%";
            if (badgeEl) { badgeEl.className = "badge badge-success"; badgeEl.textContent = "✓ Delivered"; }
        }
    }

    // 3. Populate Order Details Card
    if (detailsCard) {
        const itemsList = order.items || [];
        const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Just now";

        detailsCard.innerHTML = `
            <h4 class="mb-2" style="border-bottom: 1px solid var(--border); padding-bottom: 8px;">Order Details (#${order.id})</h4>
            <div class="profile-info-grid mb-2">
                <div class="profile-info-item">
                    <label>Delivery Address</label>
                    <span>${order.deliveryAddress || 'Flat 402, Sunshine Heights, Bandra West, Mumbai'}</span>
                </div>
                <div class="profile-info-item">
                    <label>Payment Method</label>
                    <span>${order.paymentMethod || 'Cash on Delivery (COD)'}</span>
                </div>
                <div class="profile-info-item">
                    <label>Order Date & Time</label>
                    <span>${dateStr}</span>
                </div>
                <div class="profile-info-item">
                    <label>Total Amount</label>
                    <span style="color: var(--primary); font-weight: 700; font-size: 1.1rem;">₹${order.total || 0}</span>
                </div>
            </div>

            <div style="background-color: var(--background); padding: 14px 18px; border-radius: var(--radius); font-size: 0.875rem;">
                <strong>Items in this order:</strong>
                <ul style="margin: 8px 0 0 16px; color: var(--text);">
                    ${itemsList.map(item => `
                        <li style="margin-bottom: 4px;">
                            ${item.quantity} × <strong>${item.name}</strong> (${item.restaurant || 'BiteBuddy Partner'}) &mdash; 
                            <span style="color: var(--primary); font-weight: 600;">₹${item.price * item.quantity}</span>
                        </li>
                    `).join("")}
                </ul>
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border); display: flex; justify-content: space-between; font-size: 0.8125rem; color: var(--muted);">
                    <span>Subtotal: ₹${order.subtotal || 0} | Delivery: ₹${order.deliveryFee || 0} | Taxes: ₹${order.taxes || 0}</span>
                    ${order.discount > 0 ? `<span style="color: var(--success); font-weight: 600;">Discount: &minus;₹${order.discount}</span>` : ''}
                </div>
            </div>
        `;
    }
});
