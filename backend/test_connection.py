
from db_connection import get_db_connection

connection = get_db_connection()

if connection:
    print("Khet Se Ghar database is ready!")
    connection.close()
    print("Database connection closed.")
else:
    print("Please check your MySQL settings.")
