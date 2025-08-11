from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database import get_db

router = APIRouter(prefix="/ground-stations", tags=["Ground Stations"])

# ------------------- Pydantic Models -------------------

class GroundStationCreate(BaseModel):
    station_name: str
    location: str
    contact_frequency: Optional[float]

class GroundStation(GroundStationCreate):
    station_id: int

# ------------------- CREATE -------------------

@router.post("/", response_model=GroundStation, status_code=201)
def create_ground_station(ground_station: GroundStationCreate):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO Ground_Stations (station_name, location, contact_frequency)
                VALUES (:1, :2, :3)
            """, (
                ground_station.station_name,
                ground_station.location,
                ground_station.contact_frequency
            ))
            conn.commit()

            cursor.execute("SELECT MAX(station_id) FROM Ground_Stations")
            station_id = cursor.fetchone()[0]
            return {**ground_station.dict(), "station_id": station_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------- READ ALL -------------------

@router.get("/", response_model=List[GroundStation])
def get_all_ground_stations():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Ground_Stations")
            rows = cursor.fetchall()
            return [
                GroundStation(
                    station_id=row[0],
                    station_name=row[1],
                    location=row[2],
                    contact_frequency=row[3]
                ) for row in rows
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------- READ BY ID -------------------

@router.get("/{station_id}", response_model=GroundStation)
def get_ground_station_by_id(station_id: int):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Ground_Stations WHERE station_id = :1", [station_id])
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Ground station not found")
            return GroundStation(
                station_id=row[0],
                station_name=row[1],
                location=row[2],
                contact_frequency=row[3]
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------- UPDATE -------------------

@router.put("/{station_id}", response_model=GroundStation)
def update_ground_station(station_id: int, updated: GroundStationCreate):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE Ground_Stations
                SET station_name = :1, location = :2, contact_frequency = :3
                WHERE station_id = :4
            """, (
                updated.station_name,
                updated.location,
                updated.contact_frequency,
                station_id
            ))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Ground station not found")
            conn.commit()
            return {**updated.dict(), "station_id": station_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------- DELETE -------------------

@router.delete("/{station_id}")
def delete_ground_station(station_id: int):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM Ground_Stations WHERE station_id = :1", [station_id])
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Ground station not found")
            conn.commit()
            return {"message": f"Ground station {station_id} deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
