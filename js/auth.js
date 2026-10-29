/**
 * AUTH.JS — User Authentication, Registration, and Profile Management
 */

document.addEventListener("DOMContentLoaded", function () {
    // 1. LOGIN PAGE CONTROLLER
    const loginForm = document.querySelector("form:has(input[type='password'])");
    const isLoginPage = window.location.pathname.includes("login.html") || document.querySelector("h1, h2")?.textContent.includes("Login");

    if (isLoginPage && loginForm) {
        // Add Demo 1-Click Login Box
        const demoBox = document.createElement("div");
        demoBox.className = "card mb-3";
        demoBox.style.padding = "16px";
        demoBox.style.background = "var(--primary-light)";
        demoBox.style.border = "1px solid #fed7aa";
        demoBox.innerHTML = `
            <div style="font-size: 0.8125rem; font-weight: 700; color: var(--primary); margin-bottom: 8px;">
                ⚡ 1-Click Demo Login:
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button type="button" id="demoCustomerBtn" class="btn btn-primary btn-sm" style="font-size: 0.75rem;">👤 Customer (Rahul)</button>
                <button type="button" id="demoRestaurantBtn" class="btn btn-secondary btn-sm" style="font-size: 0.75rem;">🏪 Restaurant Manager</button>
                <button type="button" id="demoAdminBtn" class="btn btn-secondary btn-sm" style="font-size: 0.75rem;">⚙️ Admin</button>
            </div>
        `;

        loginForm.parentNode.insertBefore(demoBox, loginForm);

        document.getElementById("demoCustomerBtn").addEventListener("click", () => {
            window.Store.login(window.BiteBuddyData.defaultUser, "customer");
            BiteBuddy.toast("Welcome Back, Rahul!", "Logged in as Customer.", "success");
            setTimeout(() => window.location.href = "index.html", 600);
        });

        document.getElementById("demoRestaurantBtn").addEventListener("click", () => {
            window.Store.login({ name: "Chef Vikram", role: "restaurant" }, "restaurant");
            BiteBuddy.toast("Welcome, Chef Vikram!", "Logged into Restaurant Dashboard.", "success");
            setTimeout(() => window.location.href = "restaurant-dashboard/index.html", 600);
        });

        document.getElementById("demoAdminBtn").addEventListener("click", () => {
            window.Store.login({ name: "Platform Admin", role: "admin" }, "admin");
            BiteBuddy.toast("Welcome, Admin!", "Logged into Admin Dashboard.", "success");
            setTimeout(() => window.location.href = "admin-dashboard/index.html", 600);
        });

        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = loginForm.querySelector("input[type='email']") || loginForm.querySelector("input[name*='email'], input[name*='user']");
            const passInput = loginForm.querySelector("input[type='password']");

            if (!emailInput || !emailInput.value.trim()) {
                BiteBuddy.toast("Error", "Please enter your email.", "danger");
                return;
            }

            const email = emailInput.value.trim();
            const name = email.split("@")[0].replace(".", " ");
            const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

            window.Store.login({ name: formattedName, email }, "customer");
            BiteBuddy.toast("Login Successful!", `Welcome, ${formattedName}!`, "success");
            setTimeout(() => window.location.href = "index.html", 600);
        });
    }

    // 2. REGISTER PAGE CONTROLLER
    const isRegisterPage = window.location.pathname.includes("register.html");
    if (isRegisterPage && loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const nameInput = loginForm.querySelector("input[name*='name'], input[id*='name']");
            const emailInput = loginForm.querySelector("input[type='email']");
            const phoneInput = loginForm.querySelector("input[type='tel']");

            const name = nameInput ? nameInput.value.trim() : "Valued Customer";
            const email = emailInput ? emailInput.value.trim() : "user@example.com";
            const phone = phoneInput ? phoneInput.value.trim() : "+91 98765 00000";

            window.Store.login({ name, email, phone }, "customer");
            BiteBuddy.toast("Registration Complete!", `Welcome to BiteBuddy, ${name}!`, "success");
            setTimeout(() => window.location.href = "index.html", 600);
        });
    }

    // 3. PROFILE PAGE CONTROLLER
    const isProfilePage = window.location.pathname.includes("profile.html");
    if (isProfilePage) {
        const user = window.Store ? window.Store.getUser() : null;
        if (user) {
            // Update profile title & header
            const nameEl = document.querySelector(".profile-header h2, .profile-name");
            if (nameEl) nameEl.textContent = user.name;

            const emailEl = document.querySelector(".profile-header p, .profile-email");
            if (emailEl) emailEl.textContent = user.email;

            // Form inputs
            const nameInput = document.querySelector("input[name*='name'], input[id*='name']");
            if (nameInput) nameInput.value = user.name;

            const emailInput = document.querySelector("input[name*='email'], input[id*='email']");
            if (emailInput) emailInput.value = user.email;

            const phoneInput = document.querySelector("input[name*='phone'], input[id*='phone']");
            if (phoneInput) phoneInput.value = user.phone;

            const addrInput = document.querySelector("input[name*='address'], textarea[name*='address'], input[id*='address']");
            if (addrInput) addrInput.value = user.address;
        }

        const profileForm = document.querySelector("form");
        if (profileForm) {
            profileForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const updatedName = document.querySelector("input[name*='name'], input[id*='name']")?.value.trim() || user.name;
                const updatedPhone = document.querySelector("input[name*='phone'], input[id*='phone']")?.value.trim() || user.phone;
                const updatedAddress = document.querySelector("input[name*='address'], textarea[name*='address'], input[id*='address']")?.value.trim() || user.address;

                window.Store.saveUser({
                    name: updatedName,
                    phone: updatedPhone,
                    address: updatedAddress
                });

                BiteBuddy.toast("Profile Updated!", "Your changes have been saved.", "success");
            });
        }
    }
});
