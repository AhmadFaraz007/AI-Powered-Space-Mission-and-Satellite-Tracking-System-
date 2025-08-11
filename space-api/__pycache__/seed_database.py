import csv
import os
from datetime import datetime
from database import get_db
import traceback

BASE_DIR = os.path.dirname(__file__)
SEED_DIR = os.path.join(BASE_DIR, "seed_data")

def log_system_event(cursor, message, level="INFO"):
    """
    Log a system event to the System_Logs table
    """
    try:
        sql = "INSERT INTO System_Logs (log_message, log_level, log_time) VALUES (:1, :2, :3)"
        cursor.execute(sql, (message, level, datetime.now()))
    except Exception as e:
        print(f"⚠️ Failed to write to System_Logs: {e}")

def insert_data_from_csv(cursor, table_name, columns, file_name):
    file_path = os.path.join(SEED_DIR, file_name)
    try:
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = [
                tuple(row.get(col, None) if row.get(col, None) != '' else None for col in columns)
                for row in reader
            ]

            placeholders = ", ".join([f":{i+1}" for i in range(len(columns))])
            sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"

            for row in rows:
                try:
                    cursor.execute(sql, row)
                except Exception as row_error:
                    error_msg = f"❌ Row insert failed in {table_name}: {row} — {row_error}"
                    print(error_msg)
                    log_system_event(cursor, error_msg, "ERROR")
    except FileNotFoundError:
        error_msg = f"🚫 File not found: {file_path}"
        print(error_msg)
        log_system_event(cursor, error_msg, "ERROR")
    except Exception as e:
        tb = traceback.format_exc()
        error_msg = f"❌ Unexpected error while seeding {table_name}: {e}\n{tb}"
        print(error_msg)
        log_system_event(cursor, error_msg, "ERROR")

def seed_all():
    with get_db() as conn:
        cursor = conn.cursor()

        tables = [
            ("Missions", ["mission_name", "launch_date", "mission_type", "status"], "missions.csv"),
            ("Satellites", ["satellite_name", "launch_date", "orbit_type", "mission_id"], "satellites.csv"),
            ("Ground_Stations", ["station_name", "location", "contact_frequency"], "ground_stations.csv"),
            ("Satellite_Tracking", ["satellite_id", "station_id", "timestamp", "latitude", "longitude", "altitude_km"], "satellite_tracking.csv"),
            ("Space_Debris", ["description", "latitude", "longitude", "size_meters", "risk_level"], "space_debris.csv"),
            ("Predictions", ["satellite_id", "prediction_date", "status_prediction", "lifespan_months", "collision_risk"], "predictions.csv"),
            ("System_Logs", ["log_message", "log_level", "log_time"], "system_logs.csv")
        ]

        for table_name, cols, filename in tables:
            print(f"📥 Seeding {table_name} from {filename}...")
            insert_data_from_csv(cursor, table_name, cols, filename)

        conn.commit()
        print("✅ Database seeding complete.")

if __name__ == "__main__":
    try:
        seed_all()
    except Exception as e:
        print("❗ A critical error occurred:", e)
