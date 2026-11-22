// =====================================
// DELIVERY DASHBOARD TRANSLATION HELPER
// =====================================

function deliveryText(key) {
    return window.ksgTranslate
        ? window.ksgTranslate(key)
        : key;
}

/* ==========================================
   KHET SE GHAR - DELIVERY BOY DASHBOARD
   Backend API Integration
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const availableList = document.getElementById("available-list");
    const myDeliveriesList = document.getElementById("my-deliveries-list");

    const availableCount = document.getElementById("available-count");
    const myDeliveryCount = document.getElementById("my-delivery-count");
    const completedCount = document.getElementById("completed-count");

    const availabilitySelect = document.getElementById("availability-select");
    const availabilityLabel = document.getElementById("availability-label");

    const deliveryName = document.getElementById("delivery-name");
    const vehicleNumber = document.getElementById("vehicle-number");

    // ==========================================
// LANGUAGE CHANGE EVENT
// ==========================================

document.addEventListener("ksgLanguageChanged", function () {
    loadAvailableDeliveries();
    loadMyDeliveries();
});

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character];
        });
    }

    async function apiRequest(url, method = "GET", data = null) {

        const options = {
            method: method,
            credentials: "same-origin",
            headers: {}
        };

        if (data !== null) {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        let result;

        try {
            result = await response.json();
        } catch {
            throw new Error("Invalid server response. Please try again.");
        }

        if (!response.ok) {
            throw new Error(result.message || "Something went wrong.");
        }

        return result;
    }

    function showError(container, message) {
        container.innerHTML = `
            <div class="error-message">
                ${escapeHTML(message)}
            </div>
        `;
    }

    function formatAmount(amount) {

        const number = Number(amount || 0);

        return "₹" + number.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function formatStatus(status) {
        return String(status || "")
            .replaceAll("_", " ")
            .replace(/\b\w/g, letter => letter.toUpperCase());
    }

    function formatDate(dateValue) {

        if (!dateValue) {
            return "Not available";
        }

        const date = new Date(dateValue);

        if (isNaN(date.getTime())) {
            return escapeHTML(dateValue);
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function formatQuantity(quantity) {

        const number = Number(quantity || 0);

        return number.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
    }

 
    // ==========================================
    // AVAILABILITY
    // ==========================================

    function updateAvailabilityDisplay(value) {

    availabilitySelect.value = value;

    availabilityLabel.textContent =
        value === "available" ? deliveryText("deliveryAvailableFor") :
        value === "busy" ? deliveryText("deliveryCurrentlyBusy") :
        deliveryText("deliveryCurrentlyInactive");
}
    // ==========================================
    // LOAD DELIVERY PROFILE
    // ==========================================

    async function loadProfile() {

    try {

        const result = await apiRequest("/delivery-profile");

        const profile = result.profile || {};

        vehicleNumber.textContent =
            deliveryText("deliveryVehiclePrefix") +
            (profile.vehicle_number || deliveryText("deliveryNotProvided"));

        updateAvailabilityDisplay(profile.availability || "available");

    } catch (error) {

        console.error("Profile error:", error);

        availabilityLabel.textContent =
            deliveryText("deliveryProfileUnavailable");
    }
}

    // ==========================================
    // ORDER TRACKING TIMELINE
    // ==========================================

    function createTrackingTimeline(status) {

    const stages = [
        {
            value: "shipped",
            label: deliveryText("deliveryShipped")
        },
        {
            value: "picked_up",
            label: deliveryText("deliveryPickedUp")
        },
        {
            value: "delivered",
            label: deliveryText("deliveryDelivered")
        }
    ];

    const currentIndex = stages.findIndex(
        stage => stage.value === status
    );

    return `
        <div class="delivery-tracking">

            <h4>${deliveryText("deliveryProgress")}</h4>

            <div class="delivery-tracking-steps">

                ${stages.map((stage, index) => {

                    const completed = currentIndex >= index;

                    return `
                        <div class="delivery-tracking-step
                            ${completed ? "completed" : ""}">

                            <span class="tracking-dot"></span>

                            <span class="tracking-label">
                                ${stage.label}
                            </span>

                        </div>
                    `;

                }).join("")}

            </div>

        </div>
    `;
}

    // ==========================================
    // ORDER PRODUCTS
    // ==========================================

    function createOrderItems(items) {

    if (!Array.isArray(items) || items.length === 0) {

        return `
            <div class="delivery-items-empty">
                ${deliveryText("deliveryProductDetailsUnavailable")}
            </div>
        `;
    }

    return `
        <div class="delivery-items-section">

            <h4>${deliveryText("deliveryOrderItems")}</h4>

            <div class="delivery-items-list">

                ${items.map(item => {

                    const productName = escapeHTML(
                        item.product_name || deliveryText("deliveryProduct")
                    );

                    const quantity = formatQuantity(item.quantity);
                    const price = formatAmount(item.price_per_unit);
                    const subtotal = formatAmount(item.subtotal);

                    return `
                        <div class="delivery-product-item">

                            <div class="delivery-product-info">

                                <strong>${productName}</strong>

                                <span>
                                    ${quantity} × ${price}
                                </span>

                            </div>

                            <strong class="delivery-product-subtotal">
                                ${subtotal}
                            </strong>

                        </div>
                    `;

                }).join("")}

            </div>

        </div>
    `;
}
    // ==========================================
    // CREATE ORDER CARD
    // ==========================================

    function createOrderCard(order, type) {

    const orderId = escapeHTML(order.order_id);
    const status = String(order.order_status || "shipped");
    const safeStatus = escapeHTML(status);

    const customer = escapeHTML(
        order.customer_name || order.full_name || deliveryText("deliveryCustomer")
    );

    const address = escapeHTML(
        order.delivery_address || deliveryText("deliveryAddressUnavailable")
    );

    const area = escapeHTML(
        order.delivery_area || deliveryText("deliveryAreaUnspecified")
    );

    const amount = formatAmount(order.total_amount);
    const orderDate = formatDate(order.order_date);
    const itemsHTML = createOrderItems(order.items);

    let actionButton = "";

    if (type === "available") {

        actionButton = `
            <button
                class="delivery-action-btn"
                data-action="accept"
                data-order-id="${orderId}">
                ${deliveryText("deliveryAccept")}
            </button>
        `;

    } else if (status === "shipped") {

        actionButton = `
            <button
                class="delivery-action-btn"
                data-action="picked_up"
                data-order-id="${orderId}">
                ${deliveryText("deliveryMarkPicked")}
            </button>
        `;

    } else if (status === "picked_up") {

        actionButton = `
            <button
                class="delivery-action-btn"
                data-action="delivered"
                data-order-id="${orderId}">
                ${deliveryText("deliveryMarkDelivered")}
            </button>
        `;
    }

    const trackingHTML = type === "mine"
        ? createTrackingTimeline(status)
        : "";

    return `
        <div class="delivery-card">

            <div class="delivery-card-header">
                <div>
                    <h3>${deliveryText("deliveryOrder")} #${orderId}</h3>
                    <span class="delivery-order-date">
                        ${escapeHTML(orderDate)}
                    </span>
                </div>

                <span class="status-badge status-${safeStatus}">
                    ${escapeHTML(formatStatus(status))}
                </span>
            </div>

            <div class="delivery-customer-section">

                <h4>${deliveryText("deliveryCustomerDetails")}</h4>

                <div class="delivery-details">

                    <div class="delivery-detail">
                        ${deliveryText("deliveryCustomer")}
                        <strong>${customer}</strong>
                    </div>

                    <div class="delivery-detail">
                        ${deliveryText("deliveryArea")}
                        <strong>${area}</strong>
                    </div>

                    <div class="delivery-detail">
                        ${deliveryText("deliveryAddress")}
                        <strong>${address}</strong>
                    </div>

                </div>
            </div>

            ${itemsHTML}

            <div class="delivery-order-total">
                <span>${deliveryText("deliveryTotalAmount")}</span>
                <strong>${escapeHTML(amount)}</strong>
            </div>

            ${trackingHTML}
            ${actionButton}

        </div>
    `;
}

    // ==========================================
    // LOAD AVAILABLE DELIVERIES
    // ==========================================

    async function loadAvailableDeliveries() {

    availableList.innerHTML = `
        <div class="loading-message">
            ${deliveryText("deliveryLoadingAvailableList")}
        </div>
    `;

    try {

        const result = await apiRequest("/available-deliveries");

        const orders = result.orders || [];

        availableCount.textContent = orders.length;

        if (result.availability) {
            updateAvailabilityDisplay(result.availability);
        }

        if (orders.length === 0) {

            availableList.innerHTML = `
                <div class="empty-message">
                    ${deliveryText("deliveryNoAvailable")}
                </div>
            `;

            return;
        }

        availableList.innerHTML = orders
            .map(order => createOrderCard(order, "available"))
            .join("");

    } catch (error) {

        showError(availableList, error.message);

        console.error("Available deliveries error:", error);
    }
}

    // ==========================================
    // LOAD MY DELIVERIES
    // ==========================================

    async function loadMyDeliveries() {

    myDeliveriesList.innerHTML = `
        <div class="loading-message">
            ${deliveryText("deliveryLoadingMine")}
        </div>
    `;

    try {

        const result = await apiRequest("/my-deliveries");

        const orders = result.orders || [];
        const stats = result.stats || {};

        const activeOrders = orders.filter(
            order => order.order_status !== "delivered"
        );

        const deliveredOrders = orders.filter(
            order => order.order_status === "delivered"
        );

        myDeliveryCount.textContent = activeOrders.length;

        completedCount.textContent =
            stats.delivered ?? deliveredOrders.length;

        if (orders.length === 0) {

            myDeliveriesList.innerHTML = `
                <div class="empty-message">
                    ${deliveryText("deliveryNoAccepted")}
                </div>
            `;

            return;
        }

        myDeliveriesList.innerHTML = orders
            .map(order => createOrderCard(order, "mine"))
            .join("");

    } catch (error) {

        showError(myDeliveriesList, error.message);

        console.error("My deliveries error:", error);
    }
}

    // ==========================================
    // UPDATE DELIVERY STATUS
    // ==========================================

    async function updateDeliveryStatus(orderId, newStatus, button) {

    const message = newStatus === "picked_up"
        ? deliveryText("deliveryConfirmPickup")
        : deliveryText("deliveryConfirmDelivered");

    if (!confirm(message)) return;

    button.disabled = true;
    button.textContent = deliveryText("deliveryUpdating");

    try {

        const result = await apiRequest(
            "/update-delivery-status",
            "POST",
            {
                order_id: Number(orderId),
                order_status: newStatus
            }
        );

        alert(
            result.message || deliveryText("deliveryStatusUpdated")
        );

        await loadProfile();
        await loadAvailableDeliveries();
        await loadMyDeliveries();

    } catch (error) {

        alert(error.message);

        button.disabled = false;

        button.textContent =
            newStatus === "picked_up"
                ? deliveryText("deliveryMarkPicked")
                : deliveryText("deliveryMarkDelivered");
    }
}

// =====================================
// ACCEPT DELIVERY
// =====================================

async function acceptDelivery(orderId, button) {

    if (!confirm(deliveryText("deliveryConfirmAccept"))) {
        return;
    }

    button.disabled = true;
    button.textContent = deliveryText("deliveryUpdating");

    try {

        const result = await apiRequest(
            "/accept-delivery",
            "POST",
            {
                order_id: Number(orderId)
            }
        );

        alert(
            result.message || deliveryText("deliveryAccepted")
        );

        await loadProfile();
        await loadAvailableDeliveries();
        await loadMyDeliveries();

    } catch (error) {

        alert(error.message);

        button.disabled = false;
        button.textContent = deliveryText("deliveryAccept");
    }
}

    // ==========================================
    // ORDER BUTTON EVENT HANDLING
    // ==========================================

    document.addEventListener("click", function (event) {

        const button = event.target.closest(".delivery-action-btn");

        if (!button) return;

        const orderId = button.dataset.orderId;

        const action = button.dataset.action;

        if (action === "accept") {
            acceptDelivery(orderId, button);
        }

        if (action === "picked_up") {
            updateDeliveryStatus(orderId, "picked_up", button);
        }

        if (action === "delivered") {
            updateDeliveryStatus(orderId, "delivered", button);
        }
    });

    // ==========================================
    // CHANGE AVAILABILITY
    // ==========================================

    availabilitySelect.addEventListener("change", async function () {

        const newAvailability = this.value;

        try {

            const result = await apiRequest(
                "/update-delivery-availability",
                "POST",
                {
                    availability: newAvailability
                }
            );

            updateAvailabilityDisplay(result.availability);

           alert(result.message || deliveryText("deliveryAvailabilityUpdated"));

            await loadAvailableDeliveries();

        } catch (error) {

            alert(error.message);

            await loadProfile();
        }
    });

    // ==========================================
    // REFRESH BUTTONS
    // ==========================================

    document.getElementById("refresh-available")
        .addEventListener("click", loadAvailableDeliveries);

    document.getElementById("refresh-mine")
        .addEventListener("click", loadMyDeliveries);

    // ==========================================
    // LOGOUT
    // ==========================================

    document.getElementById("logout-btn")
        .addEventListener("click", function () {

            window.location.href = "/logout";

        });

    // ==========================================
    // INITIAL DASHBOARD LOADING
    // ==========================================

    async function initializeDashboard() {

        await loadProfile();

        await Promise.all([
            loadAvailableDeliveries(),
            loadMyDeliveries()
        ]);
    }

    initializeDashboard();

});
