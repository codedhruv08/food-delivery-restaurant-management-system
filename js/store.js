/**
 * STORE.JS — Reactive LocalStorage Management & Event Dispatcher
 * Provides unified state management across all pages
 */

(function () {
    const STORAGE_KEYS = {
        CART: "bitebuddy_cart",
        ORDERS: "bitebuddy_orders",
        USER: "bitebuddy_user",
        FOOD_ITEMS: "bitebuddy_food_items",
        RESTAURANTS: "bitebuddy_restaurants",
        APPLIED_COUPON: "bitebuddy_applied_coupon"
    };

    // Event Bus for reactivity
    const listeners = {};

    const Store = {
        // Event emitter
        on(event, callback) {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(callback);
        },
        off(event, callback) {
            if (!listeners[event]) return;
            listeners[event] = listeners[event].filter(cb => cb !== callback);
        },
        emit(event, data) {
            if (listeners[event]) {
                listeners[event].forEach(cb => {
                    try { cb(data); } catch (err) { console.error(`Error in event ${event}:`, err); }
                });
            }
            // Also dispatch standard browser CustomEvent for broader DOM integration
            window.dispatchEvent(new CustomEvent(event, { detail: data }));
        },

        // Init store with seed data if not present
        init() {
            if (!localStorage.getItem(STORAGE_KEYS.FOOD_ITEMS) && window.BiteBuddyData) {
                localStorage.setItem(STORAGE_KEYS.FOOD_ITEMS, JSON.stringify(window.BiteBuddyData.foodItems));
            }
            if (!localStorage.getItem(STORAGE_KEYS.RESTAURANTS) && window.BiteBuddyData) {
                localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(window.BiteBuddyData.restaurants));
            }
            if (!localStorage.getItem(STORAGE_KEYS.ORDERS) && window.BiteBuddyData) {
                localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(window.BiteBuddyData.initialOrders));
            }
            if (!localStorage.getItem(STORAGE_KEYS.USER) && window.BiteBuddyData) {
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(window.BiteBuddyData.defaultUser));
            }
            if (!localStorage.getItem(STORAGE_KEYS.CART)) {
                // Seed with initial items so the cart page is pre-populated like the demo!
                const initialCart = [
                    { id: "paneer-tikka", name: "Paneer Tikka", price: 219, quantity: 2, restaurant: "Spice Route", restaurantId: "spice-route", image: "images/food/paneer-tikka.jpg" },
                    { id: "chicken-biryani", name: "Chicken Biryani", price: 299, quantity: 1, restaurant: "Royal Biryani", restaurantId: "royal-biryani", image: "images/food/chicken-biryani.jpg" },
                    { id: "cold-coffee", name: "Cold Coffee", price: 99, quantity: 1, restaurant: "Café Aroma", restaurantId: "cafe-aroma", image: "images/food/cold-coffee.jpg" }
                ];
                localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(initialCart));
            }
        },

        // --- CART OPERATIONS ---
        getCart() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
            } catch (e) {
                return [];
            }
        },

        getCartCount() {
            const cart = this.getCart();
            return cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
        },

        addToCart(item, quantity = 1, options = {}) {
            const cart = this.getCart();
            const existingIndex = cart.findIndex(c => c.id === item.id);
            const qty = Math.max(1, parseInt(quantity, 10) || 1);

            if (existingIndex > -1) {
                cart[existingIndex].quantity += qty;
                if (options) cart[existingIndex].options = { ...(cart[existingIndex].options || {}), ...options };
            } else {
                cart.push({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    restaurant: item.restaurantName || item.restaurant || "BiteBuddy Partner",
                    restaurantId: item.restaurantId || "",
                    image: item.image || "images/food/classic-burger.jpg",
                    quantity: qty,
                    options: options
                });
            }

            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
            this.emit("cart:updated", cart);
            return cart;
        },

        updateCartQty(itemId, quantity) {
            let cart = this.getCart();
            const qty = parseInt(quantity, 10);
            if (qty <= 0) {
                return this.removeFromCart(itemId);
            }
            const item = cart.find(c => c.id === itemId);
            if (item) {
                item.quantity = qty;
                localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
                this.emit("cart:updated", cart);
            }
            return cart;
        },

        removeFromCart(itemId) {
            let cart = this.getCart();
            cart = cart.filter(c => c.id !== itemId);
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
            this.emit("cart:updated", cart);
            return cart;
        },

        clearCart() {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
            localStorage.removeItem(STORAGE_KEYS.APPLIED_COUPON);
            this.emit("cart:updated", []);
        },

        getCartItem(itemId) {
            return this.getCart().find(c => c.id === itemId);
        },

        // --- COUPONS & TOTALS ---
        getAppliedCoupon() {
            return localStorage.getItem(STORAGE_KEYS.APPLIED_COUPON) || null;
        },

        applyCoupon(code) {
            if (!code) return { success: false, message: "Please enter a coupon code." };
            const cleanCode = code.trim().toUpperCase();
            const coupon = window.BiteBuddyData?.coupons?.[cleanCode];
            if (!coupon) {
                return { success: false, message: "Invalid coupon code. Try BITE50 or WELCOME." };
            }

            const totals = this.getCartTotals(cleanCode);
            if (coupon.minOrder && totals.subtotal < coupon.minOrder) {
                return { success: false, message: `Minimum order of ₹${coupon.minOrder} required for ${cleanCode}.` };
            }

            localStorage.setItem(STORAGE_KEYS.APPLIED_COUPON, cleanCode);
            this.emit("coupon:applied", { code: cleanCode, coupon });
            return { success: true, message: `Coupon ${cleanCode} applied! ${coupon.description}`, coupon };
        },

        removeCoupon() {
            localStorage.removeItem(STORAGE_KEYS.APPLIED_COUPON);
            this.emit("coupon:removed");
        },

        getCartTotals(customCouponCode = null) {
            const cart = this.getCart();
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const couponCode = customCouponCode || this.getAppliedCoupon();
            const coupon = couponCode && window.BiteBuddyData?.coupons?.[couponCode];

            let discount = 0;
            let deliveryFee = subtotal > 300 || subtotal === 0 ? 0 : 40;

            if (coupon) {
                if (coupon.discountPercent) {
                    discount = Math.round((subtotal * coupon.discountPercent) / 100);
                    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
                } else if (coupon.flatDiscount) {
                    discount = coupon.flatDiscount;
                } else if (coupon.freeDelivery) {
                    deliveryFee = 0;
                }
            }
            discount = Math.min(discount, subtotal);

            const taxable = Math.max(0, subtotal - discount);
            const taxes = taxable > 0 ? Math.round(taxable * 0.05) : 0; // 5% GST
            const total = Math.max(0, subtotal - discount + deliveryFee + taxes);

            return {
                subtotal,
                discount,
                couponCode,
                coupon,
                deliveryFee,
                taxes,
                total,
                itemCount: this.getCartCount()
            };
        },

        // --- ORDERS MANAGEMENT ---
        getOrders() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];
            } catch (e) {
                return [];
            }
        },

        getOrder(orderId) {
            const orders = this.getOrders();
            return orders.find(o => o.id === orderId || o.id === `#${orderId}` || `#${o.id}` === orderId);
        },

        createOrder(orderData) {
            const orders = this.getOrders();
            const newId = `FD${Math.floor(10000 + Math.random() * 90000)}`;
            const newOrder = {
                id: newId,
                orderDate: new Date().toISOString(),
                status: "placed",
                statusText: "⚡ Order Placed",
                statusBadge: "badge-warning",
                estimatedMinutes: 35,
                ...orderData
            };
            orders.unshift(newOrder);
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
            this.clearCart();
            this.emit("order:created", newOrder);
            return newOrder;
        },

        updateOrderStatus(orderId, newStatus) {
            const orders = this.getOrders();
            const order = orders.find(o => o.id === orderId);
            if (!order) return null;

            order.status = newStatus;
            switch (newStatus) {
                case "placed":
                    order.statusText = "⚡ Order Placed";
                    order.statusBadge = "badge-warning";
                    break;
                case "preparing":
                    order.statusText = "🍳 Preparing in Kitchen";
                    order.statusBadge = "badge-warning";
                    break;
                case "out_for_delivery":
                    order.statusText = "🛵 Out for Delivery";
                    order.statusBadge = "badge-info";
                    break;
                case "delivered":
                    order.statusText = "✓ Delivered";
                    order.statusBadge = "badge-success";
                    break;
                case "cancelled":
                    order.statusText = "✕ Cancelled";
                    order.statusBadge = "badge-danger";
                    break;
            }

            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
            this.emit("order:updated", order);
            return order;
        },

        // --- FOOD ITEMS & RESTAURANTS ---
        getFoodItems() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.FOOD_ITEMS)) || (window.BiteBuddyData?.foodItems || []);
            } catch (e) {
                return window.BiteBuddyData?.foodItems || [];
            }
        },

        getFoodItem(id) {
            return this.getFoodItems().find(f => f.id === id);
        },

        addFoodItem(item) {
            const items = this.getFoodItems();
            const newItem = {
                id: item.id || `dish-${Date.now()}`,
                isAvailable: true,
                rating: 4.5,
                reviewsCount: 1,
                ...item
            };
            items.push(newItem);
            localStorage.setItem(STORAGE_KEYS.FOOD_ITEMS, JSON.stringify(items));
            this.emit("food:updated", items);
            return newItem;
        },

        toggleFoodItemAvailability(id) {
            const items = this.getFoodItems();
            const item = items.find(f => f.id === id);
            if (item) {
                item.isAvailable = !item.isAvailable;
                localStorage.setItem(STORAGE_KEYS.FOOD_ITEMS, JSON.stringify(items));
                this.emit("food:updated", items);
            }
            return item;
        },

        deleteFoodItem(id) {
            let items = this.getFoodItems();
            items = items.filter(f => f.id !== id);
            localStorage.setItem(STORAGE_KEYS.FOOD_ITEMS, JSON.stringify(items));
            this.emit("food:updated", items);
            return items;
        },

        getRestaurants() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS)) || (window.BiteBuddyData?.restaurants || []);
            } catch (e) {
                return window.BiteBuddyData?.restaurants || [];
            }
        },

        getRestaurant(id) {
            return this.getRestaurants().find(r => r.id === id || r.slug === id);
        },

        // --- USER & AUTH ---
        getUser() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || window.BiteBuddyData?.defaultUser;
            } catch (e) {
                return window.BiteBuddyData?.defaultUser;
            }
        },

        saveUser(userData) {
            const current = this.getUser() || {};
            const updated = { ...current, ...userData };
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
            this.emit("user:updated", updated);
            return updated;
        },

        isLoggedIn() {
            return !!localStorage.getItem("bitebuddy_is_logged_in");
        },

        login(user, role = "customer") {
            localStorage.setItem("bitebuddy_is_logged_in", "true");
            localStorage.setItem("bitebuddy_role", role);
            if (user) this.saveUser(user);
            this.emit("auth:change", { loggedIn: true, role });
        },

        logout() {
            localStorage.removeItem("bitebuddy_is_logged_in");
            localStorage.removeItem("bitebuddy_role");
            this.emit("auth:change", { loggedIn: false });
        }
    };

    // Auto-initialize on load
    Store.init();

    window.Store = Store;
})();
