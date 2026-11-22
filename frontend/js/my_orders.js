
document.addEventListener("DOMContentLoaded", () => {
    loadMyOrders();
});

// ORDER TRACKING STAGES
const trackingStages = [
    "Order Placed",
    "Order Confirmed",
    "Being Prepared",
    "Shipped",
    "Out for Delivery",
    "Delivered"
];

// BACKEND STATUS TO TIMELINE INDEX
const statusIndexes = {
    pending: 0,
    confirmed: 1,
    processing: 2,
    shipped: 3,
    picked_up: 4,
    delivered: 5
};

// LOAD CUSTOMER ORDERS
async function loadMyOrders() {
    const ordersList = document.getElementById("orders-list");

    try {
        const response = await fetch("/my-orders");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load orders.");
        }

        if (!data.orders || data.orders.length === 0) {
            ordersList.textContent = "You haven't placed any orders yet.";
            ordersList.className = "empty-orders";
            return;
        }

        ordersList.innerHTML = "";
        ordersList.className = "";

        data.orders.forEach(order => {
            const orderCard = document.createElement("div");
            orderCard.className = "order-card";

            const orderDate = new Date(order.order_date)
                .toLocaleDateString("en-IN");

            const status = String(order.order_status || "pending")
                .toLowerCase();

            const displayStatus = status.replace(/_/g, " ");

            // PRODUCT DETAILS
            const itemsHTML = (order.items || []).map(item => `
                <p>
                    ${escapeHTML(item.product_name)}
                    × ${Number(item.quantity)}
                    — ₹${Number(item.subtotal).toFixed(2)}
                </p>
            `).join("");

            // TRACKING TIMELINE
            let trackingHTML = "";

            if (status === "cancelled") {
                trackingHTML = `
                    <div class="cancelled-message">
                        ✕ This order has been cancelled.
                    </div>
                `;
            } else {
                const currentIndex = statusIndexes[status];

                trackingHTML = `
                    <div class="tracking-section">
                        <h3 class="tracking-title">Order Tracking</h3>

                        <div class="tracking-timeline">
                            ${trackingStages.map((stage, index) => {
                                const completed =
                                    currentIndex !== undefined &&
                                    index <= currentIndex;

                                return `
                                    <div class="tracking-step ${completed ? "completed" : ""}">
                                        <div class="tracking-icon">
                                            ${completed ? "✓" : index + 1}
                                        </div>

                                        <div class="tracking-label">
                                            ${stage}
                                        </div>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                `;
            }

            // DISPLAY ORDER CARD
            orderCard.innerHTML = `
                <div class="order-top">
                    <div>
                        <span class="order-id">
                            Order #${escapeHTML(order.order_id)}
                        </span>

                        <p class="order-date">
                            ${escapeHTML(orderDate)}
                        </p>
                    </div>

                    <span class="order-status">
                        ${escapeHTML(displayStatus)}
                    </span>
                </div>

                ${trackingHTML}

                <div class="order-details">
                    ${itemsHTML}
                </div>

                <p class="order-address">
                    Delivery Address:
                    ${escapeHTML(order.delivery_address)}
                </p>

                <p class="order-total">
                    Total: ₹${Number(order.total_amount).toFixed(2)}
                </p>
            `;

            ordersList.appendChild(orderCard);
        });

    } catch (error) {
        console.error("My Orders Error:", error);

        ordersList.textContent =
            "Unable to load your orders. Please refresh the page.";

        ordersList.className = "empty-orders";
    }
}

// HTML ESCAPING
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}
