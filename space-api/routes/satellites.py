from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database import get_db

router = APIRouter(prefix="/satellites", tags=["Satellites"])

# Pydantic Models
class SatelliteBase(BaseModel):
    satellite_name: str
    mission_id: int
    orbit_type: Optional[str]
    launch_date: Optional[str]

class Satellite(SatelliteBase):
    satellite_id: int

# JOIN ROUTE: /with-mission (must come BEFORE /{satellite_id})
@router.get("/with-mission", tags=["Satellites + Missions"])
def get_satellites_with_mission():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT s.satellite_id, s.satellite_name, s.orbit_type, s.launch_date,
                       m.mission_id, m.mission_name, m.launch_date AS mission_launch_date,
                       m.mission_type, m.status
                FROM Satellites s
                JOIN Missions m ON s.mission_id = m.mission_id
            """)
            columns = [col[0].lower() for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# CREATE
@router.post("/", response_model=Satellite)
def create_satellite(satellite: SatelliteBase):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO Satellites (satellite_name, mission_id, orbit_type, launch_date)
                VALUES (:1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'))
            """, [satellite.satellite_name, satellite.mission_id, satellite.orbit_type, satellite.launch_date])
            conn.commit()
            cursor.execute("SELECT satellite_seq.CURRVAL FROM dual")  # Oracle sequence
            satellite_id = cursor.fetchone()[0]
            return {**satellite.dict(), "satellite_id": satellite_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# READ ALL
@router.get("/", response_model=List[Satellite])
def get_all_satellites():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT satellite_id, satellite_name, mission_id, orbit_type, TO_CHAR(launch_date, 'YYYY-MM-DD')
                FROM Satellites
            """)
            results = [Satellite(
                satellite_id=row[0],
                satellite_name=row[1],
                mission_id=row[2],
                orbit_type=row[3],
                launch_date=row[4]
            ) for row in cursor.fetchall()]
            return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# READ BY ID
@router.get("/{satellite_id}", response_model=Satellite)
def get_satellite_by_id(satellite_id: int):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT satellite_id, satellite_name, mission_id, orbit_type, TO_CHAR(launch_date, 'YYYY-MM-DD')
                FROM Satellites
                WHERE satellite_id = :1
            """, [satellite_id])
            row = cursor.fetchone()
            if row:
                return Satellite(
                    satellite_id=row[0],
                    satellite_name=row[1],
                    mission_id=row[2],
                    orbit_type=row[3],
                    launch_date=row[4]
                )
            raise HTTPException(status_code=404, detail="Satellite not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# UPDATE
@router.put("/{satellite_id}", response_model=Satellite)
def update_satellite(satellite_id: int, satellite: SatelliteBase):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE Satellites
                SET satellite_name = :1,
                    mission_id = :2,
                    orbit_type = :3,
                    launch_date = TO_DATE(:4, 'YYYY-MM-DD')
                WHERE satellite_id = :5
            """, [satellite.satellite_name, satellite.mission_id, satellite.orbit_type, satellite.launch_date, satellite_id])
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Satellite not found")
            conn.commit()
            return {**satellite.dict(), "satellite_id": satellite_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# DELETE
@router.delete("/{satellite_id}")
def delete_satellite(satellite_id: int):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM Satellites WHERE satellite_id = :1", [satellite_id])
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Satellite not found")
            conn.commit()
            return {"message": f"Satellite {satellite_id} deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
