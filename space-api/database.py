import cx_Oracle
import os
from dotenv import load_dotenv
from contextlib import contextmanager

# Load environment variables from .env
load_dotenv()

DB_USER = os.getenv("ORACLE_USERNAME")
DB_PASSWORD = os.getenv("ORACLE_PASSWORD")
DB_DSN = os.getenv("ORACLE_DSN")

@contextmanager
def get_db():
    connection = None
    try:
        connection = cx_Oracle.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            dsn=DB_DSN
        )
        yield connection
    except cx_Oracle.DatabaseError as e:
        print("❌ Database connection error:", e)
        raise
    finally:
        if connection:
            connection.close()
