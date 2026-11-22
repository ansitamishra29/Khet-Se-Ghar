
/* =====================================
   KHET SE GHAR - BUSINESS DASHBOARD
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    let businessProducts = [];

    loadBusinessProducts();
    loadBusinessOrders();
    updateBusinessCartCount();
    loadBusinessBulkOrders();
    loadBusinessBulkContributions();

    // =====================================
    // PRODUCT IMAGE MAPPING
    // =====================================

    function getBusinessProductImage(product) {

        const name = (product.product_name || "").toLowerCase();

        if (name.includes("banana")) {
            return "/images/Bananas.jpg";
        }

        if (name.includes("potato")) {
            return "/images/potatoes.jpg";
        }

        if (name.includes("tomato")) {
            return "/images/Tomatos.jpg";
        }

        if (name.includes("carrot")) {
            return "/images/carrots.jpg";
        }

        return null;
    }

    // =====================================
    // BUSINESS CART STORAGE
    // =====================================

    function getBusinessCart() {
        try {
            return JSON.parse(
                localStorage.getItem("khetSeGharBusinessCart")
            ) || [];
        } catch (error) {
            return [];
        }
    }

    function saveBusinessCart(cart) {
        localStorage.setItem(
            "khetSeGharBusinessCart",
            JSON.stringify(cart)
        );
    }

    // =====================================
    // UPDATE CART COUNT
    // =====================================

    function updateBusinessCartCount() {

        const cart = getBusinessCart();

        const totalItems = cart.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );

        const cartLink = document.querySelector(
            'a[href="business_cart.html"]'
        );

        if (cartLink) {
            cartLink.textContent = `My Cart (${totalItems})`;
        }
    }

    // =====================================
    // FIND PRODUCT IN CART
    // =====================================

    function findBusinessCartProduct(productId) {

        return getBusinessCart().find(
            item =>
                Number(item.product_id) === Number(productId)
        );
    }

    // =====================================
    // LOAD BUSINESS PRODUCTS
    // =====================================

    async function loadBusinessProducts() {

        const productContainer = document.getElementById(
            "business-products"
        );

        if (!productContainer) return;

        productContainer.innerHTML = "<p>Loading products...</p>";

        try {

            const response = await fetch("/business-products");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load products."
                );
            }

            businessProducts = data.products || [];

            if (businessProducts.length === 0) {

                productContainer.innerHTML =
                    "<p>No products are currently available.</p>";

                return;
            }

            productContainer.innerHTML = "";

            businessProducts.forEach(product => {

                const card = document.createElement("div");
                card.className = "business-product-card";

                // PRODUCT IMAGE

                const imageWrapper = document.createElement("div");
                imageWrapper.className = "business-product-image-wrapper";

                const imagePath = getBusinessProductImage(product);

                if (imagePath) {

                    const image = document.createElement("img");

                    image.src = imagePath;
                    image.alt = product.product_name;
                    image.className = "business-product-image";
                    image.loading = "lazy";

                    image.onerror = function () {
                        imageWrapper.innerHTML =
                            '<span class="business-image-fallback">Image unavailable</span>';
                    };

                    imageWrapper.appendChild(image);

                } else {

                    imageWrapper.innerHTML =
                        '<span class="business-image-fallback">Product image</span>';

                }

                // PRODUCT DETAILS

                const category = document.createElement("p");
                category.className = "business-product-category";
                category.textContent =
                    product.category || "Uncategorized";

                const name = document.createElement("h3");
                name.className = "business-product-name";
                name.textContent = product.product_name;

                const description = document.createElement("p");
                description.className = "business-product-description";
                description.textContent =
                    product.description || "Fresh farm produce";

                const price = document.createElement("p");
                price.className = "product-price";
                price.textContent =
                    `₹${Number(product.price_per_kg).toFixed(2)} / ${product.unit}`;

                const stock = document.createElement("p");
                stock.className = "product-stock";

                const availableStock = Number(product.available_quantity);

                stock.textContent =
                    `Available: ${availableStock} ${product.unit}`;

                if (availableStock <= 0) {
                    stock.classList.add("out-of-stock");
                    stock.textContent = "Currently out of stock";
                } else {
                    stock.classList.add("in-stock");
                }

                const farmer = document.createElement("p");
                farmer.className = "business-product-supplier";
                farmer.textContent =
                    `Supplier: ${product.farmer_name || "Local Farmer"}`;

                // ADD TO CART BUTTON

                const addButton = document.createElement("button");
                addButton.type = "button";
                addButton.textContent = "Add to Cart";
                addButton.className = "business-add-cart-btn";

                if (availableStock <= 0) {
                    addButton.disabled = true;
                    addButton.textContent = "Out of Stock";
                }

                // QUANTITY CONTROL

                const quantityControl = document.createElement("div");
                quantityControl.className = "business-quantity-control";
                quantityControl.hidden = true;

                const minusButton = document.createElement("button");
                minusButton.type = "button";
                minusButton.textContent = "−";
                minusButton.className = "business-quantity-minus";

                const quantityValue = document.createElement("span");
                quantityValue.className = "business-quantity-value";

                const plusButton = document.createElement("button");
                plusButton.type = "button";
                plusButton.textContent = "+";
                plusButton.className = "business-quantity-plus";

                quantityControl.append(
                    minusButton,
                    quantityValue,
                    plusButton
                );

                // ADD PRODUCT

                addButton.addEventListener("click", function () {
                    addBusinessProductToCart(product, 1);
                });

                // INCREASE QUANTITY

                plusButton.addEventListener("click", function () {
                    changeBusinessProductQuantity(product, 1);
                });

                // DECREASE QUANTITY

                minusButton.addEventListener("click", function () {
                    changeBusinessProductQuantity(product, -1);
                });

                // BUILD PRODUCT CARD

                card.append(
                    imageWrapper,
                    category,
                    name,
                    description,
                    price,
                    stock,
                    farmer,
                    addButton,
                    quantityControl
                );

                productContainer.appendChild(card);

                updateBusinessProductCard(card, product);

            });

        } catch (error) {

            console.error("Business Product Error:", error);

            productContainer.innerHTML =
                "<p>Unable to load products. Please try again.</p>";

        }

    }

    // =====================================
    // UPDATE PRODUCT CARD BUTTONS
    // =====================================

    function updateBusinessProductCard(card, product) {

        const addButton = card.querySelector(
            ".business-add-cart-btn"
        );

        const quantityControl = card.querySelector(
            ".business-quantity-control"
        );

        const quantityValue = card.querySelector(
            ".business-quantity-value"
        );

        const existingProduct = findBusinessCartProduct(
            product.product_id
        );

        if (existingProduct) {

            addButton.hidden = true;
            quantityControl.hidden = false;

            quantityValue.textContent =
                existingProduct.quantity;

        } else {

            addButton.hidden = false;
            quantityControl.hidden = true;

            quantityValue.textContent = "0";

        }
    }

    // =====================================
    // UPDATE ALL PRODUCT CARDS
    // =====================================

    function updateAllBusinessProductCards() {

        document.querySelectorAll(
            ".business-product-card"
        ).forEach(card => {

            const product = businessProducts.find(
                item =>
                    card.querySelector("h3").textContent ===
                    item.product_name
            );

            if (product) {
                updateBusinessProductCard(card, product);
            }

        });

        updateBusinessCartCount();
    }

    // =====================================
    // ADD PRODUCT TO BUSINESS CART
    // =====================================

    function addBusinessProductToCart(product, quantity) {

        const cart = getBusinessCart();

        const existingProduct = cart.find(
            item =>
                Number(item.product_id) ===
                Number(product.product_id)
        );

        const availableStock = Number(
            product.available_quantity
        );

        if (existingProduct) {

            if (
                Number(existingProduct.quantity) + quantity >
                availableStock
            ) {
                alert("Requested quantity exceeds available stock.");
                return;
            }

            existingProduct.quantity =
                Number(existingProduct.quantity) + quantity;

        } else {

            if (quantity > availableStock) {
                alert("Requested quantity exceeds available stock.");
                return;
            }

            cart.push({
                product_id: product.product_id,
                name: product.product_name,
                price: Number(product.price_per_kg),
                quantity: quantity,
                unit: product.unit,
                available_quantity: availableStock
            });

        }

        saveBusinessCart(cart);

        updateAllBusinessProductCards();

    }

    // =====================================
    // CHANGE PRODUCT QUANTITY
    // =====================================

    function changeBusinessProductQuantity(product, change) {

        const cart = getBusinessCart();

        const index = cart.findIndex(
            item =>
                Number(item.product_id) ===
                Number(product.product_id)
        );

        if (index === -1) return;

        const newQuantity =
            Number(cart[index].quantity) + change;

        if (newQuantity <= 0) {

            cart.splice(index, 1);

        } else {

            const stock = Number(
                product.available_quantity
            );

            if (newQuantity > stock) {
                alert("Requested quantity exceeds available stock.");
                return;
            }

            cart[index].quantity = newQuantity;

        }

        saveBusinessCart(cart);

        updateAllBusinessProductCards();

    }

    // =====================================
    // LOAD BUSINESS ORDERS AND STATISTICS
    // =====================================

    async function loadBusinessOrders() {

        const statsCards = document.querySelectorAll(
            ".business-stats .stat-card"
        );

        try {

            const response = await fetch("/business-orders");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load business orders."
                );
            }

            const stats = data.stats || {};

            if (statsCards.length >= 4) {

                statsCards[0].querySelector("h2").textContent =
                    Number(stats.total_orders || 0);

                statsCards[1].querySelector("h2").textContent =
                    Number(stats.pending_orders || 0);

                statsCards[2].querySelector("h2").textContent =
                    Number(stats.completed_orders || 0);

                statsCards[3].querySelector("h2").textContent =
                    "₹" + Number(
                        stats.total_spending || 0
                    ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });

            }

        } catch (error) {

            console.error("Business Statistics Error:", error);

        }

    }

    
    // =====================================
    // BULK PROCUREMENT - CREATE REQUIREMENT
    // =====================================

    const bulkForm = document.getElementById(
        "bulk-requirement-form"
    );

    if (bulkForm) {

        bulkForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const message = document.getElementById(
                "bulk-form-message"
            );

            const submitButton = bulkForm.querySelector(
                "button[type='submit']"
            );

            const bulkData = {
                product_name: document.getElementById(
                    "bulk-product-name"
                ).value.trim(),

                required_quantity: document.getElementById(
                    "bulk-required-quantity"
                ).value,

                unit: document.getElementById(
                    "bulk-unit"
                ).value,

                offered_price_per_unit: document.getElementById(
                    "bulk-offered-price"
                ).value,

                delivery_deadline: document.getElementById(
                    "bulk-deadline"
                ).value
            };

            try {

                submitButton.disabled = true;
                submitButton.textContent = "Publishing...";

                message.textContent = "";
                message.className = "bulk-form-message";

                const response = await fetch(
                    "/create-bulk-order",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "same-origin",
                        body: JSON.stringify(bulkData)
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to publish requirement."
                    );
                }

                message.textContent =
                    data.message || "Bulk requirement published successfully!";

                message.classList.add("success");

                bulkForm.reset();

                await loadBusinessBulkOrders();

            } catch (error) {

                message.textContent = error.message;
                message.classList.add("error");

            } finally {

                submitButton.disabled = false;
                submitButton.textContent = "Publish Bulk Requirement";

            }

        });

    }


    // =====================================
    // LOAD BUSINESS BULK REQUIREMENTS
    // =====================================

    async function loadBusinessBulkOrders() {

        const container = document.getElementById(
            "business-bulk-orders"
        );

        if (!container) return;

        container.textContent = "Loading bulk requirements...";

        try {

            const response = await fetch(
                "/business-bulk-orders",
                {
                    credentials: "same-origin"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            const orders = data.bulk_orders || [];

            container.innerHTML = "";

            if (orders.length === 0) {

                container.textContent =
                    "You have not created any bulk requirements yet.";

                return;
            }

            orders.forEach(order => {

                const card = document.createElement("div");
                card.className = "bulk-order-item";

                const title = document.createElement("h4");
                title.textContent = order.product_name;

                const quantity = document.createElement("p");
                quantity.textContent =
                    `Required: ${order.required_quantity} ${order.unit}`;

                const fulfilled = document.createElement("p");
                fulfilled.textContent =
                    `Accepted supply: ${order.fulfilled_quantity} ${order.unit}`;

                const price = document.createElement("p");
                price.textContent =
                    `Offered price: ₹${Number(
                        order.offered_price_per_unit
                    ).toFixed(2)} / ${order.unit}`;

                const deadline = document.createElement("p");
                deadline.textContent =
                    "Deadline: " +
                    (order.delivery_deadline
                        ? String(order.delivery_deadline).slice(0, 10)
                        : "Not specified");

                const status = document.createElement("span");
                status.className = "bulk-status";
                status.textContent = String(
                    order.order_status
                ).replaceAll("_", " ");

                card.append(
                    title,
                    quantity,
                    fulfilled,
                    price,
                    deadline,
                    status
                );

                container.appendChild(card);

            });

        } catch (error) {

            console.error("Business Bulk Orders Error:", error);

            container.textContent =
                "Unable to load bulk requirements.";

        }

    }


    // =====================================
    // LOAD FARMER CONTRIBUTIONS
    // =====================================

    async function loadBusinessBulkContributions() {

        const container = document.getElementById(
            "business-bulk-contributions"
        );

        if (!container) return;

        container.textContent = "Loading farmer contributions...";

        try {

            const response = await fetch(
                "/business-bulk-contributions",
                {
                    credentials: "same-origin"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            const contributions = data.contributions || [];

            container.innerHTML = "";

            if (contributions.length === 0) {

                container.textContent =
                    "No farmer contributions have been submitted yet.";

                return;
            }

            contributions.forEach(item => {

                const card = document.createElement("div");
                card.className = "bulk-contribution-item";

                const title = document.createElement("h4");
                title.textContent = item.product_name;

                const farmer = document.createElement("p");
                farmer.textContent =
                    `Farmer ID: ${item.farmer_user_id}`;

                const quantity = document.createElement("p");
                quantity.textContent =
                    `Contribution: ${item.contribution_quantity} ${item.unit}`;

                const price = document.createElement("p");
                price.textContent =
                    `Offered price: ₹${Number(
                        item.offered_price_per_unit
                    ).toFixed(2)} / ${item.unit}`;

                const status = document.createElement("span");
                status.className = "bulk-status";
                status.textContent = item.contribution_status;

                card.append(
                    title,
                    farmer,
                    quantity,
                    price,
                    status
                );

                if (item.contribution_status === "pending") {

                    const actions = document.createElement("div");
                    actions.className = "bulk-contribution-actions";

                    const acceptButton = document.createElement("button");
                    acceptButton.type = "button";
                    acceptButton.textContent = "Accept";
                    acceptButton.className = "bulk-accept-btn";

                    const rejectButton = document.createElement("button");
                    rejectButton.type = "button";
                    rejectButton.textContent = "Reject";
                    rejectButton.className = "bulk-reject-btn";

                    acceptButton.addEventListener("click", function () {
                        updateBulkContributionStatus(
                            item.contribution_id,
                            "accepted"
                        );
                    });

                    rejectButton.addEventListener("click", function () {
                        updateBulkContributionStatus(
                            item.contribution_id,
                            "rejected"
                        );
                    });

                    actions.append(
                        acceptButton,
                        rejectButton
                    );

                    card.appendChild(actions);

                }

                container.appendChild(card);

            });

        } catch (error) {

            console.error("Bulk Contributions Error:", error);

            container.textContent =
                "Unable to load farmer contributions.";

        }

    }


    // =====================================
    // ACCEPT OR REJECT CONTRIBUTION
    // =====================================

    async function updateBulkContributionStatus(
        contributionId,
        status
    ) {

        const confirmation = confirm(
            `Are you sure you want to ${status} this farmer contribution?`
        );

        if (!confirmation) return;

        try {

            const response = await fetch(
                "/update-bulk-contribution-status",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "same-origin",
                    body: JSON.stringify({
                        contribution_id: contributionId,
                        status: status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            alert(data.message);

            await loadBusinessBulkOrders();
            await loadBusinessBulkContributions();

        } catch (error) {

            alert(error.message);

        }

    }


    // =====================================
    // REFRESH CART WHEN RETURNING TO PAGE
    // =====================================

    window.addEventListener("pageshow", function () {

        updateAllBusinessProductCards();

        loadBusinessBulkOrders();
        loadBusinessBulkContributions();

    });

});

