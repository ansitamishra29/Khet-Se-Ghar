from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs
from http.cookies import SimpleCookie
from decimal import Decimal, InvalidOperation
import os
import json
import hashlib
import secrets

from db_connection import get_db_connection

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

active_sessions = {}


    # =========================================
    # CREATE SESSION
    # =========================================
def create_session(user_id, role):
        session_id = secrets.token_urlsafe(32)

        active_sessions[session_id] = {
            "user_id": user_id,
            "role": role
        }

        return session_id


    # =========================================
    # GET CURRENT SESSION
    # =========================================
def get_current_session(handler):
        cookie = SimpleCookie()
        cookie.load(handler.headers.get("Cookie", ""))

        if "session_id" not in cookie:
            return None

        return active_sessions.get(cookie["session_id"].value)


    # =========================================
    # PASSWORD HASHING
    # =========================================
def hash_password(password):
        salt = secrets.token_hex(16)

        hashed = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            600000
        ).hex()

        return f"{salt}${hashed}"


    # =========================================
    # VERIFY PASSWORD
    # =========================================
def verify_password(password, stored_hash):
        try:
            salt, original_hash = stored_hash.split("$")

            new_hash = hashlib.pbkdf2_hmac(
                "sha256",
                password.encode("utf-8"),
                salt.encode("utf-8"),
                600000
            ).hex()

            return secrets.compare_digest(new_hash, original_hash)

        except (ValueError, AttributeError):
            return False


    # =========================================
    # MAIN REQUEST HANDLER
    # =========================================
