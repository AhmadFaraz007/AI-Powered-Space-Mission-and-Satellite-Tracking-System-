from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import get_db
import cx_Oracle

router = APIRouter(prefix="/satellite_tracking", tags=["Satellite_tracking"])

# -------------------- Models --------------------

class TrackingCreate(BaseModel):
    satellite_id: int
    station_id: int
    timestamp: datetime
    latitude: float
    longitude: float
    altitude_km: float

class Tracking(TrackingCreate):
    track_id: int

# -------------------- Create --------------------

@router.post("/", response_model=Tracking)
def create_tracking(tracking: TrackingCreate):
    try:
        with get_db() as connection:
            cursor = connection.cursor()
            track_id = cursor.var(int)

            cursor.execute("""
                INSERT INTO Satellite_Tracking (
                    satellite_id, station_id, timestamp,
                    latitude, longitude, altitude_km
                )
                VALUES (:satellite_id, :station_id, :timestamp,
                        :latitude, :longitude, :altitude_km)
                RETURNING track_id INTO :track_id
            """, {
                "satellite_id": tracking.satellite_id,
                "station_id": tracking.station_id,
                "timestamp": tracking.timestamp,
                "latitude": tracking.latitude,
                "longitude": tracking.longitude,
                "altitude_km": tracking.altitude_km,
                "track_id": track_id
            })

            connection.commit()

            return Tracking(
                track_id=track_id.getvalue()[0],
                **tracking.dict()
            )

    except cx_Oracle.DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------- Read All --------------------

@router.get("/", response_model=List[Tracking])
def get_all_tracking():
    try:
        with get_db() as connection:
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM Satellite_Tracking")
            rows = cursor.fetchall()

            tracking_list = []
            for row in rows:
                tracking_list.append(Tracking(
                    track_id=row[0],
                    satellite_id=row[1],
                    station_id=row[2],
                    timestamp=row[3].isoformat(),
                    latitude=row[4],
                    longitude=row[5],
                    altitude_km=row[6]
                ))
            return tracking_list

    except cx_Oracle.DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------- Read by ID --------------------

@router.get("/{track_id}", response_model=Tracking)
def get_tracking_by_id(track_id: int):
    try:
        with get_db() as connection:
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM Satellite_Tracking WHERE track_id = :track_id", {"track_id": track_id})
            row = cursor.fetchone()

            if row is None:
                raise HTTPException(status_code=404, detail="Tracking not found")

            return Tracking(
                track_id=row[0],
                satellite_id=row[1],
                station_id=row[2],
                timestamp=row[3].isoformat(),
                latitude=row[4],
                longitude=row[5],
                altitude_km=row[6]
            )

    except cx_Oracle.DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------- Update --------------------

@router.put("/{track_id}", response_model=Tracking)
def update_tracking(track_id: int, tracking: TrackingCreate):
    try:
        with get_db() as connection:
            cursor = connection.cursor()

            cursor.execute("""
                UPDATE Satellite_Tracking SET
                    satellite_id = :satellite_id,
                    station_id = :station_id,
                    timestamp = :timestamp,
                    latitude = :latitude,
                    longitude = :longitude,
                    altitude_km = :altitude_km
                WHERE track_id = :track_id
            """, {
                "satellite_id": tracking.satellite_id,
                "station_id": tracking.station_id,
                "timestamp": tracking.timestamp,
                "latitude": tracking.latitude,
                "longitude": tracking.longitude,
                "altitude_km": tracking.altitude_km,
                "track_id": track_id
            })

            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Tracking not found")

            connection.commit()

            return Tracking(
                track_id=track_id,
                **tracking.dict()
            )

    except cx_Oracle.DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------- Delete --------------------

@router.delete("/{track_id}")
def delete_tracking(track_id: int):
    try:
        with get_db() as connection:
            cursor = connection.cursor()
            cursor.execute("DELETE FROM Satellite_Tracking WHERE track_id = :track_id", {"track_id": track_id})

            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Tracking not found")

            connection.commit()

            return {"message": "Tracking deleted successfully."}

    except cx_Oracle.DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))
