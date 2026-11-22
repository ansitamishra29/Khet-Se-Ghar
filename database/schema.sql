
CREATE DATABASE IF NOT EXISTS khet_se_ghar;
USE khet_se_ghar;

-- 1. Users: All four dashboard roles
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('farmer', 'customer', 'local_partner', 'delivery_boy') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farmer Profiles
CREATE TABLE farmer_profiles (
    farmer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    farm_name VARCHAR(150),
    address TEXT,
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 3. Customer Profiles
CREATE TABLE customer_profiles (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    delivery_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 4. Local Partner Profiles
CREATE TABLE local_partner_profiles (
    partner_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    business_name VARCHAR(150),
    service_area VARCHAR(150),
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 5. Delivery Boy Profiles
CREATE TABLE delivery_boy_profiles (
    delivery_boy_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    vehicle_number VARCHAR(30),
    availability ENUM('available', 'busy', 'inactive') DEFAULT 'available',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 6. Products
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_user_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    price_per_kg DECIMAL(10,2) NOT NULL,
    available_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'kg',
    product_status ENUM('available', 'unavailable') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_user_id) REFERENCES users(user_id)
);

-- 7. Harvest Records
CREATE TABLE harvest_records (
    harvest_id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_user_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    expected_quantity DECIMAL(10,2),
    expected_harvest_date DATE,
    harvest_status ENUM('upcoming', 'ready', 'completed') DEFAULT 'upcoming',
    FOREIGN KEY (farmer_user_id) REFERENCES users(user_id)
);

-- 8. Orders
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_user_id INT NOT NULL,
    partner_user_id INT,
    delivery_user_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_status ENUM(
        'pending', 'confirmed', 'processing',
        'shipped', 'delivered', 'cancelled'
    ) DEFAULT 'pending',
    FOREIGN KEY (customer_user_id) REFERENCES users(user_id),
    FOREIGN KEY (partner_user_id) REFERENCES users(user_id),
    FOREIGN KEY (delivery_user_id) REFERENCES users(user_id)
);

-- 9. Order Items
CREATE TABLE order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 10. Payments
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_method VARCHAR(50),
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'successful', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(150),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 11. Farmer Income and Expenses
CREATE TABLE income_expenses (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_user_id INT NOT NULL,
    transaction_type ENUM('income', 'expense') NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_user_id) REFERENCES users(user_id)
);
