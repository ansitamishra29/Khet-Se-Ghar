
document.addEventListener("DOMContentLoaded", function () {

    const requestsContainer = document.getElementById(
        "farmer-production-requests"
    );

    const bulkOrdersContainer = document.getElementById(
        "farmer-bulk-orders"
    );

    const bulkContributionsContainer = document.getElementById(
        "farmer-bulk-contributions"
    );

    let farmerRequests = [];
    let farmerBulkOrders = [];

    // Get translated text
    function t(key) {
        if (typeof window.ksgTranslate === "function") {
            return window.ksgTranslate(key);
        }

        return key;
    }

    // Safely display text received from the server
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    // =====================================
    // FARMER PRODUCTION REQUESTS
    // =====================================

    async function loadFarmerRequests() {

        if (!requestsContainer) {
            console.error("Production requests container not found.");
            return;
        }

        try {
            const response = await fetch("/farmer-production-requests", {
                method: "GET",
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                requestsContainer.innerHTML =
                    `<p>${escapeHTML(data.message || t("unableLoadRequests"))}</p>`;
                return;
            }

            farmerRequests = data.requests || [];
            displayFarmerRequests(farmerRequests);

        } catch (error) {
            console.error("Farmer Requests Error:", error);

            requestsContainer.innerHTML =
                `<p>${t("serverConnectionError")}</p>`;
        }
    }

    function displayFarmerRequests(requests) {

        if (!requestsContainer) return;

        if (!requests || requests.length === 0) {
            requestsContainer.innerHTML =
                `<p>${t("noProductionRequests")}</p>`;
            return;
        }

        requestsContainer.innerHTML = requests.map(request => {

            const status = request.request_status;

            let actionButtons = "";

            if (status === "pending") {
                actionButtons = `
                    <button type="button" class="accept-request"
                        data-id="${escapeHTML(request.request_id)}">
                        ${t("accept")}
                    </button>

                    <button type="button" class="reject-request"
                        data-id="${escapeHTML(request.request_id)}">
                        ${t("reject")}
                    </button>
                `;
            } else if (status === "accepted") {
                actionButtons = `
                    <button type="button" class="update-request"
                        data-id="${escapeHTML(request.request_id)}"
                        data-status="preparing">
                        ${t("startPreparing")}
                    </button>
                `;
            } else if (status === "preparing") {
                actionButtons = `
                    <button type="button" class="update-request"
                        data-id="${escapeHTML(request.request_id)}"
                        data-status="ready">
                        ${t("markReady")}
                    </button>
                `;
            }

            const translatedStatus = t("status_" + status);

            return `
                <div class="production-request-card">

                    <h3>${escapeHTML(request.product_name)}</h3>

                    <p>
                        <strong>${t("orderId")}:</strong>
                        #${escapeHTML(request.order_id)}
                    </p>

                    <p>
                        <strong>${t("requestedQuantity")}:</strong>
                        ${escapeHTML(request.requested_quantity)}
                        ${escapeHTML(request.unit || "kg")}
                    </p>

                    <p>
                        <strong>${t("localPartner")}:</strong>
                        ${escapeHTML(request.partner_name)}
                    </p>

                    <p>
                        <strong>${t("deliveryArea")}:</strong>
                        ${escapeHTML(request.delivery_area || t("notSpecified"))}
                    </p>

                    <p>
                        <strong>${t("status")}:</strong>
                        <span class="request-status ${escapeHTML(status)}">
                            ${translatedStatus}
                        </span>
                    </p>

                    <div class="request-actions">
                        ${actionButtons}
                    </div>

                </div>
            `;

        }).join("");
    }

    async function updateRequestStatus(requestId, requestStatus) {

        try {
            const response = await fetch("/update-farmer-request-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    request_id: requestId,
                    request_status: requestStatus
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || t("unableUpdateRequest"));
                return;
            }

            alert(data.message);
            loadFarmerRequests();

        } catch (error) {
            console.error("Update Request Error:", error);
            alert(t("serverConnectionError"));
        }
    }

    if (requestsContainer) {

        requestsContainer.addEventListener("click", function (event) {

            const button = event.target.closest("button");

            if (!button) return;

            const requestId = button.dataset.id;

            if (button.classList.contains("accept-request")) {
                updateRequestStatus(requestId, "accepted");
            }

            if (button.classList.contains("reject-request")) {
                if (confirm(t("confirmReject"))) {
                    updateRequestStatus(requestId, "rejected");
                }
            }

            if (button.classList.contains("update-request")) {
                updateRequestStatus(requestId, button.dataset.status);
            }

        });
    }

    // =====================================
    // FARMER BULK SUPPLY
    // =====================================

    async function loadFarmerBulkOrders() {

        if (!bulkOrdersContainer) return;

        try {
            const response = await fetch("/farmer-bulk-orders", {
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || t("unableLoadBulk"));
            }

            farmerBulkOrders = data.orders || [];
            displayFarmerBulkOrders(farmerBulkOrders);

        } catch (error) {
            console.error("Farmer Bulk Orders Error:", error);

            bulkOrdersContainer.innerHTML =
                `<p>${t("unableLoadBulk")}</p>`;
        }
    }

    function displayFarmerBulkOrders(orders) {

        if (!bulkOrdersContainer) return;

        if (!orders.length) {
            bulkOrdersContainer.innerHTML =
                `<p>${t("noOpenRequirements")}</p>`;
            return;
        }

        bulkOrdersContainer.innerHTML = orders.map(order => {

            const remaining = Math.max(
                0,
                Number(order.required_quantity) -
                Number(order.accepted_quantity || 0)
            );

            return `
                <div class="bulk-order-item">

                    <h4>${escapeHTML(order.product_name)}</h4>

                    <p>
                        <strong>${t("requirementId")}:</strong>
                        #${escapeHTML(order.bulk_order_id)}
                    </p>

                    <p>
                        <strong>${t("requiredQuantity")}:</strong>
                        ${escapeHTML(order.required_quantity)}
                        ${escapeHTML(order.unit)}
                    </p>

                    <p>
                        <strong>${t("alreadyAccepted")}:</strong>
                        ${escapeHTML(order.accepted_quantity || 0)}
                        ${escapeHTML(order.unit)}
                    </p>

                    <p>
                        <strong>${t("remainingQuantity")}:</strong>
                        ${remaining}
                        ${escapeHTML(order.unit)}
                    </p>

                    <p>
                        <strong>${t("offeredPrice")}:</strong>
                        ₹${Number(order.offered_price_per_unit).toFixed(2)}
                        / ${escapeHTML(order.unit)}
                    </p>

                    <p>
                        <strong>${t("deadline")}:</strong>
                        ${escapeHTML(order.delivery_deadline || t("notSpecified"))}
                    </p>

                    <label>
                        ${t("contributionQuantity")}
                        (${escapeHTML(order.unit)})
                    </label>

                    <input
                        type="number"
                        class="bulk-contribution-input"
                        data-id="${escapeHTML(order.bulk_order_id)}"
                        min="0.01"
                        step="0.01"
                        max="${remaining}"
                        placeholder="${t("enterQuantity")}"
                    >

                    <button
                        type="button"
                        class="bulk-contribute-btn"
                        data-id="${escapeHTML(order.bulk_order_id)}">
                        ${t("submitContribution")}
                    </button>

                </div>
            `;

        }).join("");
    }

    async function submitBulkContribution(orderId, quantity) {

        try {
            const response = await fetch("/submit-bulk-contribution", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    bulk_order_id: orderId,
                    contribution_quantity: quantity
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || t("unableSubmitContribution"));
                return;
            }

            alert(data.message || t("contributionSuccess"));

            loadFarmerBulkOrders();

        } catch (error) {
            console.error("Bulk Contribution Error:", error);
            alert(t("serverConnectionError"));
        }
    }

    if (bulkOrdersContainer) {

        bulkOrdersContainer.addEventListener("click", function (event) {

            const button = event.target.closest(".bulk-contribute-btn");

            if (!button) return;

            const orderId = button.dataset.id;

            const input = bulkOrdersContainer.querySelector(
                `.bulk-contribution-input[data-id="${orderId}"]`
            );

            if (!input) return;

            const quantity = Number(input.value);

            if (!Number.isFinite(quantity) || quantity <= 0) {
                alert(t("validContribution"));
                return;
            }

            if (quantity > Number(input.max)) {
                alert(t("exceedsRequirement"));
                return;
            }

            submitBulkContribution(orderId, quantity);

        });
    }

    // =====================================
    // LANGUAGE CHANGE
    // =====================================

    document.addEventListener("ksgLanguageChanged", function () {

        displayFarmerRequests(farmerRequests);
        displayFarmerBulkOrders(farmerBulkOrders);

    });

    // =====================================
    // INITIAL PAGE LOAD
    // =====================================

    loadFarmerRequests();
    loadFarmerBulkOrders();

});
