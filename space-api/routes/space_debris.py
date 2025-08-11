from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from fastapi import APIRouter, HTTPException
from database import get_db
import cx_Oracle


router = APIRouter(
    prefix="/space-debris",
    tags=["Space Debris"]
)

# Pydantic models
class SpaceDebrisIn(BaseModel):
    description: str
    latitude: float
    longitude: float
    size_meters: float
    risk_level: str

class SpaceDebrisOut(SpaceDebrisIn):
    debris_id: int

# GET all debris
@router.get("/", response_model=List[SpaceDebrisOut])
def get_all_debris():
    with get_db() as connection:
        cursor = connection.cursor()
        try:
            cursor.execute("""
                SELECT debris_id, description, latitude, longitude, size_meters, risk_level
                FROM Space_Debris
            """)
            rows = cursor.fetchall()
            return [
                {
                    "debris_id": row[0],
                    "description": row[1],
                    "latitude": row[2],
                    "longitude": row[3],
                    "size_meters": row[4],
                    "risk_level": row[5],
                }
                for row in rows
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# GET debris by ID
@router.get("/{debris_id}", response_model=SpaceDebrisOut)
def get_debris_by_id(debris_id: int):
    with get_db() as connection:
        cursor = connection.cursor()
        try:
            cursor.execute("""
                SELECT debris_id, description, latitude, longitude, size_meters, risk_level
                FROM Space_Debris
                WHERE debris_id = :id
            """, {"id": debris_id})
            row = cursor.fetchone()
            if row:
                return {
                    "debris_id": row[0],
                    "description": row[1],
                    "latitude": row[2],
                    "longitude": row[3],
                    "size_meters": row[4],
                    "risk_level": row[5],
                }
            else:
                raise HTTPException(status_code=404, detail="Debris not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# POST create new debris
@router.post("/", response_model=SpaceDebrisOut)
def create_space_debris(debris: SpaceDebrisIn):

    with get_db() as connection:
        cursor = connection.cursor()
        try:
            debris_id_var = cursor.var(cx_Oracle.NUMBER)
            cursor.execute("""
                INSERT INTO Space_Debris (description, latitude, longitude, size_meters, risk_level)
                VALUES (:description, :latitude, :longitude, :size_meters, :risk_level)
                RETURNING debris_id INTO :debris_id
            """, {
                "description": debris.description,
                "latitude": debris.latitude,
                "longitude": debris.longitude,
                "size_meters": debris.size_meters,
                "risk_level": debris.risk_level,
                "debris_id": debris_id_var
            })
            connection.commit()
            debris_id = int(debris_id_var.getvalue()[0])
            return {**debris.dict(), "debris_id": debris_id}
        except cx_Oracle.DatabaseError as e:
            raise HTTPException(status_code=500, detail=str(e))


# PUT update debris
@router.put("/{debris_id}", response_model=SpaceDebrisOut)
def update_debris(debris_id: int, debris: SpaceDebrisIn):
    with get_db() as connection:
        cursor = connection.cursor()
        try:
            cursor.execute("""
                UPDATE Space_Debris
                SET description = :1,
                    latitude = :2,
                    longitude = :3,
                    size_meters = :4,
                    risk_level = :5
                WHERE debris_id = :6
            """, (
                debris.description,
                debris.latitude,
                debris.longitude,
                debris.size_meters,
                debris.risk_level,
                debris_id
            ))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Debris not found")
            connection.commit()
            return {
                "debris_id": debris_id,
                **debris.dict()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# DELETE debris
@router.delete("/{debris_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_debris(debris_id: int):
    with get_db() as connection:
        cursor = connection.cursor()
        try:
            cursor.execute("DELETE FROM Space_Debris WHERE debris_id = :id", {"id": debris_id})
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Debris not found")
            connection.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
