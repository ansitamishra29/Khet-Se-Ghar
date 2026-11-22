
document.addEventListener("DOMContentLoaded", function () {

    const totalOrders = document.getElementById("total-orders");
    const pendingOrders = document.getElementById("pending-orders");
    const shippedOrders = document.getElementById("shipped-orders");
    const deliveredOrders = document.getElementById("delivered-orders");

    const ordersList = document.getElementById("partner-orders-list");
    const refreshButton = document.getElementById("refresh-orders");
    const logoutButton = document.getElementById("logout-btn");

    let farmerRequests = [];
    let currentOrders = [];

    // TRANSLATION HELPER
    function t(key) {

    const language = localStorage.getItem("ksg_language") || "en";

    const localTranslations = {
        noOrdersAssigned: {
            en: "No orders have been assigned to you yet.",
            hi: "अभी तक आपको कोई ऑर्डर नहीं सौंपा गया है।",
            or: "ଏପର୍ଯ୍ୟନ୍ତ ଆପଣଙ୍କୁ କୌଣସି ଅର୍ଡର ଦିଆଯାଇନାହିଁ।"
        }
    };

    if (localTranslations[key]) {
        return localTranslations[key][language] ||
               localTranslations[key].en;
    }

    return typeof window.ksgTranslate === "function"
        ? window.ksgTranslate(key)
        : key;
}

    // TRANSLATE ORDER AND REQUEST STATUSES
    function translateStatus(status) {
        const normalized = String(status || "pending").toLowerCase();
        const translated = t("status_" + normalized);

        return translated === "status_" + normalized
            ? normalized.toUpperCase()
            : translated;
    }

    // PREVENT HTML INJECTION
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    // FORMAT CURRENCY
    function formatCurrency(amount) {
        return "₹" + Number(amount || 0).toFixed(2);
    }

    // LOAD FARMER PRODUCTION REQUESTS
    async function loadFarmerRequests() {

        try {
            const response = await fetch("/partner-production-requests");
            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || t("unableLoadFarmerRequests")
                );
            }

            farmerRequests = result.requests || [];

        } catch (error) {
            console.error("Farmer Requests Error:", error);
            farmerRequests = [];
        }
    }

    // LOAD PARTNER ORDERS
    async function loadPartnerOrders() {

        ordersList.innerHTML = `
            <div class="loading-message">
                ${escapeHTML(t("loadingYourOrders"))}
            </div>
        `;

        try {

            const response = await fetch("/partner-orders");
            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || t("unableLoadOrders")
                );
            }

            // UPDATE STATISTICS
            totalOrders.textContent = result.stats.total_orders;
            pendingOrders.textContent = result.stats.pending_orders;
            shippedOrders.textContent = result.stats.shipped_orders;
            deliveredOrders.textContent = result.stats.delivered_orders;

            await loadFarmerRequests();

            currentOrders = result.orders || [];

            displayOrders(currentOrders);

        } catch (error) {

            console.error("Partner Dashboard Error:", error);

            ordersList.innerHTML = `
                <div class="loading-message">
                    ${escapeHTML(error.message || t("unableLoadOrders"))}
                </div>
            `;
        }
    }

    // SEND FARMER PRODUCTION REQUESTS
    async function sendFarmerRequests(orderId, button) {

        button.disabled = true;
        button.textContent = t("sendingRequests");

        try {

            const response = await fetch("/send-farmer-requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    order_id: orderId
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || t("unableSendFarmerRequests")
                );
            }

            alert(t("farmerRequestsSuccess"));

            await loadPartnerOrders();

        } catch (error) {

            console.error("Send Farmer Requests Error:", error);

            alert(error.message);

            button.disabled = false;
            button.textContent = t("sendFarmerRequests");
        }
    }

    // UPDATE ORDER STATUS
    async function updateOrderStatus(orderId, newStatus, button) {

        button.disabled = true;
        button.textContent = t("updating");

        try {

            const response = await fetch("/update-order-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    order_id: orderId,
                    order_status: newStatus
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || t("unableUpdateOrder")
                );
            }

            alert(t("orderUpdated"));

            await loadPartnerOrders();

        } catch (error) {

            console.error("Status Update Error:", error);

            alert(error.message);

            button.disabled = false;
            button.textContent = t(
                newStatus === "confirmed"
                    ? "confirmOrder"
                    : newStatus === "processing"
                        ? "startProcessing"
                        : "shipOrder"
            );
        }
    }

    // DISPLAY FARMER REQUESTS FOR AN ORDER
    function displayFarmerRequests(orderId) {

        const requests = farmerRequests.filter(request =>
            Number(request.order_id) === Number(orderId)
        );

        if (requests.length === 0) {
            return `
                <p class="no-farmer-requests">
                    ${escapeHTML(t("noFarmerRequests"))}
                </p>
            `;
        }

        return `
            <div class="farmer-requests-list">

                ${requests.map(request => {

                    const status = String(
                        request.request_status || "pending"
                    ).toLowerCase();

                    return `
                        <div class="farmer-request-item">

                            <p>
                                <strong>${escapeHTML(t("product"))}:</strong>
                                ${escapeHTML(request.product_name)}
                            </p>

                            <p>
                                <strong>${escapeHTML(t("farmer"))}:</strong>
                                ${escapeHTML(request.farmer_name)}
                            </p>

                            <p>
                                <strong>${escapeHTML(t("farm"))}:</strong>
                                ${escapeHTML(request.farm_name)}
                            </p>

                            <p>
                                <strong>${escapeHTML(t("requestedQuantity"))}:</strong>
                                ${Number(request.requested_quantity || 0).toFixed(2)}
                            </p>

                            <p>
                                <strong>${escapeHTML(t("requestStatus"))}:</strong>
                                <span class="request-status ${escapeHTML(status)}">
                                    ${escapeHTML(translateStatus(status))}
                                </span>
                            </p>

                        </div>
                    `;

                }).join("")}

            </div>
        `;
    }

    // DISPLAY CUSTOMER ORDERS
    function displayOrders(orders) {

        if (!orders || orders.length === 0) {

            ordersList.innerHTML = `
                <div class="loading-message">
                    ${escapeHTML(t("noOrdersAssigned"))}
                </div>
            `;

            return;
        }

        ordersList.innerHTML = orders.map(order => {

            const itemsHTML = (order.items || []).map(item => `
                <div class="order-product">
                    <span>
                        ${escapeHTML(item.product_name)}
                    </span>

                    <span>
                        ${Number(item.quantity).toFixed(2)}
                    </span>

                    <span>
                        ${formatCurrency(item.subtotal)}
                    </span>
                </div>
            `).join("");

            let actionButton = "";

            if (order.order_status === "pending") {

                actionButton = `
                    <button class="status-action-btn"
                        data-order-id="${escapeHTML(order.order_id)}"
                        data-status="confirmed">
                        ${escapeHTML(t("confirmOrder"))}
                    </button>
                `;

            } else if (order.order_status === "confirmed") {

                actionButton = `
                    <button class="status-action-btn"
                        data-order-id="${escapeHTML(order.order_id)}"
                        data-status="processing">
                        ${escapeHTML(t("startProcessing"))}
                    </button>
                `;

            } else if (order.order_status === "processing") {

                actionButton = `
                    <button class="status-action-btn"
                        data-order-id="${escapeHTML(order.order_id)}"
                        data-status="shipped">
                        ${escapeHTML(t("shipOrder"))}
                    </button>
                `;

            }

            const orderRequests = farmerRequests.filter(request =>
                Number(request.order_id) === Number(order.order_id)
            );

            let farmerRequestButton = "";

            if (
                ["confirmed", "processing"].includes(order.order_status) &&
                orderRequests.length === 0
            ) {
                farmerRequestButton = `
                    <button class="send-farmer-requests-btn"
                        data-order-id="${escapeHTML(order.order_id)}">
                        ${escapeHTML(t("sendFarmerRequests"))}
                    </button>
                `;
            }

            return `
                <div class="stat-card partner-order-card">

                    <h3>Order #${escapeHTML(order.order_id)}</h3>

                    <p>
                        <strong>${escapeHTML(t("customer"))}:</strong>
                        ${escapeHTML(order.customer_name)}
                    </p>

                    <p>
                        <strong>${escapeHTML(t("deliveryAddress"))}:</strong>
                        ${escapeHTML(order.delivery_address)}
                    </p>

                    <p>
                        <strong>${escapeHTML(t("deliveryArea"))}:</strong>
                        ${escapeHTML(order.delivery_area)}
                    </p>

                    <p>
                        <strong>${escapeHTML(t("orderDate"))}:</strong>
                        ${escapeHTML(order.order_date)}
                    </p>

                    <p>
                        <strong>${escapeHTML(t("status"))}:</strong>
                        ${escapeHTML(translateStatus(order.order_status))}
                    </p>

                    <h4>${escapeHTML(t("products"))}</h4>

                    ${itemsHTML}

                    <h3>
                        ${escapeHTML(t("total"))}: ${formatCurrency(order.total_amount)}
                    </h3>

                    <div class="farmer-production-section">

                        <h4>${escapeHTML(t("farmerProductionRequests"))}</h4>

                        ${displayFarmerRequests(order.order_id)}

                        ${farmerRequestButton}

                    </div>

                    <div class="order-actions">
                        ${actionButton}
                    </div>

                </div>
            `;

        }).join("");
    }

    // RE-RENDER DYNAMIC CONTENT WHEN LANGUAGE CHANGES
    document.addEventListener("ksgLanguageChanged", function () {
        displayOrders(currentOrders);
    });

    // HANDLE BUTTON CLICKS
    ordersList.addEventListener("click", function (event) {

        // SEND FARMER REQUESTS
        const farmerButton = event.target.closest(
            ".send-farmer-requests-btn"
        );

        if (farmerButton && !farmerButton.disabled) {

            const orderId = Number(farmerButton.dataset.orderId);

            if (orderId) {
                sendFarmerRequests(orderId, farmerButton);
            }

            return;
        }

        // UPDATE ORDER STATUS
        const statusButton = event.target.closest(".status-action-btn");

        if (!statusButton || statusButton.disabled) {
            return;
        }

        const orderId = Number(statusButton.dataset.orderId);
        const newStatus = statusButton.dataset.status;

        if (!orderId || !newStatus) {
            return;
        }

        updateOrderStatus(orderId, newStatus, statusButton);
    });

    // REFRESH ORDERS
    refreshButton.addEventListener("click", loadPartnerOrders);

    // LOGOUT
    logoutButton.addEventListener("click", function () {
        window.location.href = "/logout";
    });

    // LOAD DATA WHEN DASHBOARD OPENS
    loadPartnerOrders();

});
