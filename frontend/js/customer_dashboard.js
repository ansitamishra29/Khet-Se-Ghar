
/* =====================================
   KHET SE GHAR - CUSTOMER SHOPPING CART
===================================== */

// DATABASE PRODUCT IDs
const productIds = {
    "Fresh Potatoes": 1,
    "Fresh Tomatoes": 2,
    "Fresh Bananas": 3,
    "Fresh Carrots": 4
};

// LOAD SAVED CART
let cart = [];

try {
    cart = JSON.parse(localStorage.getItem("khetSeGharCart")) || [];

    // Add database IDs to previously saved cart items
    cart = cart.map(item => ({
        ...item,
        product_id: item.product_id || productIds[item.name]
    }));

} catch (error) {
    cart = [];
}

// SAVE CART
function saveCart() {
    localStorage.setItem("khetSeGharCart", JSON.stringify(cart));
}

// GET PRODUCT DETAILS
function getProductDetails(card) {

    const name = card.querySelector("h3").textContent.trim();

    const price = parseFloat(
        card.querySelector(".product-price").textContent.replace("₹", "")
    );

    const unit = card.querySelector(".product-price small")
        .textContent.replace("/", "").trim();

    return {
        product_id: productIds[name],
        name,
        price,
        unit
    };
}

// FIND PRODUCT IN CART
function findCartProduct(name, unit) {

    return cart.find(
        item => item.name === name && item.unit === unit
    );
}

// UPDATE CART COUNT
function updateCartCount() {

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const cartLink = document.querySelector('a[href="cart.html"]');

    if (cartLink) {
        cartLink.textContent = `My Cart (${totalItems})`;
    }
}

// UPDATE PRODUCT BUTTONS
function updateProductButtons() {

    document.querySelectorAll(".product-card").forEach(card => {

        const details = getProductDetails(card);

        const addButton = card.querySelector(".add-cart-btn");
        const quantityControl = card.querySelector(".quantity-control");
        const quantityValue = card.querySelector(".quantity-value");

        const existingProduct = findCartProduct(
            details.name,
            details.unit
        );

        if (existingProduct) {

            addButton.hidden = true;
            quantityControl.hidden = false;
            quantityValue.textContent = existingProduct.quantity;

        } else {

            addButton.hidden = false;
            quantityControl.hidden = true;
            quantityValue.textContent = 1;

        }

    });
}

// DISPLAY CART PRODUCTS
function displayCart() {

    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    if (!cartItems || !cartTotal) return;

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML =
            '<p class="empty-cart-message">Your cart is empty.</p>';

        cartTotal.textContent = "₹0";
        return;
    }

    let grandTotal = 0;

    cart.forEach((item, index) => {

        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;

        const product = document.createElement("div");
        product.className = "cart-product";

        const details = document.createElement("div");

        const name = document.createElement("h3");
        name.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = `₹${item.price} / ${item.unit}`;

        const quantity = document.createElement("p");
        quantity.textContent = `Quantity: ${item.quantity}`;

        details.append(name, price, quantity);

        const actions = document.createElement("div");

        const total = document.createElement("strong");
        total.textContent = `₹${itemTotal.toFixed(2)}`;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-cart-btn";
        removeButton.textContent = "Remove";
        removeButton.dataset.index = index;

        actions.append(total, removeButton);
        product.append(details, actions);

        cartItems.appendChild(product);

    });

    cartTotal.textContent = `₹${grandTotal.toFixed(2)}`;
}

// ADD PRODUCT TO CART
document.querySelectorAll(".add-cart-btn").forEach(button => {

    button.addEventListener("click", function () {

        const card = this.closest(".product-card");
        const details = getProductDetails(card);

        if (!details.product_id) {
            alert("This product is not registered in our database yet.");
            return;
        }

        const existingProduct = findCartProduct(
            details.name,
            details.unit
        );

        if (!existingProduct) {

            cart.push({
                product_id: details.product_id,
                name: details.name,
                price: details.price,
                quantity: 1,
                unit: details.unit
            });

        }

        saveCart();
        updateProductButtons();
        updateCartCount();
        displayCart();

    });

});

// INCREASE QUANTITY
document.querySelectorAll(".quantity-plus").forEach(button => {

    button.addEventListener("click", function () {

        const card = this.closest(".product-card");
        const details = getProductDetails(card);

        const product = findCartProduct(
            details.name,
            details.unit
        );

        if (product) {

            product.quantity++;

            saveCart();
            updateProductButtons();
            updateCartCount();
            displayCart();

        }

    });

});

// DECREASE QUANTITY
document.querySelectorAll(".quantity-minus").forEach(button => {

    button.addEventListener("click", function () {

        const card = this.closest(".product-card");
        const details = getProductDetails(card);

        const productIndex = cart.findIndex(
            item =>
                item.name === details.name &&
                item.unit === details.unit
        );

        if (productIndex !== -1) {

            cart[productIndex].quantity--;

            if (cart[productIndex].quantity <= 0) {
                cart.splice(productIndex, 1);
            }

            saveCart();
            updateProductButtons();
            updateCartCount();
            displayCart();

        }

    });

});

// REMOVE PRODUCT FROM CART PAGE
document.addEventListener("click", function (event) {

    const removeButton = event.target.closest(".remove-cart-btn");

    if (removeButton) {

        const index = parseInt(removeButton.dataset.index);

        if (!Number.isNaN(index) && index >= 0 && index < cart.length) {

            cart.splice(index, 1);

            saveCart();
            updateProductButtons();
            updateCartCount();
            displayCart();

        }

    }

});

// CHECKOUT BUTTON - TEMPORARY
// PROCEED TO CHECKOUT
const checkoutButton = document.getElementById("checkout-btn");

if (checkoutButton) {

    checkoutButton.addEventListener("click", function () {

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        window.location.href = "checkout.html";

    });

}

// INITIALIZE PAGE
saveCart();
updateProductButtons();
updateCartCount();
displayCart();

// REFRESH CART WHEN RETURNING TO THE CUSTOMER DASHBOARD
window.addEventListener("pageshow", function () {

    try {
        cart = JSON.parse(localStorage.getItem("khetSeGharCart")) || [];
    } catch (error) {
        cart = [];
    }

    updateProductButtons();
    updateCartCount();
    displayCart();

});