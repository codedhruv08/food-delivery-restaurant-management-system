
const checkoutForm = document.getElementById("checkout-form");

if (checkoutForm) {

    checkoutForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const cart = JSON.parse(
            localStorage.getItem("biteBuddyCart")
        ) || [];

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const formData = new FormData(checkoutForm);

        const subtotal = cart.reduce(
            (sum, item) => sum + item.price * item.qty, 0
        );

        const delivery = 40;
        const tax = Math.round(subtotal * 0.05);
        const discount = subtotal >= 500 ? 50 : 0;
        const total = subtotal + delivery + tax - discount;

        const orderData = {
            customerName: formData.get("fullName"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            address: formData.get("address"),
            city: formData.get("city"),
            paymentMethod: formData.get("paymentMethod"),
            items: cart,
            totalAmount: total
        };

        try {

            const response = await fetch(
                "https://jsonplaceholder.typicode.com/posts",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(orderData)
                }
            );

            if (!response.ok) {
                throw new Error("Order submission failed");
            }

            const result = await response.json();

            console.log("Order API Response:", result);

            localStorage.setItem(
                "lastOrder",
                JSON.stringify({
                    ...orderData,
                    orderId: "FD" + Date.now()
                })
            );

            alert("Order submitted successfully! Order ID: " + result.id);

            window.location.href = "order-confirmation.html";

        } catch (error) {

            console.error("Order Error:", error);

            alert("Something went wrong. Please try again.");
        }

    });
}
