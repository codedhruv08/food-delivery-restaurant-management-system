
const CART_KEY = "biteBuddyCart";

// Get saved cart data
function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// Save cart data
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Add food to cart on the home page
document.addEventListener("click", function (event) {
    const button = event.target.closest(
        ".food-card .card-actions .btn-primary"
    );

    if (!button) return;

    event.preventDefault();

    const card = button.closest(".food-card");
    const name = card.querySelector("h3").textContent.trim();
    const restaurant = card.querySelector(".food-restaurant").textContent.trim();
    const price = Number(
        card.querySelector(".food-price").textContent.replace(/[^\d.]/g, "")
    );
    const image = card.querySelector("img").getAttribute("src");

    let cart = getCart();
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({
            name: name,
            restaurant: restaurant,
            price: price,
            image: image,
            qty: 1
        });
    }

    saveCart(cart);
    alert(name + " added to cart!");
});

// Display cart items on cart.html
function displayCart() {
    const container = document.getElementById("cart-items");

    if (!container) return;

    const cart = getCart();
    let subtotal = 0;

    document.getElementById("cart-count").textContent = cart.length;

    if (cart.length === 0) {
        container.innerHTML = "<p>Your cart is empty!</p>";
    } else {
        container.innerHTML = cart.map((item, index) => {
            subtotal += item.price * item.qty;

            return `
                <div class="cart-item">
                    <div class="cart-item-img">
                        <img src="${item.image}" alt="${item.name}">
                    </div>

                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="cart-item-restaurant">${item.restaurant}</p>
                        <p class="cart-item-price">₹${item.price}</p>
                    </div>

                    <div class="cart-item-qty">
                        <label for="qty-${index}">Qty</label>
                        <select id="qty-${index}" data-index="${index}">
                            ${Array.from({ length: 10 }, (_, i) =>
                                `<option value="${i + 1}"
                                ${item.qty === i + 1 ? "selected" : ""}>
                                ${i + 1}</option>`
                            ).join("")}
                        </select>
                    </div>

                    <div class="cart-item-total">
                        ₹${item.price * item.qty}
                    </div>

                    <button class="cart-item-remove"
                            type="button" data-remove="${index}">
                        ✕ Remove
                    </button>
                </div>
            `;
        }).join("");
    }

    const delivery = cart.length ? 40 : 0;
    const tax = Math.round(subtotal * 0.05);
    const discount = subtotal >= 500 ? 50 : 0;
    const total = subtotal + delivery + tax - discount;

    document.getElementById("subtotal").textContent = "₹" + subtotal;
    document.getElementById("delivery-fee").textContent = "₹" + delivery;
    document.getElementById("tax").textContent = "₹" + tax;
    document.getElementById("discount").textContent = "-₹" + discount;
    document.getElementById("grand-total").textContent = "₹" + total;
}

// Change quantity or remove an item
document.addEventListener("change", function (event) {
    if (event.target.matches("#cart-items select[data-index]")) {
        const cart = getCart();
        const index = Number(event.target.dataset.index);

        if (!cart[index]) return;

        cart[index].qty = Number(event.target.value);
        saveCart(cart);
        displayCart();
    }
});

document.addEventListener("click", function (event) {
    const button = event.target.closest("#cart-items [data-remove]");

    if (!button) return;

    const cart = getCart();
    cart.splice(Number(button.dataset.remove), 1);

    saveCart(cart);
    displayCart();
});

// Run when the page loads
displayCart();