class KhetSeGharHandler(SimpleHTTPRequestHandler):

        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

        # =====================================
        # SEND JSON RESPONSE
        # =====================================
        def send_json(self, status_code, message, session_id=None):
            response = json.dumps(message).encode("utf-8")

            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")

            if session_id:
                self.send_header(
                    "Set-Cookie",
                    f"session_id={session_id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400"
                )

            self.send_header("Content-Length", str(len(response)))
            self.end_headers()
            self.wfile.write(response)

        # =====================================
        # READ JSON REQUEST
        # =====================================
        def read_json(self, maximum_size=10000):
            content_length = int(self.headers.get("Content-Length", 0))

            if content_length <= 0 or content_length > maximum_size:
                raise ValueError("Invalid request.")

            raw_data = self.rfile.read(content_length).decode("utf-8")
            return json.loads(raw_data)

        # =====================================
        # CHECK DELIVERY BOY SESSION
        # =====================================
        def get_delivery_boy_session(self):
            session = get_current_session(self)

            if session is None or session["role"] != "delivery_boy":
                self.send_json(401, {
                    "message": "Please log in as a delivery boy."
                })
                return None

            return session

        # =====================================
        # AUTOMATIC ROUND-ROBIN PARTNER ASSIGNMENT
        # =====================================
        def assign_local_partner(self, cursor, delivery_area):

            cursor.execute(
                """
                INSERT IGNORE INTO partner_area_rotation
                (service_area, last_partner_user_id)
                VALUES (%s, NULL)
                """,
                (delivery_area,)
            )

            cursor.execute(
                """
                SELECT last_partner_user_id
                FROM partner_area_rotation
                WHERE service_area = %s
                FOR UPDATE
                """,
                (delivery_area,)
            )

            rotation = cursor.fetchone()

            if rotation is None:
                raise Exception("Partner rotation record could not be found.")

            last_partner_id = rotation[0]

            cursor.execute(
                """
                SELECT user_id, partner_id
                FROM local_partner_profiles
                WHERE LOWER(TRIM(service_area)) = LOWER(TRIM(%s))
                ORDER BY partner_id ASC
                FOR UPDATE
                """,
                (delivery_area,)
            )

            partners = cursor.fetchall()

            if not partners:
                return None

            selected_partner_id = partners[0][0]

            if last_partner_id is not None:
                for index, partner in enumerate(partners):
                    if partner[0] == last_partner_id:
                        next_index = (index + 1) % len(partners)
                        selected_partner_id = partners[next_index][0]
                        break

            cursor.execute(
                """
                UPDATE partner_area_rotation
                SET last_partner_user_id = %s
                WHERE service_area = %s
                """,
                (selected_partner_id, delivery_area)
            )

            return selected_partner_id

        # =====================================
        # BUILD ORDER LIST WITH ITEMS
        # =====================================
        def build_order_list(self, rows):
            orders = {}

            for row in rows:
                order_id = row["order_id"]

                if order_id not in orders:
                    orders[order_id] = {
                        "order_id": order_id,
                        "order_date": str(row["order_date"]),
                        "customer_name": row["customer_name"],
                        "delivery_address": row["delivery_address"],
                        "delivery_area": row["delivery_area"],
                        "total_amount": float(row["total_amount"]),
                        "order_status": row["order_status"],
                        "items": []
                    }

                if row["product_id"] is not None:
                    orders[order_id]["items"].append({
                        "product_id": row["product_id"],
                        "product_name": row["product_name"],
                        "quantity": float(row["quantity"]),
                        "price_per_unit": float(row["price_per_unit"]),
                        "subtotal": float(row["subtotal"])
                    })

            return list(orders.values())

        # =====================================
        # COMMON DELIVERY ORDER QUERY
        # =====================================
        def get_delivery_orders(self, cursor, condition, parameters):
            cursor.execute(
                """
                SELECT
                    o.order_id,
                    o.order_date,
                    o.delivery_address,
                    o.delivery_area,
                    o.total_amount,
                    o.order_status,
                    u.full_name AS customer_name,
                    oi.product_id,
                    p.product_name,
                    oi.quantity,
                    oi.price_per_unit,
                    oi.subtotal
                FROM orders o
                LEFT JOIN users u
                    ON o.customer_user_id = u.user_id
                LEFT JOIN order_items oi
                    ON o.order_id = oi.order_id
                LEFT JOIN products p
                    ON oi.product_id = p.product_id
                WHERE
                """ + condition + """
                ORDER BY o.order_date DESC
                """,
                parameters
            )

            return self.build_order_list(cursor.fetchall())

        # =========================================
        # PLACE CUSTOMER OR BUSINESS ORDER
        # =========================================
        def handle_place_order(self):
            session = get_current_session(self)

            if session is None:
                self.send_json(401, {
                    "message": "Please log in to place an order."
                })
                return

            if session["role"] not in ["customer", "business"]:
                self.send_json(403, {
                    "message": "Your account is not allowed to place orders."
                })
                return

            connection = None
            cursor = None

            try:
                data = self.read_json(20000)

                if not isinstance(data, dict):
                    self.send_json(400, {
                        "message": "Invalid order information."
                    })
                    return

                delivery_area = str(data.get("delivery_area", "")).strip()
                payment_method = str(data.get("payment_method", "")).strip()
                items = data.get("items", [])

                allowed_areas = [
                    "Mangalabag",
                    "Badambadi",
                    "College Square",
                    "CDA"
                ]

                matching_area = next(
                    (area for area in allowed_areas
                    if area.lower() == delivery_area.lower()),
                    None
                )

                if matching_area is None:
                    self.send_json(400, {
                        "message": "Please select a valid delivery area."
                    })
                    return

                delivery_area = matching_area

                if payment_method != "Cash on Delivery":
                    self.send_json(400, {
                        "message": "Invalid payment method."
                    })
                    return

                if not isinstance(items, list) or not items:
                    self.send_json(400, {
                        "message": "Your cart is empty."
                    })
                    return

                requested_items = {}

                for item in items:
                    if not isinstance(item, dict):
                        self.send_json(400, {
                            "message": "Invalid cart item."
                        })
                        return

                    try:
                        product_id = int(item["product_id"])
                        quantity = Decimal(str(item["quantity"]))
                    except (KeyError, ValueError, TypeError, InvalidOperation):
                        self.send_json(400, {
                            "message": "Invalid product or quantity."
                        })
                        return

                    if (product_id <= 0 or not quantity.is_finite()
                            or quantity <= 0):
                        self.send_json(400, {
                            "message": "Please enter a valid product quantity."
                        })
                        return

                    requested_items[product_id] = (
                        requested_items.get(product_id, Decimal("0")) + quantity
                    )

                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor()
                connection.start_transaction()

                if session["role"] == "customer":
                    address = str(data.get("address", "")).strip()

                    if not address:
                        connection.rollback()
                        self.send_json(400, {
                            "message": "Please provide your delivery address."
                        })
                        return
                else:
                    cursor.execute(
                        """
                        SELECT business_address
                        FROM business_profiles
                        WHERE user_id = %s
                        """,
                        (session["user_id"],)
                    )

                    business_profile = cursor.fetchone()

                    if business_profile is None:
                        connection.rollback()
                        self.send_json(404, {
                            "message": "Business profile not found."
                        })
                        return

                    address = str(business_profile[0] or "").strip()

                    if not address:
                        connection.rollback()
                        self.send_json(400, {
                            "message": "Please update your business address."
                        })
                        return

                # KEEP EXISTING ROUND-ROBIN PARTNER ASSIGNMENT
                partner_user_id = self.assign_local_partner(cursor, delivery_area)

                if partner_user_id is None:
                    connection.rollback()
                    self.send_json(400, {
                        "message": "Delivery is currently unavailable in this area."
                    })
                    return

                order_products = []
                grand_total = Decimal("0")

                for product_id, quantity in requested_items.items():
                    cursor.execute(
                        """
                        SELECT product_name, price_per_kg,
                            available_quantity, product_status
                        FROM products
                        WHERE product_id = %s
                        FOR UPDATE
                        """,
                        (product_id,)
                    )

                    product = cursor.fetchone()

                    if product is None or product[3] != "available":
                        connection.rollback()
                        self.send_json(400, {
                            "message": "One of the selected products is unavailable."
                        })
                        return

                    product_name = product[0]
                    price = Decimal(str(product[1]))
                    available_quantity = Decimal(str(product[2]))

                    if quantity > available_quantity:
                        connection.rollback()
                        self.send_json(400, {
                            "message": product_name +
                            " does not have enough stock available."
                        })
                        return

                    subtotal = price * quantity
                    grand_total += subtotal

                    order_products.append({
                        "product_id": product_id,
                        "quantity": quantity,
                        "price": price,
                        "subtotal": subtotal
                    })

                cursor.execute(
                    """
                    INSERT INTO orders
                    (
                        customer_user_id,
                        partner_user_id,
                        delivery_address,
                        delivery_area,
                        total_amount,
                        order_status
                    )
                    VALUES (%s, %s, %s, %s, %s, 'pending')
                    """,
                    (
                        session["user_id"],
                        partner_user_id,
                        address,
                        delivery_area,
                        grand_total
                    )
                )

                order_id = cursor.lastrowid

                for item in order_products:
                    cursor.execute(
                        """
                        INSERT INTO order_items
                        (order_id, product_id, quantity, price_per_unit, subtotal)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (
                            order_id,
                            item["product_id"],
                            item["quantity"],
                            item["price"],
                            item["subtotal"]
                        )
                    )

                    cursor.execute(
                        """
                        UPDATE products
                        SET available_quantity = available_quantity - %s
                        WHERE product_id = %s
                        AND available_quantity >= %s
                        """,
                        (
                            item["quantity"],
                            item["product_id"],
                            item["quantity"]
                        )
                    )

                    if cursor.rowcount != 1:
                        raise Exception("Product stock could not be updated.")

                cursor.execute(
                    """
                    INSERT INTO payments
                    (order_id, payment_method, payment_amount, payment_status)
                    VALUES (%s, %s, %s, 'pending')
                    """,
                    (order_id, payment_method, grand_total)
                )

                connection.commit()

                self.send_json(201, {
                    "message": "Your order has been placed successfully!",
                    "order_id": order_id,
                    "total_amount": float(grand_total)
                })

            except Exception as error:
                if connection and connection.is_connected():
                    connection.rollback()

                print("Order Error:", error)

                self.send_json(500, {
                    "message": "Unable to place your order. Please try again."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =========================================
        # GET PRODUCTS FOR BUSINESS DASHBOARD
        # =========================================
        def handle_business_products(self):

            session = get_current_session(self)

            if session is None or session["role"] != "business":
                self.send_json(401, {
                    "message": "Please log in as a business account."
                })
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT
                        p.product_id,
                        p.product_name,
                        p.category,
                        p.description,
                        p.price_per_kg,
                        p.available_quantity,
                        p.unit,
                        u.full_name AS farmer_name
                    FROM products p
                    LEFT JOIN users u
                        ON p.farmer_user_id = u.user_id
                    WHERE p.product_status = 'available'
                    AND p.available_quantity > 0
                    ORDER BY p.product_name ASC
                    """
                )

                products = cursor.fetchall()

                for product in products:
                    product["price_per_kg"] = float(
                        product["price_per_kg"]
                    )

                    product["available_quantity"] = float(
                        product["available_quantity"]
                    )

                self.send_json(200, {
                    "products": products
                })

            except Exception as error:
                print("Business Products Error:", error)

                self.send_json(500, {
                    "message": "Unable to retrieve products."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =========================================
        # GET BUSINESS ORDERS AND DASHBOARD STATS
        # =========================================
        def handle_business_orders(self):

            session = get_current_session(self)

            if session is None or session["role"] != "business":
                self.send_json(401, {
                    "message": "Please log in as a business account."
                })
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)
                user_id = session["user_id"]

                # BUSINESS STATISTICS
                cursor.execute(
                    """
                    SELECT
                        COUNT(*) AS total_orders,
                        COALESCE(
                            SUM(
                                CASE
                                    WHEN order_status != 'delivered'
                                    THEN 1 ELSE 0
                                END
                            ), 0
                        ) AS pending_orders,
                        COALESCE(
                            SUM(
                                CASE
                                    WHEN order_status = 'delivered'
                                    THEN 1 ELSE 0
                                END
                            ), 0
                        ) AS completed_orders,
                        COALESCE(SUM(total_amount), 0) AS total_spending
                    FROM orders
                    WHERE customer_user_id = %s
                    """,
                    (user_id,)
                )

                stats = cursor.fetchone()

                # BUSINESS ORDERS WITH DELIVERY AND PAYMENT DETAILS
                cursor.execute(
                    """
                    SELECT
                        o.order_id,
                        o.order_date,
                        o.total_amount,
                        o.order_status,
                        o.delivery_address,
                        o.delivery_area,
                        o.partner_user_id,
                        o.delivery_user_id,

                        partner.full_name AS partner_name,
                        delivery.full_name AS delivery_name,

                        GROUP_CONCAT(
                            DISTINCT p.product_name
                            ORDER BY p.product_name
                            SEPARATOR ', '
                        ) AS product_name,

                        COALESCE(SUM(oi.quantity), 0) AS quantity,

                        (
                            SELECT payment_method
                            FROM payments
                            WHERE order_id = o.order_id
                            ORDER BY payment_date DESC
                            LIMIT 1
                        ) AS payment_method,

                        (
                            SELECT payment_amount
                            FROM payments
                            WHERE order_id = o.order_id
                            ORDER BY payment_date DESC
                            LIMIT 1
                        ) AS payment_amount,

                        (
                            SELECT payment_status
                            FROM payments
                            WHERE order_id = o.order_id
                            ORDER BY payment_date DESC
                            LIMIT 1
                        ) AS payment_status,

                        (
                            SELECT transaction_id
                            FROM payments
                            WHERE order_id = o.order_id
                            ORDER BY payment_date DESC
                            LIMIT 1
                        ) AS transaction_id

                    FROM orders o

                    LEFT JOIN order_items oi
                        ON o.order_id = oi.order_id

                    LEFT JOIN products p
                        ON oi.product_id = p.product_id

                    LEFT JOIN users partner
                        ON o.partner_user_id = partner.user_id

                    LEFT JOIN users delivery
                        ON o.delivery_user_id = delivery.user_id

                    WHERE o.customer_user_id = %s

                    GROUP BY
                        o.order_id,
                        o.order_date,
                        o.total_amount,
                        o.order_status,
                        o.delivery_address,
                        o.delivery_area,
                        o.partner_user_id,
                        o.delivery_user_id,
                        partner.full_name,
                        delivery.full_name

                    ORDER BY o.order_date DESC
                    LIMIT 20
                    """,
                    (user_id,)
                )

                orders = cursor.fetchall()

                # INDIVIDUAL PRODUCT DETAILS
                cursor.execute(
                    """
                    SELECT
                        oi.order_id,
                        oi.product_id,
                        p.product_name,
                        oi.quantity,
                        oi.price_per_unit,
                        oi.subtotal

                    FROM order_items oi

                    INNER JOIN orders o
                        ON oi.order_id = o.order_id

                    LEFT JOIN products p
                        ON oi.product_id = p.product_id

                    WHERE o.customer_user_id = %s

                    ORDER BY oi.item_id
                    """,
                    (user_id,)
                )

                order_items = cursor.fetchall()

                # ORGANIZE PRODUCTS UNDER THEIR ORDERS
                items_by_order = {}

                for item in order_items:
                    order_id = item["order_id"]

                    if order_id not in items_by_order:
                        items_by_order[order_id] = []

                    items_by_order[order_id].append({
                        "product_id": item["product_id"],
                        "product_name": item["product_name"] or "Product unavailable",
                        "quantity": float(item["quantity"]),
                        "price_per_unit": float(item["price_per_unit"]),
                        "subtotal": float(item["subtotal"])
                    })

                # FORMAT ORDER INFORMATION
                for order in orders:
                    order["order_date"] = str(order["order_date"])
                    order["total_amount"] = float(order["total_amount"])
                    order["quantity"] = float(order["quantity"])

                    order["product_name"] = (
                        order["product_name"] or "Product unavailable"
                    )

                    order["payment_amount"] = (
                        float(order["payment_amount"])
                        if order["payment_amount"] is not None
                        else 0.0
                    )

                    order["items"] = items_by_order.get(
                        order["order_id"], []
                    )

                self.send_json(200, {
                    "stats": {
                        "total_orders": int(stats["total_orders"]),
                        "pending_orders": int(stats["pending_orders"]),
                        "completed_orders": int(stats["completed_orders"]),
                        "total_spending": float(stats["total_spending"])
                    },
                    "orders": orders
                })

            except Exception as error:
                print("Business Orders Error:", error)

                self.send_json(500, {
                    "message": "Unable to retrieve business orders."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # GET ORDERS OF LOGGED-IN CUSTOMER
        # =====================================
        def handle_my_orders(self):
            session = get_current_session(self)

            if session is None or session["role"] != "customer":
                self.send_json(401, {
                    "message": "Please log in as a customer."
                })
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT
                        o.order_id,
                        o.order_date,
                        o.delivery_address,
                        o.total_amount,
                        o.order_status,
                        oi.product_id,
                        p.product_name,
                        oi.quantity,
                        oi.price_per_unit,
                        oi.subtotal
                    FROM orders o
                    LEFT JOIN order_items oi
                        ON o.order_id = oi.order_id
                    LEFT JOIN products p
                        ON oi.product_id = p.product_id
                    WHERE o.customer_user_id = %s
                    ORDER BY o.order_date DESC
                    """,
                    (session["user_id"],)
                )

                rows = cursor.fetchall()
                orders = {}

                for row in rows:
                    order_id = row["order_id"]

                    if order_id not in orders:
                        orders[order_id] = {
                            "order_id": order_id,
                            "order_date": str(row["order_date"]),
                            "delivery_address": row["delivery_address"],
                            "total_amount": float(row["total_amount"]),
                            "order_status": row["order_status"],
                            "items": []
                        }

                    if row["product_id"] is not None:
                        orders[order_id]["items"].append({
                            "product_id": row["product_id"],
                            "product_name": row["product_name"],
                            "quantity": float(row["quantity"]),
                            "price_per_unit": float(row["price_per_unit"]),
                            "subtotal": float(row["subtotal"])
                        })

                self.send_json(200, {
                    "orders": list(orders.values())
                })

            except Exception as error:
                print("My Orders Error:", error)

                self.send_json(500, {
                    "message": "Unable to retrieve your orders."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # GET ORDERS ASSIGNED TO LOCAL PARTNER
        # =====================================
        def handle_partner_orders(self):
            session = get_current_session(self)

            if session is None or session["role"] != "local_partner":
                self.send_json(401, {
                    "message": "Please log in as a local partner."
                })
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT
                        o.order_id,
                        o.order_date,
                        o.delivery_address,
                        o.delivery_area,
                        o.total_amount,
                        o.order_status,
                        u.full_name AS customer_name,
                        oi.product_id,
                        p.product_name,
                        oi.quantity,
                        oi.price_per_unit,
                        oi.subtotal
                    FROM orders o
                    LEFT JOIN users u
                        ON o.customer_user_id = u.user_id
                    LEFT JOIN order_items oi
                        ON o.order_id = oi.order_id
                    LEFT JOIN products p
                        ON oi.product_id = p.product_id
                    WHERE o.partner_user_id = %s
                    ORDER BY o.order_date DESC
                    """,
                    (session["user_id"],)
                )

                rows = cursor.fetchall()
                orders = {}

                for row in rows:
                    order_id = row["order_id"]

                    if order_id not in orders:
                        orders[order_id] = {
                            "order_id": order_id,
                            "order_date": str(row["order_date"]),
                            "customer_name": row["customer_name"],
                            "delivery_address": row["delivery_address"],
                            "delivery_area": row["delivery_area"],
                            "total_amount": float(row["total_amount"]),
                            "order_status": row["order_status"],
                            "items": []
                        }

                    if row["product_id"] is not None:
                        orders[order_id]["items"].append({
                            "product_id": row["product_id"],
                            "product_name": row["product_name"],
                            "quantity": float(row["quantity"]),
                            "price_per_unit": float(row["price_per_unit"]),
                            "subtotal": float(row["subtotal"])
                        })

                order_list = list(orders.values())

                stats = {
                    "total_orders": len(order_list),
                    "pending_orders": 0,
                    "shipped_orders": 0,
                    "delivered_orders": 0
                }

                for order in order_list:
                    status = order["order_status"]

                    if status == "pending":
                        stats["pending_orders"] += 1
                    elif status == "shipped":
                        stats["shipped_orders"] += 1
                    elif status == "delivered":
                        stats["delivered_orders"] += 1

                self.send_json(200, {
                    "stats": stats,
                    "orders": order_list
                })

            except Exception as error:
                print("Partner Orders Error:", error)

                self.send_json(500, {
                    "message": "Unable to retrieve partner orders."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        

        # =====================================
        # GET PRODUCTION REQUESTS FOR LOCAL PARTNER
        # =====================================
        def handle_partner_production_requests(self):
            session = get_current_session(self)

            if session is None or session["role"] != "local_partner":
                self.send_json(401, {
                    "message": "Please log in as a local partner."
                })
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT
                        fpr.request_id,
                        fpr.order_id,
                        fpr.product_id,
                        p.product_name,
                        fpr.farmer_user_id,
                        farmer.full_name AS farmer_name,
                        fp.farm_name,
                        fpr.requested_quantity,
                        p.unit,
                        fpr.request_status,
                        fpr.created_at,
                        fpr.updated_at
                    FROM farmer_production_requests fpr
                    INNER JOIN products p
                        ON fpr.product_id = p.product_id
                    INNER JOIN users farmer
                        ON fpr.farmer_user_id = farmer.user_id
                    LEFT JOIN farmer_profiles fp
                        ON fpr.farmer_user_id = fp.user_id
                    WHERE fpr.partner_user_id = %s
                    ORDER BY fpr.created_at DESC
                    """,
                    (session["user_id"],)
                )

                requests = cursor.fetchall()

                for request in requests:
                    request["requested_quantity"] = float(
                        request["requested_quantity"]
                    )
                    request["created_at"] = str(request["created_at"])
                    request["updated_at"] = str(request["updated_at"])

                self.send_json(200, {
                    "message": "Farmer production requests loaded successfully.",
                    "requests": requests
                })

            except Exception as error:
                print("Partner Production Requests Error:", error)

                self.send_json(500, {
                    "message": "Unable to load farmer production requests."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # UPDATE ORDER STATUS BY LOCAL PARTNER
        # =====================================
        def handle_update_order_status(self):
            session = get_current_session(self)

            if session is None or session["role"] != "local_partner":
                self.send_json(401, {
                    "message": "Please log in as a local partner."
                })
                return

            connection = None
            cursor = None

            try:
                data = self.read_json(5000)

                order_id = int(data.get("order_id", 0))
                new_status = data.get("order_status", "").strip().lower()

                if order_id <= 0:
                    self.send_json(400, {
                        "message": "Invalid order ID."
                    })
                    return

                allowed_transitions = {
                    "pending": "confirmed",
                    "confirmed": "processing",
                    "processing": "shipped"
                }

                if new_status not in allowed_transitions.values():
                    self.send_json(400, {
                        "message": "Invalid order status."
                    })
                    return

                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor()
                connection.start_transaction()

                cursor.execute(
                    """
                    SELECT order_status
                    FROM orders
                    WHERE order_id = %s
                    AND partner_user_id = %s
                    FOR UPDATE
                    """,
                    (order_id, session["user_id"])
                )

                order = cursor.fetchone()

                if order is None:
                    connection.rollback()
                    self.send_json(404, {
                        "message": "Order not found or access denied."
                    })
                    return

                current_status = order[0]
                expected_status = allowed_transitions.get(current_status)

                if expected_status != new_status:
                    connection.rollback()
                    self.send_json(400, {
                        "message": "Invalid status transition. Current status: "
                        + current_status
                    })
                    return

                # Check farmer production readiness before shipping
                if new_status == "shipped":

                    cursor.execute(
                        """
                        SELECT
                            COUNT(*) AS total_requests,
                            SUM(
                                CASE
                                    WHEN request_status = 'ready' THEN 1
                                    ELSE 0
                                END
                            ) AS ready_requests,
                            SUM(
                                CASE
                                    WHEN request_status = 'rejected' THEN 1
                                    ELSE 0
                                END
                            ) AS rejected_requests
                        FROM farmer_production_requests
                        WHERE order_id = %s
                        AND partner_user_id = %s
                        """,
                        (order_id, session["user_id"])
                    )

                    request_stats = cursor.fetchone()

                    total_requests = request_stats[0] or 0
                    ready_requests = request_stats[1] or 0
                    rejected_requests = request_stats[2] or 0

                    if total_requests == 0:
                        connection.rollback()
                        self.send_json(400, {
                            "message": "Please send farmer production requests before shipping."
                        })
                        return

                    if rejected_requests > 0:
                        connection.rollback()
                        self.send_json(400, {
                            "message": "Some farmers rejected the requests. Resolve them before shipping."
                        })
                        return

                    if ready_requests != total_requests:
                        connection.rollback()
                        self.send_json(400, {
                            "message": "All farmers must mark their products as Ready before shipping."
                        })
                        return

                cursor.execute(
                    """
                    UPDATE orders
                    SET order_status = %s
                    WHERE order_id = %s
                    AND partner_user_id = %s
                    """,
                    (new_status, order_id, session["user_id"])
                )

                connection.commit()

                self.send_json(200, {
                    "message": "Order status updated successfully!",
                    "order_id": order_id,
                    "order_status": new_status
                })

            except Exception as error:
                if connection and connection.is_connected():
                    connection.rollback()

                print("Order Status Update Error:", error)

                self.send_json(500, {
                    "message": "Unable to update order status."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()


        
        def handle_create_bulk_order(self):

            session = get_current_session(self)

            if session is None or session["role"] != "business":
                self.send_json(401, {
                    "message": "Please log in as a business account."
                })
                return

            connection = None
            cursor = None

            try:
                data = self.read_json(5000)

                product_name = str(
                    data.get("product_name", "")
                ).strip()

                unit = str(data.get("unit", "kg")).strip()

                deadline = str(
                    data.get("delivery_deadline", "")
                ).strip()

                try:
                    required_quantity = Decimal(
                        str(data.get("required_quantity", "0"))
                    )

                    offered_price = Decimal(
                        str(data.get("offered_price_per_unit", "0"))
                    )

                except InvalidOperation:
                    self.send_json(400, {
                        "message": "Please enter valid quantity and price."
                    })
                    return

                if not product_name or len(product_name) > 150:
                    self.send_json(400, {
                        "message": "Please enter a valid product name."
                    })
                    return

                if required_quantity <= 0 or offered_price <= 0:
                    self.send_json(400, {
                        "message": "Quantity and offered price must be greater than zero."
                    })
                    return

                if not unit or len(unit) > 20:
                    self.send_json(400, {
                        "message": "Please enter a valid unit."
                    })
                    return

                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor()

                cursor.execute(
                    """
                    INSERT INTO bulk_orders (
                        business_user_id,
                        product_name,
                        required_quantity,
                        unit,
                        offered_price_per_unit,
                        delivery_deadline
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        session["user_id"],
                        product_name,
                        required_quantity,
                        unit,
                        offered_price,
                        deadline if deadline else None
                    )
                )

                bulk_order_id = cursor.lastrowid

                connection.commit()

                self.send_json(201, {
                    "message": "Bulk requirement created successfully!",
                    "bulk_order_id": bulk_order_id
                })

            except Exception as error:
                if connection and connection.is_connected():
                    connection.rollback()

                print("Create Bulk Order Error:", error)

                self.send_json(500, {
                    "message": "Unable to create bulk requirement."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()


        def handle_business_bulk_orders(self):

            session = get_current_session(self)

            if session is None or session["role"] != "business":
                self.send_json(401, {
                    "message": "Please log in as a business account."
                })
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT
                        b.bulk_order_id,
                        b.product_name,
                        b.required_quantity,
                        b.unit,
                        b.offered_price_per_unit,
                        b.delivery_deadline,
                        b.order_status,
                        b.created_at,
                        COALESCE(
                            SUM(
                                CASE
                                    WHEN c.contribution_status = 'accepted'
                                    THEN c.contribution_quantity
                                    ELSE 0
                                END
                            ), 0
                        ) AS fulfilled_quantity
                    FROM bulk_orders b
                    LEFT JOIN bulk_order_contributions c
                        ON b.bulk_order_id = c.bulk_order_id
                    WHERE b.business_user_id = %s
                    GROUP BY b.bulk_order_id
                    ORDER BY b.created_at DESC
                    """,
                    (session["user_id"],)
                )

                bulk_orders = cursor.fetchall()

                for order in bulk_orders:
                    for field in (
                        "required_quantity",
                        "offered_price_per_unit",
                        "fulfilled_quantity"
                    ):
                        order[field] = float(order[field] or 0)

                    if order["delivery_deadline"]:
                        order["delivery_deadline"] = (
                            order["delivery_deadline"].isoformat()
                        )

                    if order["created_at"]:
                        order["created_at"] = (
                            order["created_at"].isoformat()
                        )

                self.send_json(200, {
                    "message": "Business bulk requirements loaded successfully.",
                    "bulk_orders": bulk_orders
                })

            except Exception as error:
                print("Business Bulk Orders Error:", error)

                self.send_json(500, {
                    "message": "Unable to load bulk requirements."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()


        def handle_farmer_bulk_orders(self):

            session = get_current_session(self)

            if session is None or session["role"] != "farmer":
                self.send_json(401, {
                    "message": "Please log in as a farmer."
                })
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT
                        b.bulk_order_id,
                        b.product_name,
                        b.required_quantity,
                        b.unit,
                        b.offered_price_per_unit,
                        b.delivery_deadline,
                        b.order_status,
                        b.created_at,
                        COALESCE(
                            SUM(
                                CASE
                                    WHEN c.contribution_status = 'accepted'
                                    THEN c.contribution_quantity
                                    ELSE 0
                                END
                            ), 0
                        ) AS fulfilled_quantity
                    FROM bulk_orders b
                    LEFT JOIN bulk_order_contributions c
                        ON b.bulk_order_id = c.bulk_order_id
                    WHERE b.order_status IN (
                        'open',
                        'partially_fulfilled'
                    )
                    GROUP BY b.bulk_order_id
                    ORDER BY b.created_at DESC
                    """
                )

                bulk_orders = cursor.fetchall()

                for order in bulk_orders:
                    for field in (
                        "required_quantity",
                        "offered_price_per_unit",
                        "fulfilled_quantity"
                    ):
                        order[field] = float(order[field] or 0)

                    if order["delivery_deadline"]:
                        order["delivery_deadline"] = (
                            order["delivery_deadline"].isoformat()
                        )

                    if order["created_at"]:
                        order["created_at"] = (
                            order["created_at"].isoformat()
                        )

                self.send_json(200, {
                    "message": "Available bulk requirements loaded successfully.",
                    "bulk_orders": bulk_orders
                })

            except Exception as error:
                print("Farmer Bulk Orders Error:", error)

                self.send_json(500, {
                    "message": "Unable to load bulk requirements."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()


        
        # =====================================
        # GET AVAILABLE BULK REQUIREMENTS FOR FARMER
        # =====================================
        def handle_farmer_bulk_orders(self):

            session = get_current_session(self)

            if session is None or session["role"] != "farmer":
                self.send_json(401, {
                    "message": "Please log in as a farmer."
                })
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT
                        b.bulk_order_id,
                        b.product_name,
                        b.required_quantity,
                        b.unit,
                        b.offered_price_per_unit,
                        b.delivery_deadline,
                        b.order_status,
                        COALESCE(
                            SUM(
                                CASE
                                    WHEN c.contribution_status = 'accepted'
                                    THEN c.contribution_quantity
                                    ELSE 0
                                END
                            ), 0
                        ) AS accepted_quantity
                    FROM bulk_orders b
                    LEFT JOIN bulk_order_contributions c
                        ON b.bulk_order_id = c.bulk_order_id
                    WHERE b.order_status IN (
                        'open',
                        'partially_fulfilled'
                    )
                    GROUP BY b.bulk_order_id
                    ORDER BY b.created_at DESC
                    """
                )

                orders = cursor.fetchall()

                for order in orders:
                    order["required_quantity"] = float(
                        order["required_quantity"]
                    )
                    order["accepted_quantity"] = float(
                        order["accepted_quantity"]
                    )
                    order["offered_price_per_unit"] = float(
                        order["offered_price_per_unit"]
                    )
                    order["delivery_deadline"] = (
                        str(order["delivery_deadline"])
                        if order["delivery_deadline"]
                        else None
                    )

                self.send_json(200, {
                    "message": "Available bulk requirements loaded successfully.",
                    "orders": orders
                })

            except Exception as error:
                print("Farmer Bulk Orders Error:", error)

                self.send_json(500, {
                    "message": "Unable to load bulk requirements."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # SEND PRODUCTION REQUESTS TO FARMERS
        # =====================================
        def handle_send_farmer_requests(self):
            session = get_current_session(self)

            if session is None or session["role"] != "local_partner":
                self.send_json(401, {
                    "message": "Please log in as a local partner."
                })
                return

            connection = None
            cursor = None

            try:
                data = self.read_json(5000)
                order_id = int(data.get("order_id", 0))

                if order_id <= 0:
                    self.send_json(400, {
                        "message": "Invalid order ID."
                    })
                    return

                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor()
                connection.start_transaction()

                cursor.execute(
                    """
                    SELECT order_id, order_status
                    FROM orders
                    WHERE order_id = %s
                    AND partner_user_id = %s
                    FOR UPDATE
                    """,
                    (order_id, session["user_id"])
                )

                order = cursor.fetchone()

                if order is None:
                    connection.rollback()
                    self.send_json(404, {
                        "message": "Order not found or access denied."
                    })
                    return

                if order[1] in ("shipped", "picked_up", "delivered", "cancelled"):
                    connection.rollback()
                    self.send_json(400, {
                        "message": "Farmer requests cannot be sent for this order status."
                    })
                    return

                cursor.execute(
                    """
                    SELECT request_id
                    FROM farmer_production_requests
                    WHERE order_id = %s
                    LIMIT 1
                    """,
                    (order_id,)
                )

                if cursor.fetchone() is not None:
                    connection.rollback()
                    self.send_json(409, {
                        "message": "Farmer requests have already been sent for this order."
                    })
                    return

                cursor.execute(
                    """
                    SELECT
                        p.product_id,
                        p.product_name,
                        p.farmer_user_id,
                        SUM(oi.quantity) AS requested_quantity
                    FROM order_items oi
                    INNER JOIN products p
                        ON oi.product_id = p.product_id
                    INNER JOIN users u
                        ON p.farmer_user_id = u.user_id
                    WHERE oi.order_id = %s
                    AND u.role = 'farmer'
                    GROUP BY
                        p.product_id,
                        p.product_name,
                        p.farmer_user_id
                    """,
                    (order_id,)
                )

                products = cursor.fetchall()

                if not products:
                    connection.rollback()
                    self.send_json(400, {
                        "message": "No farmer products were found in this order."
                    })
                    return

                for product in products:
                    product_id = product[0]
                    farmer_user_id = product[2]
                    requested_quantity = product[3]

                    cursor.execute(
                        """
                        INSERT INTO farmer_production_requests (
                            order_id,
                            product_id,
                            farmer_user_id,
                            partner_user_id,
                            requested_quantity
                        )
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (
                            order_id,
                            product_id,
                            farmer_user_id,
                            session["user_id"],
                            requested_quantity
                        )
                    )

                connection.commit()

                self.send_json(200, {
                    "message": "Production requests sent to farmers successfully!",
                    "order_id": order_id,
                    "requests_created": len(products)
                })

            except Exception as error:
                if connection and connection.is_connected():
                    connection.rollback()

                print("Send Farmer Requests Error:", error)

                self.send_json(500, {
                    "message": "Unable to send farmer production requests."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

                    
        def handle_submit_bulk_contribution(self):

            session = get_current_session(self)

            if session is None or session["role"] != "farmer":
                self.send_json(401, {
                    "message": "Please log in as a farmer."
                })
                return

            connection = None
            cursor = None

            try:
                data = self.read_json(5000)

                bulk_order_id = int(data.get("bulk_order_id", 0))

                try:
                    contribution_quantity = Decimal(
                        str(data.get("contribution_quantity", "0"))
                    )
                except InvalidOperation:
                    self.send_json(400, {
                        "message": "Please enter a valid contribution quantity."
                    })
                    return

                if bulk_order_id <= 0 or contribution_quantity <= 0:
                    self.send_json(400, {
                        "message": "Please enter a valid bulk order and quantity."
                    })
                    return

                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT bulk_order_id, required_quantity, order_status
                    FROM bulk_orders
                    WHERE bulk_order_id = %s
                    """,
                    (bulk_order_id,)
                )

                bulk_order = cursor.fetchone()

                if not bulk_order or bulk_order["order_status"] not in (
                    "open", "partially_fulfilled"
                ):
                    self.send_json(404, {
                        "message": "This bulk requirement is no longer available."
                    })
                    return

                cursor.execute(
                    """
                    SELECT COALESCE(SUM(contribution_quantity), 0)
                    AS pending_quantity
                    FROM bulk_order_contributions
                    WHERE bulk_order_id = %s
                    AND contribution_status IN ('pending', 'accepted')
                    """,
                    (bulk_order_id,)
                )

                quantity_data = cursor.fetchone()

                available_quantity = (
                    Decimal(str(bulk_order["required_quantity"]))
                    - Decimal(str(quantity_data["pending_quantity"]))
                )

                if contribution_quantity > available_quantity:
                    self.send_json(400, {
                        "message": "Your contribution exceeds the remaining required quantity.",
                        "remaining_quantity": str(max(available_quantity, Decimal("0")))
                    })
                    return

                cursor.execute(
                    """
                    INSERT INTO bulk_order_contributions (
                        bulk_order_id,
                        farmer_user_id,
                        contribution_quantity
                    )
                    VALUES (%s, %s, %s)
                    """,
                    (
                        bulk_order_id,
                        session["user_id"],
                        contribution_quantity
                    )
                )

                connection.commit()

                self.send_json(201, {
                    "message": "Your bulk supply contribution was submitted successfully!"
                })

            except Exception as error:
                if connection and connection.is_connected():
                    connection.rollback()

                print("Submit Bulk Contribution Error:", error)

                if "Duplicate entry" in str(error):
                    self.send_json(409, {
                        "message": "You have already submitted a contribution for this requirement."
                    })
                else:
                    self.send_json(500, {
                        "message": "Unable to submit your contribution."
                    })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()


        def handle_business_bulk_contributions(self):

            session = get_current_session(self)

            if session is None or session["role"] != "business":
                self.send_json(401, {
                    "message": "Please log in as a business account."
                })
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT
                        c.contribution_id,
                        c.bulk_order_id,
                        c.farmer_user_id,
                        b.product_name,
                        c.contribution_quantity,
                        b.unit,
                        b.offered_price_per_unit,
                        c.contribution_status,
                        c.created_at
                    FROM bulk_order_contributions c
                    INNER JOIN bulk_orders b
                        ON c.bulk_order_id = b.bulk_order_id
                    WHERE b.business_user_id = %s
                    ORDER BY c.created_at DESC
                    """,
                    (session["user_id"],)
                )

                contributions = cursor.fetchall()

                for contribution in contributions:
                    contribution["contribution_quantity"] = float(
                        contribution["contribution_quantity"] or 0
                    )

                    contribution["offered_price_per_unit"] = float(
                        contribution["offered_price_per_unit"] or 0
                    )

                    if contribution["created_at"]:
                        contribution["created_at"] = (
                            contribution["created_at"].isoformat()
                        )

                self.send_json(200, {
                    "message": "Farmer bulk contributions loaded successfully.",
                    "contributions": contributions
                })

            except Exception as error:
                print("Business Bulk Contributions Error:", error)

                self.send_json(500, {
                    "message": "Unable to load farmer contributions."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()


        def handle_update_bulk_contribution_status(self):

            session = get_current_session(self)

            if session is None or session["role"] != "business":
                self.send_json(401, {
                    "message": "Please log in as a business account."
                })
                return

            connection = None
            cursor = None

            try:
                data = self.read_json(5000)

                contribution_id = int(data.get("contribution_id", 0))
                new_status = str(data.get("status", "")).strip()

                if contribution_id <= 0 or new_status not in (
                    "accepted", "rejected"
                ):
                    self.send_json(400, {
                        "message": "Invalid contribution details."
                    })
                    return

                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                connection.start_transaction()
                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT
                        c.bulk_order_id,
                        c.contribution_quantity,
                        c.contribution_status,
                        b.required_quantity
                    FROM bulk_order_contributions c
                    INNER JOIN bulk_orders b
                        ON c.bulk_order_id = b.bulk_order_id
                    WHERE c.contribution_id = %s
                    AND b.business_user_id = %s
                    FOR UPDATE
                    """,
                    (contribution_id, session["user_id"])
                )

                contribution = cursor.fetchone()

                if not contribution:
                    connection.rollback()
                    self.send_json(404, {
                        "message": "Contribution not found."
                    })
                    return

                if contribution["contribution_status"] != "pending":
                    connection.rollback()
                    self.send_json(400, {
                        "message": "This contribution has already been processed."
                    })
                    return

                if new_status == "accepted":

                    cursor.execute(
                        """
                        SELECT COALESCE(
                            SUM(contribution_quantity), 0
                        ) AS accepted_quantity
                        FROM bulk_order_contributions
                        WHERE bulk_order_id = %s
                        AND contribution_status = 'accepted'
                        """,
                        (contribution["bulk_order_id"],)
                    )

                    result = cursor.fetchone()

                    accepted_quantity = Decimal(
                        str(result["accepted_quantity"])
                    )

                    requested_quantity = Decimal(
                        str(contribution["contribution_quantity"])
                    )

                    required_quantity = Decimal(
                        str(contribution["required_quantity"])
                    )

                    if accepted_quantity + requested_quantity > required_quantity:
                        connection.rollback()
                        self.send_json(409, {
                            "message": "Accepting this contribution would exceed the required quantity."
                        })
                        return

                cursor.execute(
                    """
                    UPDATE bulk_order_contributions
                    SET contribution_status = %s
                    WHERE contribution_id = %s
                    """,
                    (new_status, contribution_id)
                )

                if new_status == "accepted":

                    cursor.execute(
                        """
                        SELECT COALESCE(
                            SUM(contribution_quantity), 0
                        ) AS total_quantity
                        FROM bulk_order_contributions
                        WHERE bulk_order_id = %s
                        AND contribution_status = 'accepted'
                        """,
                        (contribution["bulk_order_id"],)
                    )

                    total = Decimal(
                        str(cursor.fetchone()["total_quantity"])
                    )

                    required = Decimal(
                        str(contribution["required_quantity"])
                    )

                    if total >= required:
                        order_status = "fulfilled"
                    else:
                        order_status = "partially_fulfilled"

                    cursor.execute(
                        """
                        UPDATE bulk_orders
                        SET order_status = %s
                        WHERE bulk_order_id = %s
                        """,
                        (order_status, contribution["bulk_order_id"])
                    )

                connection.commit()

                self.send_json(200, {
                    "message": "Farmer contribution " + new_status + " successfully."
                })

            except Exception as error:
                if connection and connection.is_connected():
                    connection.rollback()

                print("Update Bulk Contribution Error:", error)

                self.send_json(500, {
                    "message": "Unable to update contribution status."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # GET FARMER DASHBOARD DATA
        # =====================================
        def handle_farmer_dashboard(self):
            session = get_current_session(self)

            if session is None or session["role"] != "farmer":
                self.send_json(401, {
                    "message": "Please log in as a farmer."
                })
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)
                farmer_id = session["user_id"]

                cursor.execute(
                    """
                    SELECT
                        u.user_id,
                        u.full_name,
                        u.email,
                        u.phone,
                        fp.farm_name,
                        fp.address,
                        fp.village,
                        fp.district,
                        fp.state,
                        fp.verification_status
                    FROM users u
                    LEFT JOIN farmer_profiles fp
                        ON u.user_id = fp.user_id
                    WHERE u.user_id = %s
                    AND u.role = 'farmer'
                    """,
                    (farmer_id,)
                )

                profile = cursor.fetchone()

                if profile is None:
                    self.send_json(404, {
                        "message": "Farmer profile not found."
                    })
                    return

                cursor.execute(
                    """
                    SELECT
                        product_id,
                        product_name,
                        category,
                        description,
                        price_per_kg,
                        available_quantity,
                        unit,
                        product_status
                    FROM products
                    WHERE farmer_user_id = %s
                    ORDER BY created_at DESC
                    """,
                    (farmer_id,)
                )

                products = cursor.fetchall()

                for product in products:
                    product["price_per_kg"] = float(product["price_per_kg"])
                    product["available_quantity"] = float(
                        product["available_quantity"]
                    )

                cursor.execute(
                    """
                    SELECT
                        COUNT(DISTINCT o.order_id) AS total_orders,
                        COUNT(DISTINCT CASE
                            WHEN o.order_status IN (
                                'pending', 'confirmed', 'processing',
                                'shipped', 'picked_up'
                            )
                            THEN o.order_id
                        END) AS active_orders,
                        COUNT(DISTINCT CASE
                            WHEN o.order_status = 'delivered'
                            THEN o.order_id
                        END) AS delivered_orders
                    FROM order_items oi
                    INNER JOIN orders o
                        ON oi.order_id = o.order_id
                    INNER JOIN products p
                        ON oi.product_id = p.product_id
                    WHERE p.farmer_user_id = %s
                    """,
                    (farmer_id,)
                )

                stats = cursor.fetchone()

                self.send_json(200, {
                    "message": "Farmer dashboard loaded successfully.",
                    "profile": profile,
                    "products": products,
                    "stats": stats
                })

            except Exception as error:
                print("Farmer Dashboard Error:", error)

                self.send_json(500, {
                    "message": "Unable to load farmer dashboard."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

                def handle_update_bulk_contribution_status(self):

                  session = get_current_session(self)

            if session is None or session["role"] != "business":
                self.send_json(401, {
                    "message": "Please log in as a business account."
                })
                return

            connection = None
            cursor = None

            try:
                data = self.read_json(5000)

                contribution_id = int(data.get("contribution_id", 0))
                new_status = str(data.get("status", "")).strip()

                if contribution_id <= 0 or new_status not in (
                    "accepted", "rejected"
                ):
                    self.send_json(400, {
                        "message": "Invalid contribution details."
                    })
                    return

                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                connection.start_transaction()
                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT
                        c.bulk_order_id,
                        c.contribution_quantity,
                        c.contribution_status,
                        b.required_quantity
                    FROM bulk_order_contributions c
                    INNER JOIN bulk_orders b
                        ON c.bulk_order_id = b.bulk_order_id
                    WHERE c.contribution_id = %s
                    AND b.business_user_id = %s
                    FOR UPDATE
                    """,
                    (contribution_id, session["user_id"])
                )

                contribution = cursor.fetchone()

                if not contribution:
                    connection.rollback()
                    self.send_json(404, {
                        "message": "Contribution not found."
                    })
                    return

                if contribution["contribution_status"] != "pending":
                    connection.rollback()
                    self.send_json(400, {
                        "message": "This contribution has already been processed."
                    })
                    return

                if new_status == "accepted":

                    cursor.execute(
                        """
                        SELECT COALESCE(
                            SUM(contribution_quantity), 0
                        ) AS accepted_quantity
                        FROM bulk_order_contributions
                        WHERE bulk_order_id = %s
                        AND contribution_status = 'accepted'
                        """,
                        (contribution["bulk_order_id"],)
                    )

                    result = cursor.fetchone()

                    accepted_quantity = Decimal(
                        str(result["accepted_quantity"])
                    )

                    requested_quantity = Decimal(
                        str(contribution["contribution_quantity"])
                    )

                    required_quantity = Decimal(
                        str(contribution["required_quantity"])
                    )

                    if accepted_quantity + requested_quantity > required_quantity:
                        connection.rollback()
                        self.send_json(409, {
                            "message": "Accepting this contribution would exceed the required quantity."
                        })
                        return

                cursor.execute(
                    """
                    UPDATE bulk_order_contributions
                    SET contribution_status = %s
                    WHERE contribution_id = %s
                    """,
                    (new_status, contribution_id)
                )

                if new_status == "accepted":

                    cursor.execute(
                        """
                        SELECT COALESCE(
                            SUM(contribution_quantity), 0
                        ) AS total_quantity
                        FROM bulk_order_contributions
                        WHERE bulk_order_id = %s
                        AND contribution_status = 'accepted'
                        """,
                        (contribution["bulk_order_id"],)
                    )

                    total = Decimal(
                        str(cursor.fetchone()["total_quantity"])
                    )

                    required = Decimal(
                        str(contribution["required_quantity"])
                    )

                    if total >= required:
                        order_status = "fulfilled"
                    else:
                        order_status = "partially_fulfilled"

                    cursor.execute(
                        """
                        UPDATE bulk_orders
                        SET order_status = %s
                        WHERE bulk_order_id = %s
                        """,
                        (order_status, contribution["bulk_order_id"])
                    )

                connection.commit()

                self.send_json(200, {
                    "message": "Farmer contribution " + new_status + " successfully."
                })

            except Exception as error:
                if connection and connection.is_connected():
                    connection.rollback()

                print("Update Bulk Contribution Error:", error)

                self.send_json(500, {
                    "message": "Unable to update contribution status."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # GET PRODUCTION REQUESTS FOR FARMER
        # =====================================
        def handle_farmer_production_requests(self):
            session = get_current_session(self)

            if session is None or session["role"] != "farmer":
                self.send_json(401, {
                    "message": "Please log in as a farmer."
                })
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT
                        fpr.request_id,
                        fpr.order_id,
                        fpr.product_id,
                        p.product_name,
                        fpr.requested_quantity,
                        p.unit,
                        fpr.request_status,
                        fpr.created_at,
                        u.full_name AS partner_name,
                        o.delivery_area
                    FROM farmer_production_requests fpr
                    INNER JOIN products p
                        ON fpr.product_id = p.product_id
                    INNER JOIN users u
                        ON fpr.partner_user_id = u.user_id
                    INNER JOIN orders o
                        ON fpr.order_id = o.order_id
                    WHERE fpr.farmer_user_id = %s
                    ORDER BY fpr.created_at DESC
                    """,
                    (session["user_id"],)
                )

                requests = cursor.fetchall()

                for request in requests:
                    request["requested_quantity"] = float(
                        request["requested_quantity"]
                    )
                    request["created_at"] = str(request["created_at"])

                self.send_json(200, {
                    "message": "Farmer production requests loaded successfully.",
                    "requests": requests
                })

            except Exception as error:
                print("Farmer Production Requests Error:", error)

                self.send_json(500, {
                    "message": "Unable to load production requests."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # UPDATE FARMER PRODUCTION REQUEST STATUS
        # =====================================
        def handle_update_farmer_request_status(self):
            session = get_current_session(self)

            if session is None or session["role"] != "farmer":
                self.send_json(401, {
                    "message": "Please log in as a farmer."
                })
                return

            connection = None
            cursor = None

            try:
                data = self.read_json(5000)

                request_id = int(data.get("request_id", 0))
                new_status = str(
                    data.get("request_status", "")
                ).strip().lower()

                if request_id <= 0 or not new_status:
                    self.send_json(400, {
                        "message": "Request ID and status are required."
                    })
                    return

                allowed_transitions = {
                    "pending": ["accepted", "rejected"],
                    "accepted": ["preparing"],
                    "preparing": ["ready"]
                }

                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)
                connection.start_transaction()

                cursor.execute(
                    """
                    SELECT request_id, request_status
                    FROM farmer_production_requests
                    WHERE request_id = %s
                    AND farmer_user_id = %s
                    FOR UPDATE
                    """,
                    (request_id, session["user_id"])
                )

                request = cursor.fetchone()

                if not request:
                    connection.rollback()
                    self.send_json(404, {
                        "message": "Production request not found."
                    })
                    return

                current_status = request["request_status"]

                if new_status not in allowed_transitions.get(current_status, []):
                    connection.rollback()
                    self.send_json(400, {
                        "message": "Invalid request status update."
                    })
                    return

                cursor.execute(
                    """
                    UPDATE farmer_production_requests
                    SET request_status = %s
                    WHERE request_id = %s
                    AND farmer_user_id = %s
                    """,
                    (new_status, request_id, session["user_id"])
                )

                connection.commit()

                self.send_json(200, {
                    "message": "Production request status updated successfully.",
                    "request_status": new_status
                })

            except Exception as error:
                if connection and connection.is_connected():
                    connection.rollback()

                print("Farmer Request Status Error:", error)

                self.send_json(500, {
                    "message": "Unable to update production request status."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # GET DELIVERY BOY PROFILE
        # =====================================
        def handle_delivery_profile(self):
            session = self.get_delivery_boy_session()

            if session is None:
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT vehicle_number, availability, address
                    FROM delivery_boy_profiles
                    WHERE user_id = %s
                    """,
                    (session["user_id"],)
                )

                profile = cursor.fetchone()

                if profile is None:
                    self.send_json(404, {
                        "message": "Delivery boy profile not found."
                    })
                    return

                self.send_json(200, {
                    "profile": profile
                })

            except Exception as error:
                print("Delivery Profile Error:", error)

                self.send_json(500, {
                    "message": "Unable to retrieve delivery profile."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # GET AVAILABLE DELIVERIES
        # =====================================
        def handle_available_deliveries(self):
            session = self.get_delivery_boy_session()

            if session is None:
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                cursor.execute(
                    """
                    SELECT availability
                    FROM delivery_boy_profiles
                    WHERE user_id = %s
                    """,
                    (session["user_id"],)
                )

                profile = cursor.fetchone()

                if profile is None:
                    self.send_json(404, {
                        "message": "Delivery boy profile not found."
                    })
                    return

                if profile["availability"] != "available":
                    self.send_json(200, {
                        "availability": profile["availability"],
                        "orders": []
                    })
                    return

                orders = self.get_delivery_orders(
                    cursor,
                    """
                    o.order_status = 'shipped'
                    AND o.delivery_user_id IS NULL
                    """,
                    ()
                )

                self.send_json(200, {
                    "availability": profile["availability"],
                    "orders": orders
                })

            except Exception as error:
                print("Available Deliveries Error:", error)

                self.send_json(500, {
                    "message": "Unable to retrieve available deliveries."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # GET MY DELIVERIES
        # =====================================
        def handle_my_deliveries(self):
            session = self.get_delivery_boy_session()

            if session is None:
                return

            connection = None
            cursor = None

            try:
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor(dictionary=True)

                orders = self.get_delivery_orders(
                    cursor,
                    "o.delivery_user_id = %s",
                    (session["user_id"],)
                )

                stats = {
                    "total_deliveries": len(orders),
                    "active_deliveries": 0,
                    "picked_up": 0,
                    "delivered": 0
                }

                for order in orders:
                    if order["order_status"] == "shipped":
                        stats["active_deliveries"] += 1
                    elif order["order_status"] == "picked_up":
                        stats["picked_up"] += 1
                    elif order["order_status"] == "delivered":
                        stats["delivered"] += 1

                self.send_json(200, {
                    "stats": stats,
                    "orders": orders
                })

            except Exception as error:
                print("My Deliveries Error:", error)

                self.send_json(500, {
                    "message": "Unable to retrieve your deliveries."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # ACCEPT DELIVERY
        # =====================================
        def handle_accept_delivery(self):
            session = self.get_delivery_boy_session()

            if session is None:
                return

            connection = None
            cursor = None

            try:
                data = self.read_json(5000)
                order_id = int(data.get("order_id", 0))

                if order_id <= 0:
                    self.send_json(400, {
                        "message": "Invalid order ID."
                    })
                    return

                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor()
                connection.start_transaction()

                cursor.execute(
                    """
                    SELECT availability
                    FROM delivery_boy_profiles
                    WHERE user_id = %s
                    FOR UPDATE
                    """,
                    (session["user_id"],)
                )

                profile = cursor.fetchone()

                if profile is None:
                    connection.rollback()
                    self.send_json(404, {
                        "message": "Delivery boy profile not found."
                    })
                    return

                if profile[0] != "available":
                    connection.rollback()
                    self.send_json(409, {
                        "message": "You are currently busy or inactive. You cannot accept another delivery."
                    })
                    return

                cursor.execute(
                    """
                    UPDATE orders
                    SET delivery_user_id = %s
                    WHERE order_id = %s
                    AND order_status = 'shipped'
                    AND delivery_user_id IS NULL
                    """,
                    (session["user_id"], order_id)
                )

                if cursor.rowcount != 1:
                    connection.rollback()
                    self.send_json(409, {
                        "message": "This delivery has already been accepted or is no longer available."
                    })
                    return

                cursor.execute(
                    """
                    UPDATE delivery_boy_profiles
                    SET availability = 'busy'
                    WHERE user_id = %s
                    """,
                    (session["user_id"],)
                )

                connection.commit()

                self.send_json(200, {
                    "message": "Delivery accepted successfully!",
                    "order_id": order_id
                })

            except Exception as error:
                if connection and connection.is_connected():
                    connection.rollback()

                print("Accept Delivery Error:", error)

                self.send_json(500, {
                    "message": "Unable to accept this delivery. Please try again."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # UPDATE DELIVERY STATUS
        # =====================================
        def handle_update_delivery_status(self):
            session = self.get_delivery_boy_session()

            if session is None:
                return

            connection = None
            cursor = None

            try:
                data = self.read_json(5000)

                order_id = int(data.get("order_id", 0))
                new_status = data.get("order_status", "").strip().lower()

                if order_id <= 0:
                    self.send_json(400, {
                        "message": "Invalid order ID."
                    })
                    return

                allowed_transitions = {
                    "shipped": "picked_up",
                    "picked_up": "delivered"
                }

                if new_status not in allowed_transitions.values():
                    self.send_json(400, {
                        "message": "Invalid delivery status."
                    })
                    return

                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor()
                connection.start_transaction()

                cursor.execute(
                    """
                    SELECT order_status
                    FROM orders
                    WHERE order_id = %s
                    AND delivery_user_id = %s
                    FOR UPDATE
                    """,
                    (order_id, session["user_id"])
                )

                order = cursor.fetchone()

                if order is None:
                    connection.rollback()
                    self.send_json(404, {
                        "message": "Delivery not found or it is not assigned to you."
                    })
                    return

                current_status = order[0]

                if allowed_transitions.get(current_status) != new_status:
                    connection.rollback()
                    self.send_json(400, {
                        "message": "Invalid status transition. Current status: "
                        + current_status
                    })
                    return

                cursor.execute(
                    """
                    UPDATE orders
                    SET order_status = %s
                    WHERE order_id = %s
                    AND delivery_user_id = %s
                    """,
                    (new_status, order_id, session["user_id"])
                )

                if new_status == "delivered":
                    cursor.execute(
                        """
                        UPDATE delivery_boy_profiles
                        SET availability = 'available'
                        WHERE user_id = %s
                        """,
                        (session["user_id"],)
                    )

                connection.commit()

                self.send_json(200, {
                    "message": "Delivery status updated successfully!",
                    "order_id": order_id,
                    "order_status": new_status
                })

            except Exception as error:
                if connection and connection.is_connected():
                    connection.rollback()

                print("Delivery Status Error:", error)

                self.send_json(500, {
                    "message": "Unable to update delivery status."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # UPDATE DELIVERY BOY AVAILABILITY
        # =====================================
        def handle_update_delivery_availability(self):
            session = self.get_delivery_boy_session()

            if session is None:
                return

            connection = None
            cursor = None

            try:
                data = self.read_json(5000)
                availability = data.get("availability", "").strip().lower()

                if availability not in ["available", "inactive"]:
                    self.send_json(400, {
                        "message": "Choose either available or inactive."
                    })
                    return

                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor()
                connection.start_transaction()

                cursor.execute(
                    """
                    SELECT availability
                    FROM delivery_boy_profiles
                    WHERE user_id = %s
                    FOR UPDATE
                    """,
                    (session["user_id"],)
                )

                profile = cursor.fetchone()

                if profile is None:
                    connection.rollback()
                    self.send_json(404, {
                        "message": "Delivery boy profile not found."
                    })
                    return

                if profile[0] == "busy":
                    connection.rollback()
                    self.send_json(409, {
                        "message": "You cannot change availability while a delivery is in progress."
                    })
                    return

                cursor.execute(
                    """
                    UPDATE delivery_boy_profiles
                    SET availability = %s
                    WHERE user_id = %s
                    """,
                    (availability, session["user_id"])
                )

                connection.commit()

                self.send_json(200, {
                    "message": "Availability updated successfully!",
                    "availability": availability
                })

            except Exception as error:
                if connection and connection.is_connected():
                    connection.rollback()

                print("Availability Update Error:", error)

                self.send_json(500, {
                    "message": "Unable to update availability."
                })

            finally:
                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

        # =====================================
        # DISPLAY WEBSITE PAGES AND PROTECT DASHBOARDS
        # =====================================
        

        # =====================================
        # DISPLAY WEBSITE PAGES AND PROTECT DASHBOARDS
        # =====================================

        def do_GET(self):

            protected_pages = {
                "/farmer_dashboard.html": "farmer",
                "/customer_dashboard.html": "customer",
                "/partner_dashboard.html": "local_partner",
                "/delivery_dashboard.html": "delivery_boy",
                "/business_dashboard.html": "business",
                "/my_orders.html": "customer"
            }

            requested_page = self.path.split("?")[0]
            print("GET REQUEST RECEIVED:", repr(requested_page))

            # LOGIN - FETCH EXISTING ACCOUNTS
            if requested_page == "/login-accounts":
                connection = None
                cursor = None

                try:
                    connection = get_db_connection()

                    if connection is None:
                        self.send_json(500, {
                            "message": "Database connection failed."
                        })
                        return

                    cursor = connection.cursor()
                    cursor.execute("""
                        SELECT full_name, email, role
                        FROM users
                        ORDER BY full_name
                    """)

                    accounts = cursor.fetchall()

                    self.send_json(200, {
                        "accounts": [
                            {
                                "full_name": row[0],
                                "email": row[1],
                                "role": row[2]
                            }
                            for row in accounts
                        ]
                    })

                except Exception as error:
                    print("Login Accounts Error:", error)
                    self.send_json(500, {
                        "message": "Unable to load accounts."
                    })

                finally:
                    if cursor:
                        cursor.close()

                    if connection and connection.is_connected():
                        connection.close()

                return

            # FARMER APIs
            if requested_page == "/farmer-dashboard":
                self.handle_farmer_dashboard()
                return

            if requested_page == "/farmer-production-requests":
                self.handle_farmer_production_requests()
                return

            # CUSTOMER API
            if requested_page == "/my-orders":
                self.handle_my_orders()
                return

            # BUSINESS APIs
            if requested_page == "/business-products":
                self.handle_business_products()
                return

            if requested_page == "/business-orders":
                self.handle_business_orders()
                return

            # LOCAL PARTNER APIs
            if requested_page == "/partner-orders":
                self.handle_partner_orders()
                return

            if requested_page == "/partner-production-requests":
                self.handle_partner_production_requests()
                return

            # DELIVERY BOY APIs
            if requested_page == "/delivery-profile":
                self.handle_delivery_profile()
                return

            if requested_page == "/available-deliveries":
                self.handle_available_deliveries()
                return

            if requested_page == "/my-deliveries":
                self.handle_my_deliveries()
                return

            # LOGOUT
            if requested_page == "/logout":
                cookie = SimpleCookie()
                cookie.load(self.headers.get("Cookie", ""))

                if "session_id" in cookie:
                    session_id = cookie["session_id"].value
                    active_sessions.pop(session_id, None)

                self.send_response(302)
                self.send_header("Location", "/login.html")
                self.send_header(
                    "Set-Cookie",
                    "session_id=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
                )
                self.end_headers()
                return

            # PROTECT DASHBOARDS
            if requested_page in protected_pages:
                session = get_current_session(self)

                if session is None:
                    self.send_response(302)
                    self.send_header("Location", "/login.html")
                    self.end_headers()
                    return

                required_role = protected_pages[requested_page]

                if session["role"] != required_role:
                    self.send_response(403)
                    self.end_headers()
                    self.wfile.write(b"Access denied!")
                    return

            # HOMEPAGE
            if requested_page == "/":
                self.path = "/index.html"

            # BUSINESS BULK APIs
            if requested_page == "/business-bulk-orders":
                self.handle_business_bulk_orders()
                return

            if requested_page == "/business-bulk-contributions":
                self.handle_business_bulk_contributions()
                return

            # FARMER BULK API
            if requested_page == "/farmer-bulk-orders":
                self.handle_farmer_bulk_orders()
                return

            super().do_GET()

        # =====================================
        # HANDLE POST REQUESTS
        # =====================================

        # =====================================
        # HANDLE POST REQUESTS
        # =====================================

        def do_POST(self):

            # CUSTOMER AND BUSINESS ORDER
            if self.path == "/place-order":
                self.handle_place_order()
                return

            # BUSINESS - CREATE BULK REQUIREMENT
            if self.path == "/create-bulk-order":
                self.handle_create_bulk_order()
                return

            # LOCAL PARTNER ORDER STATUS
            if self.path == "/update-order-status":
                self.handle_update_order_status()
                return

            # LOCAL PARTNER - SEND FARMER PRODUCTION REQUESTS
            if self.path == "/send-farmer-requests":
                self.handle_send_farmer_requests()
                return

            # FARMER - UPDATE PRODUCTION REQUEST STATUS
            if self.path == "/update-farmer-request-status":
                self.handle_update_farmer_request_status()
                return

            # DELIVERY BOY APIs
            if self.path == "/accept-delivery":
                self.handle_accept_delivery()
                return

            if self.path == "/update-delivery-status":
                self.handle_update_delivery_status()
                return

            if self.path == "/update-delivery-availability":
                self.handle_update_delivery_availability()
                return

            # FARMER - SUBMIT BULK CONTRIBUTION
            if self.path == "/submit-bulk-contribution":
                self.handle_submit_bulk_contribution()
                return

            # BUSINESS - ACCEPT OR REJECT FARMER CONTRIBUTION
            if self.path == "/update-bulk-contribution-status":
                self.handle_update_bulk_contribution_status()
                return

            # ONLY SIGNUP AND LOGIN
            if self.path not in ["/signup", "/login"]:
                self.send_json(404, {
                    "message": "Page not found."
                })
                return

            connection = None
            cursor = None

            try:
                content_length = int(
                    self.headers.get("Content-Length", 0)
                )

                if content_length <= 0 or content_length > 10000:
                    self.send_json(400, {
                        "message": "Invalid form submission."
                    })
                    return

                form_data = self.rfile.read(
                    content_length
                ).decode("utf-8")

                data = parse_qs(
                    form_data,
                    keep_blank_values=True
                )

                # =================================
                # LOGIN
                # =================================
                if self.path == "/login":

                    email = data.get("email", [""])[0].strip().lower()
                    password = data.get("password", [""])[0]

                    if not email or not password:
                        self.send_json(400, {
                            "message": "Please enter your email and password."
                        })
                        return

                    connection = get_db_connection()

                    if connection is None:
                        self.send_json(500, {
                            "message": "Database connection failed."
                        })
                        return

                    cursor = connection.cursor()

                    cursor.execute(
                        """
                        SELECT user_id, full_name, password_hash, role
                        FROM users
                        WHERE email = %s
                        """,
                        (email,)
                    )

                    user = cursor.fetchone()

                    if user is None or not verify_password(password, user[2]):
                        self.send_json(401, {
                            "message": "Invalid email or password."
                        })
                        return

                    user_id, full_name, stored_hash, role = user

                    dashboards = {
                        "farmer": "farmer_dashboard.html",
                        "customer": "customer_dashboard.html",
                        "local_partner": "partner_dashboard.html",
                        "delivery_boy": "delivery_dashboard.html",
                        "business": "business_dashboard.html",
                       
                         
                    }

                    if role not in dashboards:
                        self.send_json(403, {
                            "message": "Invalid user role."
                        })
                        return

                    session_id = create_session(user_id, role)

                    self.send_json(
                        200,
                        {
                            "message": "Login successful! Welcome, " + full_name,
                            "role": role,
                            "redirect": "/" + dashboards[role]
                        },
                        session_id=session_id
                    )

                    return

                # =================================
                # SIGNUP
                # =================================

                full_name = data.get("fullname", [""])[0].strip()
                email = data.get("email", [""])[0].strip().lower()
                role = data.get("role", [""])[0].strip().lower()

                phone = data.get("phone", [""])[0].strip()
                address = data.get("address", [""])[0].strip()
                service_area = data.get("service_area", [""])[0].strip()

                password = data.get("password", [""])[0]
                confirm_password = data.get("confirm_password", [""])[0]

                # BUSINESS DETAILS
                business_name = data.get("business_name", [""])[0].strip()
                business_type = data.get("business_type", [""])[0].strip()
                gst_number = data.get("gst_number", [""])[0].strip()

                # REQUIRED FIELD VALIDATION
                if not all([
                    full_name,
                    email,
                    role,
                    phone,
                    address,
                    password,
                    confirm_password
                ]):
                    self.send_json(400, {
                        "message": "Please fill in all required fields."
                    })
                    return

                # ALLOWED ACCOUNT ROLES
                allowed_roles = [
                    "farmer",
                    "customer",
                    "local_partner",
                    "delivery_boy",
                    "business"
                ]

                if role not in allowed_roles:
                    self.send_json(400, {
                        "message": "Invalid account type."
                    })
                    return

                # LOCAL PARTNER VALIDATION
                if role == "local_partner" and not service_area:
                    self.send_json(400, {
                        "message": "Please select your service area."
                    })
                    return

                # BUSINESS VALIDATION
                if role == "business":

                    allowed_business_types = [
                        "hotel",
                        "restaurant",
                        "wholesaler",
                        "retailer"
                    ]

                    if not business_name or not business_type:
                        self.send_json(400, {
                            "message": "Please enter your business name and business type."
                        })
                        return

                    if business_type not in allowed_business_types:
                        self.send_json(400, {
                            "message": "Please select a valid business type."
                        })
                        return

                    if len(business_name) > 150:
                        self.send_json(400, {
                            "message": "Business name is too long."
                        })
                        return

                    if len(gst_number) > 20:
                        self.send_json(400, {
                            "message": "GST number must not exceed 20 characters."
                        })
                        return

                # PASSWORD VALIDATION
                if password != confirm_password:
                    self.send_json(400, {
                        "message": "Passwords do not match."
                    })
                    return

                if len(password) < 8:
                    self.send_json(400, {
                        "message": "Password must contain at least 8 characters."
                    })
                    return

                # DATABASE CONNECTION
                connection = get_db_connection()

                if connection is None:
                    self.send_json(500, {
                        "message": "Database connection failed."
                    })
                    return

                cursor = connection.cursor()

                # CHECK EXISTING EMAIL OR PHONE
                cursor.execute(
                    """
                    SELECT user_id
                    FROM users
                    WHERE email = %s OR phone = %s
                    """,
                    (email, phone)
                )

                if cursor.fetchone():
                    self.send_json(409, {
                        "message": "Email or phone number already registered."
                    })
                    return

                password_hash = hash_password(password)

                # CREATE USER ACCOUNT
                cursor.execute(
                    """
                    INSERT INTO users
                    (full_name, email, phone, password_hash, role)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (full_name, email, phone, password_hash, role)
                )

                user_id = cursor.lastrowid

                # CREATE FARMER PROFILE
                if role == "farmer":

                    cursor.execute(
                        """
                        INSERT INTO farmer_profiles
                        (user_id, address)
                        VALUES (%s, %s)
                        """,
                        (user_id, address)
                    )

                # CREATE CUSTOMER PROFILE
                elif role == "customer":

                    cursor.execute(
                        """
                        INSERT INTO customer_profiles
                        (user_id, delivery_address)
                        VALUES (%s, %s)
                        """,
                        (user_id, address)
                    )

                # CREATE LOCAL PARTNER PROFILE
                elif role == "local_partner":

                    cursor.execute(
                        """
                        INSERT INTO local_partner_profiles
                        (user_id, service_area)
                        VALUES (%s, %s)
                        """,
                        (user_id, service_area)
                    )

                # CREATE DELIVERY BOY PROFILE
                elif role == "delivery_boy":

                    cursor.execute(
                        """
                        INSERT INTO delivery_boy_profiles
                        (user_id, address)
                        VALUES (%s, %s)
                        """,
                        (user_id, address)
                    )

                # CREATE BUSINESS PROFILE
                elif role == "business":

                    cursor.execute(
                        """
                        INSERT INTO business_profiles
                        (
                            user_id,
                            business_name,
                            business_type,
                            business_address,
                            gst_number
                        )
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (
                            user_id,
                            business_name,
                            business_type,
                            address,
                            gst_number if gst_number else None
                        )
                    )

                connection.commit()

                self.send_json(201, {
                    "message": "Account created successfully!",
                    "role": role
                })

            except Exception as error:

                if connection and connection.is_connected():
                    connection.rollback()

                print("Backend Error:", error)

                self.send_json(500, {
                    "message": "Something went wrong. Please try again."
                })

            finally:

                if cursor:
                    cursor.close()

                if connection and connection.is_connected():
                    connection.close()

                if connection and connection.is_connected():
                    connection.close()


# =========================================
# START PYTHON SERVER
# =========================================

if __name__ == "__main__":

    server = HTTPServer(
        ("localhost", 8000),
        KhetSeGharHandler
    )

    print("Khet Se Ghar server is running!")
    print("Open http://localhost:8000 in your browser")

    try:
        server.serve_forever()

    except KeyboardInterrupt:
        print("\nServer stopped.")

    finally:
        server.server_close()
