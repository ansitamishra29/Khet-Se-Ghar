# 🌾 Khet Se Ghar

### Connecting Farmers Directly to Better Opportunities

**Khet Se Ghar** is a multilingual agricultural marketplace designed to connect farmers, customers, local partners, delivery partners, and businesses through a single digital platform.

The platform helps farmers sell their agricultural products, enables customers to purchase fresh produce, and allows local partners to coordinate orders and deliveries efficiently.

---

## 🚀 Key Features

- **Multi-Role Authentication:** Separate accounts and dashboards for Farmers, Customers, Local Partners, Delivery Partners, and Businesses.
- **Farmer Dashboard:** Manage agricultural products and track sales.
- **Customer Dashboard:** Browse products, place orders, and manage purchases.
- **Local Partner Dashboard:** Coordinate orders and manage delivery operations.
- **Delivery Management:** Track order progress and update delivery statuses.
- **Business Marketplace:** Support business and bulk purchasing.
- **Multilingual Support:** English, Hindi, and Odia language options.
- **Voice Assistance:** Browser-based voice interaction with speech recognition and text-to-speech support.
- **Database Integration:** MySQL database for managing users, products, orders, and related information.

## 🛠️ Technologies Used

| Category | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Python |
| Database | MySQL |
| Database Connectivity | MySQL Connector |
| Voice Assistance | Web Speech API |
| Version Control | Git and GitHub |

## 📁 Project Structure

```text
KhetSeGhar/
│
├── backend/
│   ├── app.py
│   ├── db_connection.py
│   └── test_connection.py
│
├── database/
│   └── schema.sql
│
├── frontend/
│   ├── css/
│   ├── images/
│   ├── js/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── farmer_dashboard.html
│   ├── customer_dashboard.html
│   ├── partner_dashboard.html
│   ├── delivery_dashboard.html
│   └── business_dashboard.html
│
├── .env
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/khet-se-ghar.git
```

### 2. Navigate to the Project Folder

```bash
cd khet-se-ghar
```

### 3. Install Required Python Packages

```bash
python -m pip install mysql-connector-python python-dotenv
```

### 4. Configure the Database

- Make sure MySQL Server is installed and running.
- Create the project database and execute the SQL commands in `database/schema.sql`.
- Configure your database credentials in a `.env` file in the project root.

Example `.env` configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=khet_se_ghar
```

**Important:** Never upload your actual `.env` file or database password to GitHub.

### 5. Run the Application

From the main project directory, execute:

```bash
python backend/app.py
```

Open the application in your browser using the local address displayed by the server.

## 🎯 Project Objective

The primary objective of Khet Se Ghar is to create a digital agricultural marketplace that improves market accessibility for farmers, simplifies agricultural product purchasing, and supports efficient coordination between farmers, customers, local partners, and delivery services.

## 👩‍💻 Development

This project is developed as an academic project using Python, MySQL, HTML, CSS, and JavaScript.

---

**Khet Se Ghar — From the Farm to Your Home. 🌱**