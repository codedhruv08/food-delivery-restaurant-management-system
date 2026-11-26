
const savedOrder = JSON.parse(
    localStorage.getItem("lastOrder")
);

if (savedOrder) {

    // Display Order ID
    document.getElementById("order-id").textContent =
        "#" + savedOrder.orderId;

    // Display Address
    document.getElementById("order-address").textContent =
        savedOrder.address + ", " + savedOrder.city;

    // Display Payment Method
    const payment = {
        cod: "Cash on Delivery (COD)",
        upi: "UPI",
        card: "Credit / Debit Card",
        netbanking: "Net Banking"
    };

    document.getElementById("order-payment").textContent =
        payment[savedOrder.paymentMethod] || savedOrder.paymentMethod;

    // Display Date
    document.getElementById("order-date").textContent =
        new Date().toLocaleString("en-IN");

    // Display Total
    document.getElementById("order-total").textContent =
        "₹" + savedOrder.totalAmount;

    // Display Food Items
    const itemsList = document.getElementById("order-items");

    itemsList.innerHTML = "";

    savedOrder.items.forEach(item => {

        const li = document.createElement("li");

        li.textContent =
            item.qty + " × " + item.name +
            " — ₹" + (item.price * item.qty);

        itemsList.appendChild(li);

    });

} else {

    document.querySelector(".success-page").innerHTML =
        "<h2>No recent order found!</h2>" +
        '<a href="food-menu.html">Order Food</a>';

}
