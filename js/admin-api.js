
const API_URL = "https://dummyjson.com/products";

const productId = document.getElementById("productId");
const foodName = document.getElementById("foodName");
const foodPrice = document.getElementById("foodPrice");
const foodDescription = document.getElementById("foodDescription");
const resultBox = document.getElementById("api-result");

let selectedRow = null;

// Existing table ke Edit buttons
const rows = document.querySelectorAll(".table tbody tr");

rows.forEach((row, index) => {
    const editButton = row.querySelector(".actions button");

    editButton.addEventListener("click", () => {
        selectedRow = row;

        productId.value = index + 1;
        foodName.value = row.querySelector("td strong").textContent;
        foodPrice.value = row.querySelector("td:nth-child(4) strong")
            .textContent.replace("₹", "");
        foodDescription.value = "Updated food item";

        resultBox.textContent = "Selected: " + foodName.value;
    });
});

// API request function
async function sendRequest(method, body = null) {
    if (!selectedRow) {
        alert("First click Edit on a food item in the table.");
        return;
    }

    resultBox.textContent = "Sending request...";

    try {
        const options = {
            method: method,
            headers: {
                "Content-Type": "application/json"
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(
            `${API_URL}/${productId.value}`,
            options
        );

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        if (method === "PUT") {
            selectedRow.querySelector("td strong").textContent = foodName.value;

            selectedRow.querySelector(
                "td:nth-child(4) strong"
            ).textContent = "₹" + foodPrice.value;
        }

        if (method === "PATCH") {
            selectedRow.querySelector(
                "td:nth-child(4) strong"
            ).textContent = "₹" + foodPrice.value;
        }

        if (method === "DELETE") {
            selectedRow.remove();
            selectedRow = null;
        }

        resultBox.textContent =
            method + " successful!\n" +
            JSON.stringify(data, null, 2);

    } catch (error) {
        resultBox.textContent = error.message;
    }
}

// PUT - Update name and price
document.getElementById("putBtn").addEventListener("click", () => {
    sendRequest("PUT", {
        title: foodName.value,
        price: Number(foodPrice.value),
        description: foodDescription.value
    });
});

// PATCH - Update only price
document.getElementById("patchBtn").addEventListener("click", () => {
    sendRequest("PATCH", {
        price: Number(foodPrice.value)
    });
});

// DELETE - Remove selected row
document.getElementById("deleteBtn").addEventListener("click", () => {
    if (!selectedRow) {
        alert("First select a food item using Edit.");
        return;
    }

    if (confirm("Delete this food item?")) {
        sendRequest("DELETE");
    }
});
