# 🍔 BiteBuddy — Food Delivery & Restaurant Management System

A complete, modern, responsive static web application for a food delivery platform and restaurant management ecosystem built entirely with **semantic HTML5 and pure CSS3**.

> [!IMPORTANT]
> **Strict Technology Constraint:** This application is built with **100% pure HTML5 and CSS3**. Absolutely zero JavaScript, zero frontend frameworks (React, Vue, Angular), zero CSS libraries (Tailwind, Bootstrap), zero build tools, and zero backend services or databases are used. Every single interaction is achieved through semantic HTML navigation, hyperlinks, form controls, and modern CSS techniques.

---

## 🌟 Platform Overview & Modules

BiteBuddy comprises three distinct modules providing end-to-end simulation of a real-world food delivery ecosystem:

### 1. 🛍️ Customer-Facing Portal (13 Pages)
Designed for food lovers to discover local restaurants, explore curated menus, customize dishes, manage shopping carts, and place orders.
- **Homepage (`index.html`)**: Hero banner, search bar, popular restaurants grid, trending dishes, value propositions, and testimonials.
- **About Us (`about.html`)**: Company story, mission, 3-step delivery workflow, and core values.
- **Browse Restaurants (`restaurants.html`)**: Filter sidebar (cuisine, rating, delivery time, min order) and restaurant directory cards.
- **Restaurant Details (`restaurant-details.html`)**: Store banner, metadata, category tabs, and categorized menu cards with "Add to Cart".
- **Food Menu Catalog (`food-menu.html`)**: Category filter pills, full dish catalog with prices, ratings, and dietary indicators.
- **Food Item Details (`food-details.html`)**: High-res dish view, description, ingredients list, nutritional breakdown table, quantity selector, and related dish recommendations.
- **Shopping Cart (`cart.html`)**: Itemized list, price calculations, coupon discounts, order summary breakdown, and checkout CTA.
- **Checkout (`checkout.html`)**: Multi-step delivery address form, payment method selector (COD, UPI, Cards, Net Banking), and summary sidebar.
- **Order Confirmation (`order-confirmation.html`)**: Success badge, generated Order ID (#FD10245), live ETA counter, and fulfillment details.
- **My Orders History (`my-orders.html`)**: Order status filter tabs, tracking cards with live statuses (Preparing, Delivered, Cancelled), and one-click reorder triggers.
- **User Profile (`profile.html`)**: Customer avatar, personal info editor, saved home/office addresses, and password update security panel.
- **User Login (`login.html`)**: Responsive authentication card with demo credentials and direct shortcuts to customer, restaurant, and admin panels.
- **User Registration (`register.html`)**: Dual-role sign-up (Customer vs. Restaurant Owner), input fields, and terms agreement.

### 2. 🏪 Restaurant Management Dashboard (4 Pages)
Dedicated portal for restaurant owners and kitchen staff (`Spice Route` partner kitchen) to monitor orders, update food listings, and adjust live pricing.
- **Dashboard Overview (`restaurant-dashboard/index.html`)**: Live kitchen metrics (Total Orders, Today's Orders, Menu Dishes, Monthly Revenue), recent orders queue, and top-selling dishes.
- **Manage Food (`restaurant-dashboard/manage-food.html`)**: Menu inventory table with dish category badges, pricing, stock availability toggles, and edit/delete actions.
- **Add Food Item (`restaurant-dashboard/add-food.html`)**: Comprehensive recipe submission form with dietary classifications, preparation times, ingredients, image upload, and initial stock status.
- **Kitchen Orders (`restaurant-dashboard/orders.html`)**: Real-time kitchen order feed, customer delivery addresses, status progression dropdowns, and rider handoff controls.

### 3. ⚡ Super Admin Management Dashboard (6 Pages)
Central administration portal for platform supervisors to oversee aggregate operations, restaurants, catalog compliance, and user accounts.
- **Platform Analytics Overview (`admin-dashboard/index.html`)**: 6 key metric cards (Users, Restaurants, Dishes, Orders, Gross GMV, Live Pending Orders), CSS-only weekly order volume bar chart, and recent platform feeds.
- **User Management (`admin-dashboard/users.html`)**: Complete directory of 12,450 registered accounts with role tags (Customer, Owner, Administrator), account status badges, and suspension controls.
- **Restaurant Partners (`admin-dashboard/restaurants.html`)**: Directory of 348 partner kitchens with cuisine tags, location details, rating scores, onboarding status, and review approvals.
- **Food Catalog Audit (`admin-dashboard/food-items.html`)**: Catalog inspection view across all partner restaurants with filters for categories, compliance, and direct preview links.
- **Master Orders Ledger (`admin-dashboard/orders.html`)**: Real-time platform transaction ledger showing payment gateways, fulfillment statuses, and customer audit trails.
- **Customer Reviews Moderation (`admin-dashboard/reviews.html`)**: Moderation feed with star ratings, dish reviews, dispute flagging, and approve/hide actions.

---

## 🎨 CSS Design System & Architecture

The application's visual styling is cleanly organized into four focused stylesheets located in `css/`:

```
css/
├── style.css         # CSS Variables (:root), reset, base typography, site header, hero, footer, buttons
├── components.css    # Reusable UI cards, tables, forms, badges, alerts, breadcrumbs, rating stars, auth cards
├── dashboard.css     # Sticky sidebar layouts, dashboard headers, metric stat cards, dashboard filters
└── responsive.css    # Responsive breakpoints (1024px tablet, 768px mobile, 480px small screen)
```

### Design Highlights
- **Curated Warm Food Palette**: Vibrant primary orange (`#E85D04`), appetizing accents (`#F48C06`), crisp neutrals (`#1F2937`), and semantic status tones.
- **Pure CSS UI Enhancements**: Unicode star rating visualizations (★★★★★), CSS bar charts with flexbox scaling, and gradient emoji image placeholders.
- **Accessible & Responsive**: Fully responsive across mobile, tablet, and desktop screens with semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`).

---

## 📁 Repository Directory Structure

```
food-delivery-restaurant-management-system/
├── index.html                      # Customer Homepage
├── about.html                      # About Us Page
├── restaurants.html                # Restaurant Directory & Filters
├── restaurant-details.html         # Single Restaurant Menu Page
├── food-menu.html                  # Global Food Catalog Page
├── food-details.html               # Dish Details & Nutritional Info
├── cart.html                       # Shopping Cart & Price Breakdown
├── checkout.html                   # Delivery Address & Payment Selection
├── order-confirmation.html         # Order Success & ETA
├── my-orders.html                  # Customer Orders History & Tracking
├── profile.html                    # Customer Profile & Settings
├── login.html                      # User Sign In Page
├── register.html                   # User Sign Up Page
├── README.md                       # Project Documentation
├── css/
│   ├── style.css                   # Core Design System
│   ├── components.css              # Reusable UI Components
│   ├── dashboard.css               # Dashboard Grid & Sidebar Styles
│   └── responsive.css              # Responsive Breakpoints
├── restaurant-dashboard/
│   ├── index.html                  # Restaurant Kitchen Overview
│   ├── manage-food.html            # Dishes Inventory & Stock
│   ├── add-food.html               # Add New Recipe Form
│   └── orders.html                 # Kitchen Incoming Orders Feed
├── admin-dashboard/
│   ├── index.html                  # Admin Master Analytics
│   ├── users.html                  # Users & Permission Management
│   ├── restaurants.html            # Partner Outlets & Onboarding
│   ├── food-items.html             # Platform Catalog Audit
│   ├── orders.html                 # Master Orders Ledger
│   └── reviews.html                # Customer Reviews & Moderation
└── images/
    ├── avatars/
    ├── banners/
    ├── food/
    ├── logo/
    └── restaurants/
```

---

## 🖼️ Local Image Assets & Offline Self-Containment

To ensure complete privacy, reliability, zero third-party tracking, and offline operation:
- **Zero Remote Image URLs**: There are **no external images hotlinked** via `http://` or `https://` in any HTML file (`<img src="...">`) or CSS stylesheet (`url(...)`).
- **100% Self-Contained**: All 28 photography assets (restaurants, dishes, banners, customer & staff avatars) are downloaded and stored locally under `images/`.
- **Open Licensing & Attribution**: Sourced strictly under open-source compliant licenses (Unsplash License & CC0). Full provenance and attribution are documented in [`images/IMAGE-SOURCES.md`](images/IMAGE-SOURCES.md).
- **Web-Optimized**: Scaled to crisp target dimensions (800x533, 1200x500, 300x300) with compact file sizes (10–200 KB) for instantaneous offline rendering.

---

## 🚀 How to Run the Website

Because BiteBuddy is built exclusively with pure HTML5 and CSS3 and all assets are local:

1. **Direct Browser Execution (No server, no internet connection required)**:
   - Double-click `index.html` or drag it into any modern web browser (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge).

2. **Using a Local Static Web Server (Optional)**:
   - Python:
     ```bash
     python3 -m http.server 8000
     ```
     Then open `http://localhost:8000` in your browser.
   - Node / npx:
     ```bash
     npx serve .
     ```

---

## 📄 License & Credits

Built as an exemplary demonstration of zero-dependency frontend engineering, pure semantic web design, and self-contained static assets. All rights reserved &copy; 2026 BiteBuddy. Image attributions are itemized in [IMAGE-SOURCES.md](images/IMAGE-SOURCES.md).
