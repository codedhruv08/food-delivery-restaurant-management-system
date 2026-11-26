// Login against the demo user list in data/users.json.
// Note: fetch() of a local JSON file needs the site to be served over http
// (e.g. VS Code Live Server or `npx serve`), not opened as file://.

const USERS_URL = "data/users.json";
const SESSION_KEY = "bitebuddy_user";

const ROLE_HOME = {
    customer: "profile.html",
    restaurant: "restaurant-dashboard/index.html",
    admin: "admin-dashboard/index.html"
};

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginBtn = document.getElementById("loginBtn");

function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = "block";
}

function clearLoginError() {
    loginError.textContent = "";
    loginError.style.display = "none";
}

async function loadUsers() {
    const response = await fetch(USERS_URL);
    if (!response.ok) {
        throw new Error("HTTP " + response.status);
    }
    const data = await response.json();
    return data.users || [];
}

function saveSession(user, remember) {
    // Never keep the password in browser storage.
    const session = {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        restaurantName: user.restaurantName,
        city: user.city,
        state: user.state,
        loggedInAt: new Date().toISOString()
    };
    const store = remember ? localStorage : sessionStorage;
    try {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        store.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
        // Storage unavailable (private mode etc.) — login still proceeds.
    }
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearLoginError();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const remember = document.getElementById("rememberMe").checked;

    if (!email || !password) {
        showLoginError("Please enter both your email and password.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in...";

    try {
        const users = await loadUsers();
        const user = users.find(u => u.email.toLowerCase() === email);

        if (!user || user.password !== password) {
            showLoginError("Incorrect email or password.");
            return;
        }

        if (user.status !== "active") {
            showLoginError("This account has been suspended. Please contact support@bitebuddy.com.");
            return;
        }

        saveSession(user, remember);
        window.location.href = ROLE_HOME[user.role] || "index.html";
    } catch (err) {
        console.error("Login failed:", err);
        showLoginError("Could not load user data. Run the site through a local server (e.g. Live Server) instead of opening the file directly.");
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Sign In";
    }
});
