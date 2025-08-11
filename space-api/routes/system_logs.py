from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from database import get_db

router = APIRouter(prefix="/logs", tags=["System Logs"])


# Pydantic models
class LogCreate(BaseModel):
    log_message: str
    log_level: str


class LogOut(LogCreate):
    log_id: int
    log_time: str


# CREATE
@router.post("/", response_model=dict)
def create_log(log: LogCreate, db=Depends(get_db)):
    try:
        with db as conn:
            cursor = conn.cursor()
            log_id = cursor.var(int)

            cursor.execute("""
                INSERT INTO System_Logs (log_message, log_level)
                VALUES (:1, :2)
                RETURNING log_id INTO :3
            """, [log.log_message, log.log_level, log_id])

            conn.commit()
            return {"message": "Log created successfully", "log_id": log_id.getvalue()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# READ ALL
@router.get("/", response_model=List[LogOut])
def get_all_logs(db=Depends(get_db)):
    try:
        with db as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT log_id, log_message, log_level, log_time FROM System_Logs ORDER BY log_time DESC")
            rows = cursor.fetchall()

            result = []
            for row in rows:
                result.append({
                    "log_id": row[0],
                    "log_message": row[1],
                    "log_level": row[2],
                    "log_time": row[3].strftime("%Y-%m-%d %H:%M:%S")
                })
            return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# READ ONE
@router.get("/{log_id}", response_model=LogOut)
def get_log(log_id: int, db=Depends(get_db)):
    try:
        with db as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT log_id, log_message, log_level, log_time
                FROM System_Logs WHERE log_id = :1
            """, [log_id])
            row = cursor.fetchone()
            if row:
                return {
                    "log_id": row[0],
                    "log_message": row[1],
                    "log_level": row[2],
                    "log_time": row[3].strftime("%Y-%m-%d %H:%M:%S")
                }
            else:
                raise HTTPException(status_code=404, detail="Log not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# UPDATE
@router.put("/{log_id}", response_model=dict)
def update_log(log_id: int, log: LogCreate, db=Depends(get_db)):
    try:
        with db as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE System_Logs
                SET log_message = :1, log_level = :2
                WHERE log_id = :3
            """, [log.log_message, log.log_level, log_id])

            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Log not found")

            conn.commit()
            return {"message": "Log updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# DELETE
@router.delete("/{log_id}", response_model=dict)
def delete_log(log_id: int, db=Depends(get_db)):
    try:
        with db as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM System_Logs WHERE log_id = :1", [log_id])

            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Log not found")

            conn.commit()
            return {"message": "Log deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
