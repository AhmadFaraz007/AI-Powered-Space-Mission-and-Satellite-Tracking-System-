from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database import get_db

router = APIRouter(prefix="/missions", tags=["missions"])

# --------------------- Mission Models ---------------------

class MissionCreate(BaseModel):
    mission_name: str
    launch_date: str  # Format: 'YYYY-MM-DD'
    mission_type: Optional[str]
    status: Optional[str]

class Mission(MissionCreate):
    mission_id: int

# --------------------- CRUD Endpoints ---------------------

@router.post("/", response_model=Mission)
def create_mission(mission: MissionCreate):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO Missions (mission_name, launch_date, mission_type, status)
                VALUES (:1, TO_DATE(:2, 'YYYY-MM-DD'), :3, :4)
            """, (mission.mission_name, mission.launch_date, mission.mission_type, mission.status))
            conn.commit()

            cursor.execute("SELECT MAX(mission_id) FROM Missions")
            mission_id = cursor.fetchone()[0]
            return {**mission.dict(), "mission_id": mission_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Mission])
def get_all_missions():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Missions")
            rows = cursor.fetchall()
            missions = []
            for row in rows:
                missions.append({
                    "mission_id": row[0],
                    "mission_name": row[1],
                    "launch_date": row[2].strftime("%Y-%m-%d") if row[2] else None,
                    "mission_type": row[3],
                    "status": row[4]
                })
            return missions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{mission_id}", response_model=Mission)
def get_mission_by_id(mission_id: int):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Missions WHERE mission_id = :1", [mission_id])
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Mission not found")
            return {
                "mission_id": row[0],
                "mission_name": row[1],
                "launch_date": row[2].strftime("%Y-%m-%d") if row[2] else None,
                "mission_type": row[3],
                "status": row[4]
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{mission_id}", response_model=Mission)
def update_mission(mission_id: int, mission: MissionCreate):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE Missions
                SET mission_name = :1,
                    launch_date = TO_DATE(:2, 'YYYY-MM-DD'),
                    mission_type = :3,
                    status = :4
                WHERE mission_id = :5
            """, (mission.mission_name, mission.launch_date, mission.mission_type, mission.status, mission_id))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Mission not found")
            conn.commit()
            return {**mission.dict(), "mission_id": mission_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{mission_id}")
def delete_mission(mission_id: int):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM Missions WHERE mission_id = :1", [mission_id])
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Mission not found")
            conn.commit()
            return {"message": f"Mission {mission_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
