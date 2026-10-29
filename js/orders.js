/**
 * ORDERS.JS — Interactive Order History, Status Filter Tabs, Reorder & Live Tracking
 */

document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".section .container[style*='max-width: 900px'], .section .container");
    const categoryNav = document.querySelector(".category-nav");
    if (!container) return;

    // Remove old static order cards
    const oldCards = container.querySelectorAll(".order-card");
    oldCards.forEach(c => c.remove());

    const listWrapper = document.createElement("div");
    listWrapper.id = "ordersListWrapper";
    container.appendChild(listWrapper);

    let activeFilter = "all";

    if (categoryNav) {
        const tabs = categoryNav.querySelectorAll("a");
        tabs.forEach(tab => {
            tab.addEventListener("click", (e) => {
                e.preventDefault();
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");

                const href = tab.getAttribute("href") || "";
                if (href.includes("active")) activeFilter = "active";
                else if (href.includes("delivered")) activeFilter = "delivered";
                else if (href.includes("cancelled")) activeFilter = "cancelled";
                else activeFilter = "all";

                renderOrders();
            });
        });
    }

    renderOrders();

    // Listen to store updates
    if (window.Store) {
        window.Store.on("order:created", renderOrders);
        window.Store.on("order:updated", renderOrders);
    }

    function renderOrders() {
        const allOrders = window.Store ? window.Store.getOrders() : [];

        // Update Tab Counts
        if (categoryNav) {
            const activeCount = allOrders.filter(o => o.status === "placed" || o.status === "preparing" || o.status === "out_for_delivery").length;
            const deliveredCount = allOrders.filter(o => o.status === "delivered").length;
            const cancelledCount = allOrders.filter(o => o.status === "cancelled").length;

            const tabs = categoryNav.querySelectorAll("a");
            if (tabs[0]) tabs[0].textContent = `All Orders (${allOrders.length})`;
            if (tabs[1]) tabs[1].textContent = `Active Orders (${activeCount})`;
            if (tabs[2]) tabs[2].textContent = `Delivered (${deliveredCount})`;
            if (tabs[3]) tabs[3].textContent = `Cancelled (${cancelledCount})`;
        }

        const filtered = allOrders.filter(order => {
            if (activeFilter === "all") return true;
            if (activeFilter === "active") return order.status === "placed" || order.status === "preparing" || order.status === "out_for_delivery";
            if (activeFilter === "delivered") return order.status === "delivered";
            if (activeFilter === "cancelled") return order.status === "cancelled";
            return true;
        });

        if (filtered.length === 0) {
            listWrapper.innerHTML = `
                <div class="empty-state-box">
                    <span class="empty-state-icon">📦</span>
                    <h3 class="empty-state-title">No Orders Found</h3>
                    <p class="empty-state-desc">You don't have any orders matching the "${activeFilter}" filter.</p>
                    <a href="food-menu.html" class="btn btn-primary btn-sm">Order Food Now</a>
                </div>
            `;
            return;
        }

        let html = "";
        filtered.forEach(order => {
            const isLive = order.status === "placed" || order.status === "preparing" || order.status === "out_for_delivery";
            const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Recently";
            const items = order.items || [];
            const itemsSummary = items.map(i => `${i.quantity}× ${i.name}`).join(", ");
            const borderAccent = isLive ? "border-left: 4px solid var(--warning);" : (order.status === "delivered" ? "border-left: 4px solid var(--success);" : "border-left: 4px solid var(--border);");

            html += `
                <div class="order-card mb-3" style="${borderAccent}" data-id="${order.id}">
                    <div class="order-header">
                        <div>
                            <h4>Order #${order.id}</h4>
                            <span class="text-muted" style="font-size: 0.8125rem;">Placed on ${dateStr}</span>
                        </div>
                        <span class="badge ${order.statusBadge || 'badge-info'}">${order.statusText || 'In Progress'}</span>
                    </div>

                    <div style="margin-bottom: 12px; font-size: 0.9375rem;">
                        <strong>🏪 ${items[0]?.restaurant || 'BiteBuddy Partner'}</strong>
                        <p class="text-muted" style="margin: 4px 0 0; font-size: 0.875rem;">
                            ${itemsSummary || 'Delicious food order'}
                        </p>
                    </div>

                    <div class="order-details">
                        <div>
                            <span class="detail-label">Items Count</span>
                            <span class="detail-value">${items.length} dishes (${items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                        </div>
                        <div>
                            <span class="detail-label">Payment Method</span>
                            <span class="detail-value">${order.paymentMethod || 'COD'}</span>
                        </div>
                        <div>
                            <span class="detail-label">Total Amount</span>
                            <span class="detail-value" style="color: var(--primary); font-weight: 700;">₹${order.total || 0}</span>
                        </div>
                        <div style="text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
                            <a href="order-confirmation.html?id=${order.id}" class="btn btn-secondary btn-sm">
                                📍 Track Status
                            </a>
                            <button type="button" class="btn btn-primary btn-sm btn-reorder" data-id="${order.id}">
                                🔁 Reorder
                            </button>
                            ${isLive ? `
                                <button type="button" class="btn btn-secondary btn-sm btn-cancel-order" data-id="${order.id}" style="color: var(--danger);">
                                    ✕ Cancel
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        listWrapper.innerHTML = html;

        // Reorder Handlers
        listWrapper.querySelectorAll(".btn-reorder").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const order = window.Store.getOrder(id);
                if (order && order.items) {
                    order.items.forEach(item => {
                        window.Store.addToCart(item, item.quantity);
                    });
                    BiteBuddy.toast("Items Added to Cart!", `Re-ordered items from #${id} added to cart.`, "success");
                    setTimeout(() => window.location.href = "cart.html", 600);
                }
            });
        });

        // Cancel Order Handlers
        listWrapper.querySelectorAll(".btn-cancel-order").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                if (confirm(`Are you sure you want to cancel Order #${id}?`)) {
                    window.Store.updateOrderStatus(id, "cancelled");
                    BiteBuddy.toast("Order Cancelled", `Order #${id} has been cancelled.`, "danger");
                    renderOrders();
                }
            });
        });
    }
});
