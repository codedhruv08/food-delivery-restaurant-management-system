console.log("Form validation JS loaded!");
const form = document.getElementById("registerForm");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPass").value;
    const confirmPassword = document.getElementById("regConfirm").value;
    const terms = document.getElementById("terms").checked;

    if (name.length < 3) {
        alert("Name must contain at least 3 characters.");
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    const phonePattern = /^\+?[0-9\s-]{10,15}$/;

    if (!phonePattern.test(phone)) {
        alert("Please enter a valid phone number.");
        return;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) ||
        !/[0-9]/.test(password)) {
        alert("Password must contain uppercase, lowercase and a number.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    if (!terms) {
        alert("Please accept the Terms of Service.");
        return;
    }

    alert("Form validation successful!");
    form.submit();
});
