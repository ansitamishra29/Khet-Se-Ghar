
/* =====================================
   KHET SE GHAR - BUSINESS CART
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    const CART_KEY = "khetSeGharBusinessCart";

    const cartContent = document.getElementById("cart-content");
    const itemCount = document.getElementById("cart-item-count");
    const subtotalElement = document.getElementById("cart-subtotal");
    const grandTotalElement = document.getElementById("cart-grand-total");
    const checkoutButton = document.getElementById("business-checkout-btn");

    if (!cartContent) {
        console.error("Business cart container not found.");
        return;
    }

    // =====================================
    // GET CART
    // =====================================

    function getCart() {
        try {
            const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
            return Array.isArray(cart) ? cart : [];
        } catch (error) {
            console.error("Unable to read business cart:", error);
            return [];
        }
    }

    // =====================================
    // SAVE CART
    // =====================================

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    // =====================================
    // FORMAT PRICE
    // =====================================

    function formatPrice(amount) {
        return "₹" + Number(amount).toFixed(2);
    }

    // =====================================
    // LOAD CART
    // =====================================

    function loadCart() {

        const cart = getCart();

        cartContent.replaceChildren();

        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {

            const emptyBox = document.createElement("div");
            emptyBox.className = "empty-cart";

            const heading = document.createElement("h3");
            heading.textContent = "Your cart is empty";

            const message = document.createElement("p");
            message.textContent = "Browse the product catalogue and add products to your cart.";

            const shopLink = document.createElement("a");
            shopLink.href = "business_dashboard.html";
            shopLink.className = "shop-now-btn";
            shopLink.textContent = "Browse Products";

            emptyBox.append(heading, message, shopLink);
            cartContent.appendChild(emptyBox);

            updateSummary(0, 0);
            return;
        }

        cart.forEach(function (product, index) {

            const quantity = Number(product.quantity) || 0;
            const price = Number(product.price) || 0;
            const itemTotal = price * quantity;

            total += itemTotal;
            totalItems += quantity;

            const card = document.createElement("div");
            card.className = "cart-item";

            const info = document.createElement("div");
            info.className = "cart-item-info";

            const name = document.createElement("h3");
            name.textContent = product.name || "Product";

            const unit = document.createElement("p");
            unit.textContent = "Unit: " + (product.unit || "Kg");

            const priceText = document.createElement("p");
            priceText.textContent = "Price: " + formatPrice(price);

            const itemPrice = document.createElement("div");
            itemPrice.className = "cart-item-price";
            itemPrice.textContent = "Total: " + formatPrice(itemTotal);

            info.append(name, unit, priceText, itemPrice);

            const controls = document.createElement("div");
            controls.className = "quantity-controls";

            const minusButton = document.createElement("button");
            minusButton.type = "button";
            minusButton.textContent = "−";
            minusButton.setAttribute("aria-label", "Decrease quantity");

            minusButton.addEventListener("click", function () {
                updateQuantity(index, -1);
            });

            const quantityText = document.createElement("span");
            quantityText.textContent = quantity;

            const plusButton = document.createElement("button");
            plusButton.type = "button";
            plusButton.textContent = "+";
            plusButton.setAttribute("aria-label", "Increase quantity");

            plusButton.addEventListener("click", function () {
                updateQuantity(index, 1);
            });

            controls.append(minusButton, quantityText, plusButton);

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-btn";
            removeButton.textContent = "Remove";

            removeButton.addEventListener("click", function () {
                removeItem(index);
            });

            const actionBox = document.createElement("div");
            actionBox.append(controls, removeButton);

            card.append(info, actionBox);
            cartContent.appendChild(card);
        });

        updateSummary(totalItems, total);
    }

    // =====================================
    // UPDATE SUMMARY
    // =====================================

    function updateSummary(count, total) {

        if (itemCount) {
            itemCount.textContent = count;
        }

        if (subtotalElement) {
            subtotalElement.textContent = formatPrice(total);
        }

        if (grandTotalElement) {
            grandTotalElement.textContent = formatPrice(total);
        }

        if (checkoutButton) {
            checkoutButton.disabled = count === 0;
        }
    }

    // =====================================
    // UPDATE QUANTITY
    // =====================================

    function updateQuantity(index, change) {

        const cart = getCart();

        if (!cart[index]) {
            return;
        }

        const currentQuantity = Number(cart[index].quantity) || 0;
        const newQuantity = currentQuantity + change;

        if (newQuantity <= 0) {
            removeItem(index);
            return;
        }

        const availableQuantity = Number(cart[index].available_quantity);

        if (
            change > 0 &&
            Number.isFinite(availableQuantity) &&
            newQuantity > availableQuantity
        ) {
            alert("Sorry, only " + availableQuantity + " units are available.");
            return;
        }

        cart[index].quantity = newQuantity;

        saveCart(cart);
        loadCart();
    }

    // =====================================
    // REMOVE ITEM
    // =====================================

    function removeItem(index) {

        const cart = getCart();

        if (!cart[index]) {
            return;
        }

        cart.splice(index, 1);

        saveCart(cart);
        loadCart();
    }

    // =====================================
    // CHECKOUT
    // =====================================

    if (checkoutButton) {

        checkoutButton.addEventListener("click", async function () {

            const cart = getCart();

            if (cart.length === 0) {
                alert("Your cart is empty.");
                return;
            }

            const deliveryArea = prompt(
                "Enter your delivery area:\nMangalabag\nBadambadi\nCollege Square\nCDA"
            );

            if (!deliveryArea) {
                return;
            }

            const allowedAreas = [
                "Mangalabag",
                "Badambadi",
                "College Square",
                "CDA"
            ];

            const selectedArea = allowedAreas.find(
                area => area.toLowerCase() === deliveryArea.trim().toLowerCase()
            );

            if (!selectedArea) {
                alert("Please enter one of the available delivery areas.");
                return;
            }

            const confirmed = confirm(
                "Payment Method: Cash on Delivery\n\nDo you want to place this order?"
            );

            if (!confirmed) {
                return;
            }

            const originalButtonText = checkoutButton.textContent;

            checkoutButton.disabled = true;
            checkoutButton.textContent = "Placing Order...";

            try {

                const orderItems = cart.map(function (product) {

                    return {
                        product_id: Number(product.product_id),
                        quantity: Number(product.quantity)
                    };

                });

                const response = await fetch("/place-order", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        delivery_area: selectedArea,
                        payment_method: "Cash on Delivery",
                        items: orderItems
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Unable to place your order."
                    );
                }

                localStorage.removeItem(CART_KEY);

                loadCart();

                alert(
                    "Order placed successfully!\n" +
                    "Order ID: " + (result.order_id || "Confirmed") +
                    "\nTotal: " + formatPrice(
                        result.total_amount || result.total || 0
                    )
                );

            } catch (error) {

                alert(error.message || "Something went wrong during checkout.");

            } finally {

                checkoutButton.textContent = originalButtonText;
                checkoutButton.disabled = getCart().length === 0;

            }

        });
    }

    // =====================================
    // INITIAL LOAD
    // =====================================

    loadCart();

});
