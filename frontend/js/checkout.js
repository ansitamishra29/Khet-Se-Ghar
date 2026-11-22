
/* =====================================
   KHET SE GHAR - CHECKOUT
===================================== */

// LOAD CART
let cart = [];

try {
    cart = JSON.parse(localStorage.getItem("khetSeGharCart")) || [];
} catch (error) {
    cart = [];
}


// DISPLAY ORDER SUMMARY
function displayCheckoutSummary() {

    const checkoutItems = document.getElementById("checkout-items");
    const checkoutTotal = document.getElementById("checkout-total");
    const placeOrderButton = document.getElementById("place-order-btn");

    if (!checkoutItems || !checkoutTotal) return;

    checkoutItems.innerHTML = "";

    if (cart.length === 0) {

        checkoutItems.innerHTML = "<p>Your cart is empty.</p>";
        checkoutTotal.textContent = "₹0.00";

        if (placeOrderButton) {
            placeOrderButton.disabled = true;
        }

        return;
    }

    let grandTotal = 0;

    cart.forEach(item => {

        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;

        const product = document.createElement("div");
        product.className = "checkout-item";

        const name = document.createElement("span");
        name.textContent = `${item.name} × ${item.quantity}`;

        const price = document.createElement("strong");
        price.textContent = `₹${itemTotal.toFixed(2)}`;

        product.append(name, price);
        checkoutItems.appendChild(product);

    });

    checkoutTotal.textContent = `₹${grandTotal.toFixed(2)}`;
}


// PLACE ORDER
const checkoutForm = document.getElementById("checkout-form");

if (checkoutForm) {

    checkoutForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const placeOrderButton = document.getElementById("place-order-btn");
        const checkoutMessage = document.getElementById("checkout-message");

        if (cart.length === 0) {
            checkoutMessage.textContent = "Your cart is empty!";
            return;
        }

        const address = document.getElementById("delivery-address").value.trim();

        // GET SELECTED DELIVERY AREA
        const deliveryArea = document.getElementById("delivery-area").value;

        const paymentMethod = document.querySelector(
            'input[name="payment_method"]:checked'
        );

        if (!address || !deliveryArea || !paymentMethod) {
            checkoutMessage.textContent =
                "Please enter your delivery address, select your delivery area and payment method.";
            return;
        }

        // PREPARE PRODUCT IDs AND QUANTITIES
        const orderItems = cart.map(item => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity)
        }));

        if (orderItems.some(item =>
            !Number.isInteger(item.product_id) ||
            item.product_id <= 0 ||
            !Number.isFinite(item.quantity) ||
            item.quantity <= 0
        )) {
            checkoutMessage.textContent =
                "Invalid cart information. Please return to your cart.";
            return;
        }

        placeOrderButton.disabled = true;
        placeOrderButton.textContent = "Placing Order...";

        checkoutMessage.textContent = "";

        try {

            const response = await fetch("/place-order", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    address: address,
                    delivery_area: deliveryArea,
                    payment_method: paymentMethod.value,
                    items: orderItems
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to place your order.");
            }

            // CLEAR CART ONLY AFTER SUCCESSFUL ORDER PLACEMENT
            localStorage.removeItem("khetSeGharCart");
            cart = [];

            displayCheckoutSummary();

            checkoutMessage.style.color = "green";

            checkoutMessage.textContent =
                `${result.message} Order ID: ${result.order_id}. Total: ₹${Number(result.total_amount).toFixed(2)}.`;

            placeOrderButton.textContent = "Order Placed!";

        } catch (error) {

            checkoutMessage.style.color = "red";
            checkoutMessage.textContent = error.message;

            placeOrderButton.disabled = false;
            placeOrderButton.textContent = "Place Order";

        }

    });

}


// INITIALIZE
displayCheckoutSummary();
