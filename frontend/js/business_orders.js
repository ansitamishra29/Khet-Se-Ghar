
/* =====================================
   KHET SE GHAR - BUSINESS ORDERS
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    const ordersContainer = document.getElementById(
        "business-orders-container"
    );

    if (!ordersContainer) {
        console.error("Business orders container not found.");
        return;
    }

    // =====================================
    // HELPER FUNCTIONS
    // =====================================

    function formatPrice(amount) {
        return "₹" + Number(amount || 0).toFixed(2);
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined && text !== null) {
            element.textContent = text;
        }

        return element;
    }

    function formatDate(dateValue) {

        if (!dateValue) {
            return "Not available";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function normalizeStatus(status) {
        return String(status || "pending")
            .toLowerCase()
            .replace(/[\s-]+/g, "_");
    }

    function displayStatus(status) {
        return normalizeStatus(status)
            .replace(/_/g, " ")
            .replace(/\b\w/g, letter => letter.toUpperCase());
    }

    // =====================================
    // ORDER TRACKING
    // =====================================

    const trackingStages = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "picked_up",
        "delivered"
    ];

    function createTracking(status) {

        const normalized = normalizeStatus(status);

        const tracking = createElement("div", "order-tracking");

        tracking.appendChild(
            createElement("h3", "", "Delivery Progress")
        );

        if (normalized === "cancelled") {

            tracking.appendChild(
                createElement(
                    "p",
                    "orders-error",
                    "This order has been cancelled."
                )
            );

            return tracking;
        }

        const steps = createElement("div", "tracking-steps");

        const currentIndex = trackingStages.indexOf(normalized);

        trackingStages.forEach(function (stage, index) {

            const step = createElement("div", "tracking-step");

            if (currentIndex !== -1 && index < currentIndex) {
                step.classList.add("completed");
            } else if (index === currentIndex) {
                step.classList.add("current");
            }

            const dot = createElement("div", "tracking-dot");

            const label = createElement(
                "span",
                "",
                displayStatus(stage)
            );

            step.append(dot, label);
            steps.appendChild(step);

        });

        tracking.appendChild(steps);

        return tracking;
    }

    // =====================================
    // ORDER PRODUCT DETAILS
    // =====================================

    function createProducts(order) {

        const section = createElement("div", "order-products");

        section.appendChild(
            createElement("h3", "", "Purchased Products")
        );

        const items = Array.isArray(order.items)
            ? order.items
            : [];

        if (items.length === 0) {

            section.appendChild(
                createElement("p", "", "Product details unavailable.")
            );

            return section;
        }

        items.forEach(function (item) {

            const row = createElement("div", "order-product");

            const productName = createElement(
                "span",
                "order-product-name",
                (item.product_name || item.name || "Product") +
                " × " +
                Number(item.quantity || 0)
            );

            const price = createElement(
                "span",
                "order-product-price",
                formatPrice(
                    item.subtotal ??
                    (
                        Number(item.price_per_unit || item.price || 0) *
                        Number(item.quantity || 0)
                    )
                )
            );

            row.append(productName, price);
            section.appendChild(row);

        });

        return section;
    }

    // =====================================
    // ORDER INFORMATION
    // =====================================

    function addDetail(container, label, value) {

        const detail = createElement("div", "detail-item");

        detail.appendChild(
            createElement("small", "", label)
        );

        detail.appendChild(
            createElement(
                "strong",
                "",
                value !== undefined && value !== null && value !== ""
                    ? String(value)
                    : "Not available"
            )
        );

        container.appendChild(detail);
    }

    // =====================================
    // CREATE ORDER CARD
    // =====================================

    function createOrderCard(order) {

        const card = createElement(
            "article",
            "business-order-card"
        );

        const status = normalizeStatus(order.order_status);

        // HEADER

        const top = createElement("div", "order-top");

        const headingBox = createElement("div");

        headingBox.appendChild(
            createElement(
                "div",
                "order-id",
                "Order #" + (order.order_id || "N/A")
            )
        );

        headingBox.appendChild(
            createElement(
                "div",
                "order-date",
                "Placed on: " + formatDate(order.order_date)
            )
        );

        const statusBadge = createElement(
            "span",
            "order-status status-" + status,
            displayStatus(status)
        );

        top.append(headingBox, statusBadge);

        card.appendChild(top);

        // ORDER DETAILS

        const details = createElement("div", "order-details");

        addDetail(
            details,
            "Delivery Area",
            order.delivery_area
        );

        addDetail(
            details,
            "Delivery Address",
            order.delivery_address
        );

        addDetail(
            details,
            "Payment Method",
            order.payment_method
        );

        addDetail(
            details,
            "Payment Status",
            order.payment_status
        );

        addDetail(
            details,
            "Payment Amount",
            order.payment_amount !== undefined
                ? formatPrice(order.payment_amount)
                : "Not available"
        );

        addDetail(
            details,
            "Local Partner",
            order.partner_name || "Not assigned yet"
        );

        addDetail(
            details,
            "Delivery Person",
            order.delivery_name || "Not assigned yet"
        );

        addDetail(
            details,
            "Order Status",
            displayStatus(status)
        );

        if (order.transaction_id) {
            addDetail(
                details,
                "Transaction ID",
                order.transaction_id
            );
        }

        card.appendChild(details);

        // PRODUCTS

        card.appendChild(createProducts(order));

        // TRACKING

        card.appendChild(createTracking(status));

        // TOTAL AMOUNT

        const footer = createElement("div", "order-footer");

        footer.appendChild(
            createElement("span", "", "Total Order Amount")
        );

        footer.appendChild(
            createElement(
                "strong",
                "",
                formatPrice(order.total_amount)
            )
        );

        card.appendChild(footer);

        return card;
    }

    // =====================================
    // LOAD BUSINESS ORDERS
    // =====================================

    async function loadBusinessOrders() {

        ordersContainer.replaceChildren();

        ordersContainer.appendChild(
            createElement(
                "div",
                "orders-loading",
                "Loading your orders..."
            )
        );

        try {

            const response = await fetch("/business-orders", {
                method: "GET",
                credentials: "same-origin"
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to load your orders."
                );
            }

            const orders = Array.isArray(result.orders)
                ? result.orders
                : [];

            ordersContainer.replaceChildren();

            if (orders.length === 0) {

                const emptyBox = createElement("div", "no-orders");

                emptyBox.appendChild(
                    createElement("h3", "", "No Orders Yet")
                );

                emptyBox.appendChild(
                    createElement(
                        "p",
                        "",
                        "Your purchased products and order history will appear here."
                    )
                );

                ordersContainer.appendChild(emptyBox);
                return;
            }

            orders.forEach(function (order) {

                ordersContainer.appendChild(
                    createOrderCard(order)
                );

            });

        } catch (error) {

            console.error("Business orders error:", error);

            ordersContainer.replaceChildren();

            ordersContainer.appendChild(
                createElement(
                    "div",
                    "orders-error",
                    error.message || "Unable to load orders. Please try again."
                )
            );

            const retryButton = createElement(
                "button",
                "back-btn",
                "Try Again"
            );

            retryButton.type = "button";
            retryButton.style.marginTop = "15px";

            retryButton.addEventListener(
                "click",
                loadBusinessOrders
            );

            ordersContainer.appendChild(retryButton);
        }
    }

    // =====================================
    // INITIAL LOAD
    // =====================================

    loadBusinessOrders();

});
