from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from database import get_db

router = APIRouter(prefix="/predictions", tags=["Predictions"])


class Prediction(BaseModel):
    satellite_id: int
    status_prediction: str
    lifespan_months: int
    collision_risk: str


class PredictionOut(Prediction):
    prediction_id: int
    prediction_date: str


# Helper to extract DB connection from generator
def get_db_conn():
    with get_db() as conn:
        yield conn


@router.post("/predictions/", response_model=dict)
def create_prediction(prediction: Prediction, db=Depends(get_db_conn)):
    try:
        cursor = db.cursor()
        pred_id = cursor.var(int)

        cursor.execute("""
            INSERT INTO Predictions (satellite_id, status_prediction, lifespan_months, collision_risk)
            VALUES (:1, :2, :3, :4)
            RETURNING prediction_id INTO :5
        """, [
            prediction.satellite_id,
            prediction.status_prediction,
            prediction.lifespan_months,
            prediction.collision_risk,
            pred_id
        ])

        db.commit()
        return {"message": "Prediction created successfully", "prediction_id": pred_id.getvalue()}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predictions/", response_model=List[PredictionOut])
def get_all_predictions(db=Depends(get_db_conn)):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT prediction_id, satellite_id, prediction_date, status_prediction, lifespan_months, collision_risk FROM Predictions")
        rows = cursor.fetchall()

        return [
            {
                "prediction_id": row[0],
                "satellite_id": row[1],
                "prediction_date": row[2].strftime("%Y-%m-%d %H:%M:%S"),
                "status_prediction": row[3],
                "lifespan_months": row[4],
                "collision_risk": row[5],
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predictions/{prediction_id}", response_model=PredictionOut)
def get_prediction(prediction_id: int, db=Depends(get_db_conn)):
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT prediction_id, satellite_id, prediction_date, status_prediction, lifespan_months, collision_risk
            FROM Predictions WHERE prediction_id = :1
        """, [prediction_id])
        row = cursor.fetchone()
        if row:
            return {
                "prediction_id": row[0],
                "satellite_id": row[1],
                "prediction_date": row[2].strftime("%Y-%m-%d %H:%M:%S"),
                "status_prediction": row[3],
                "lifespan_months": row[4],
                "collision_risk": row[5],
            }
        else:
            raise HTTPException(status_code=404, detail="Prediction not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/predictions/{prediction_id}", response_model=dict)
def update_prediction(prediction_id: int, prediction: Prediction, db=Depends(get_db_conn)):
    try:
        cursor = db.cursor()
        cursor.execute("""
            UPDATE Predictions
            SET satellite_id = :1,
                status_prediction = :2,
                lifespan_months = :3,
                collision_risk = :4
            WHERE prediction_id = :5
        """, [
            prediction.satellite_id,
            prediction.status_prediction,
            prediction.lifespan_months,
            prediction.collision_risk,
            prediction_id
        ])

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Prediction not found")

        db.commit()
        return {"message": "Prediction updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/predictions/{prediction_id}", response_model=dict)
def delete_prediction(prediction_id: int, db=Depends(get_db_conn)):
    try:
        cursor = db.cursor()
        cursor.execute("DELETE FROM Predictions WHERE prediction_id = :1", [prediction_id])

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Prediction not found")

        db.commit()
        return {"message": "Prediction deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
