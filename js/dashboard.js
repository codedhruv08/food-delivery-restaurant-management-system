/**
 * DASHBOARD.JS — Interactive Restaurant and Admin Dashboards
 * Real-time stats, order status dispatching, food item management & menu builder
 */

document.addEventListener("DOMContentLoaded", function () {
    const isRestaurantPanel = window.location.pathname.includes("restaurant-dashboard");
    const isAdminPanel = window.location.pathname.includes("admin-dashboard");

    if (!isRestaurantPanel && !isAdminPanel) return;

    const allOrders = window.Store ? window.Store.getOrders() : [];
    const allDishes = window.Store ? window.Store.getFoodItems() : [];
    const allRestaurants = window.Store ? window.Store.getRestaurants() : [];

    // 1. UPDATE STAT CARDS
    const statCards = document.querySelectorAll(".stat-card, .dashboard-stat");
    if (statCards.length > 0) {
        const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const activeOrdersCount = allOrders.filter(o => o.status === "placed" || o.status === "preparing" || o.status === "out_for_delivery").length;

        statCards.forEach(card => {
            const label = card.querySelector(".stat-label, h4, p")?.textContent.toLowerCase() || "";
            const valueEl = card.querySelector(".stat-value, .stat-number, h3, h2");
            if (!valueEl) return;

            if (label.includes("order")) {
                valueEl.textContent = isRestaurantPanel ? allOrders.length : allOrders.length;
            } else if (label.includes("revenue") || label.includes("sale") || label.includes("earning")) {
                valueEl.textContent = `₹${totalRevenue.toLocaleString("en-IN")}`;
            } else if (label.includes("food") || label.includes("dish") || label.includes("item") || label.includes("menu")) {
                valueEl.textContent = allDishes.length;
            } else if (label.includes("user") || label.includes("customer")) {
                valueEl.textContent = "1,420";
            } else if (label.includes("restaurant")) {
                valueEl.textContent = allRestaurants.length;
            }
        });
    }

    // 2. DASHBOARD ORDERS TABLE (restaurant-dashboard/orders.html or dashboard home)
    const ordersTable = document.querySelector("table tbody");
    const isOrdersPage = window.location.pathname.includes("orders.html") || document.querySelector("h1, h2")?.textContent.includes("Orders");

    if (ordersTable && isOrdersPage) {
        renderDashboardOrdersTable();

        function renderDashboardOrdersTable() {
            if (allOrders.length === 0) {
                ordersTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px;">No orders found.</td></tr>`;
                return;
            }

            ordersTable.innerHTML = allOrders.map(order => {
                const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Recent";
                const customerName = order.customer?.name || "Rahul Sharma";
                const itemsCount = (order.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);

                return `
                    <tr data-order-id="${order.id}">
                        <td><strong>#${order.id}</strong></td>
                        <td>${customerName}</td>
                        <td>${itemsCount} items</td>
                        <td><strong>₹${order.total}</strong></td>
                        <td>${dateStr}</td>
                        <td>
                            <select class="dash-status-select" data-id="${order.id}" style="padding: 4px 8px; border-radius: var(--radius); border: 1px solid var(--border); font-size: 0.8125rem; font-weight: 600;">
                                <option value="placed" ${order.status === 'placed' ? 'selected' : ''}>⚡ Placed</option>
                                <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>🍳 Preparing</option>
                                <option value="out_for_delivery" ${order.status === 'out_for_delivery' ? 'selected' : ''}>🛵 Out for Delivery</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>✓ Delivered</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>✕ Cancelled</option>
                            </select>
                        </td>
                        <td>
                            <a href="../order-confirmation.html?id=${order.id}" class="btn btn-secondary btn-sm" target="_blank" style="font-size: 0.75rem; padding: 3px 7px;">
                                View
                            </a>
                        </td>
                    </tr>
                `;
            }).join("");

            ordersTable.querySelectorAll(".dash-status-select").forEach(select => {
                select.addEventListener("change", (e) => {
                    const id = select.getAttribute("data-id");
                    const newStatus = e.target.value;
                    window.Store.updateOrderStatus(id, newStatus);
                    BiteBuddy.toast("Order Status Updated!", `Order #${id} is now ${select.options[select.selectedIndex].text}`, "success");
                });
            });
        }
    }

    // 3. MANAGE FOOD PAGE (restaurant-dashboard/manage-food.html or admin-dashboard/food-items.html)
    const isManageFoodPage = window.location.pathname.includes("manage-food.html") || window.location.pathname.includes("food-items.html");
    if (isManageFoodPage && ordersTable) {
        renderManageFoodTable();

        function renderManageFoodTable() {
            const dishes = window.Store.getFoodItems();
            ordersTable.innerHTML = dishes.map((dish, idx) => {
                const isAvail = dish.isAvailable !== false;
                return `
                    <tr data-dish-id="${dish.id}">
                        <td><img src="../${dish.image}" alt="${dish.name}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;" onerror="this.src='../images/food/classic-burger.jpg'"></td>
                        <td><strong>${dish.name}</strong><br><span class="text-muted" style="font-size: 0.75rem;">${dish.category} • ${dish.isVeg ? 'Veg' : 'Non-Veg'}</span></td>
                        <td>${dish.restaurantName || 'Spice Route'}</td>
                        <td><strong>₹${dish.price}</strong></td>
                        <td>
                            <button type="button" class="btn btn-sm btn-toggle-avail" data-id="${dish.id}" style="padding: 4px 8px; font-size: 0.75rem; border: none; border-radius: var(--radius); cursor: pointer; background: ${isAvail ? 'var(--success-light)' : 'var(--danger-light)'}; color: ${isAvail ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">
                                ${isAvail ? '● In Stock' : '○ Out of Stock'}
                            </button>
                        </td>
                        <td>
                            <button type="button" class="btn btn-sm btn-delete-dish" data-id="${dish.id}" style="color: var(--danger); background: none; border: 1px solid var(--border); padding: 4px 8px; font-size: 0.75rem; cursor: pointer;">
                                🗑️ Delete
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");

            ordersTable.querySelectorAll(".btn-toggle-avail").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    window.Store.toggleFoodItemAvailability(id);
                    renderManageFoodTable();
                    BiteBuddy.toast("Availability Updated", "Menu item stock status changed.", "info");
                });
            });

            ordersTable.querySelectorAll(".btn-delete-dish").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    if (confirm("Are you sure you want to remove this dish from the menu?")) {
                        window.Store.deleteFoodItem(id);
                        renderManageFoodTable();
                        BiteBuddy.toast("Dish Deleted", "Item removed from menu.", "danger");
                    }
                });
            });
        }
    }

    // 4. ADD FOOD PAGE (restaurant-dashboard/add-food.html)
    const addFoodForm = document.querySelector("form:has(#foodName, input[name*='name'])");
    const isAddFoodPage = window.location.pathname.includes("add-food.html");

    if (isAddFoodPage && addFoodForm) {
        addFoodForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = (document.getElementById("foodName") || addFoodForm.querySelector("input[name*='name']"))?.value.trim();
            const price = parseFloat((document.getElementById("price") || addFoodForm.querySelector("input[name*='price']"))?.value || "0");
            const category = (document.getElementById("category") || addFoodForm.querySelector("select[name*='category']"))?.value || "Main Course";
            const description = (document.getElementById("description") || addFoodForm.querySelector("textarea"))?.value.trim() || "";
            const isVeg = (document.getElementById("isVeg") || addFoodForm.querySelector("input[type='checkbox']"))?.checked ?? true;

            if (!name || price <= 0) {
                BiteBuddy.toast("Error", "Please provide a valid dish name and price.", "danger");
                return;
            }

            const newDish = window.Store.addFoodItem({
                id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                name: name,
                price: price,
                category: category,
                description: description,
                isVeg: isVeg,
                image: "images/food/butter-chicken.jpg",
                restaurantId: "spice-route",
                restaurantName: "Spice Route",
                cuisine: "North Indian"
            });

            BiteBuddy.toast("Dish Added!", `${newDish.name} has been added to the live menu!`, "success");
            setTimeout(() => {
                window.location.href = "manage-food.html";
            }, 800);
        });
    }
});
