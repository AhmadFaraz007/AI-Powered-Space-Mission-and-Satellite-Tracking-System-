from fastapi import FastAPI, Depends
from routes import missions, satellites
from routes import ground_stations
from routes import satellite_tracking
from routes import space_debris
from routes import predictions
from routes import system_logs
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# from ai_model.dummy_model import DummyMissionPredictor, DummyCollisionPredictor # Removed dummy imports
from fastapi import APIRouter
import joblib # Import joblib for loading models
import pandas as pd # Import pandas for data processing
import os
from database import get_db # Import get_db
from datetime import datetime # Import datetime for timestamp
import httpx # Import httpx for making async HTTP requests

app = FastAPI(
    title="Space Missions & Satellites API",
    description="Manage space missions and satellites with this API.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],  # Allow requests from both frontend origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Define the directory where models are saved
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ai_model")

# Load the trained models
try:
    mission_success_model = joblib.load(os.path.join(MODEL_DIR, 'mission_success_model.joblib'))
    satellite_collision_risk_model = joblib.load(os.path.join(MODEL_DIR, 'satellite_collision_risk_model.joblib'))
    satellite_lifespan_model = joblib.load(os.path.join(MODEL_DIR, 'satellite_lifespan_model.joblib'))
    print("AI models loaded successfully!")
except FileNotFoundError:
    print(f"Error: Model files not found in {MODEL_DIR}. Please run generate_and_train_models.py first.")
    # Exit or handle gracefully if models are not found
    exit(1) # Exit the application if models are not found

# Define Pydantic models for prediction requests
class MissionPredictionRequest(BaseModel):
    payload_mass_kg: float
    mission_duration_days: float = 300 # Added for synthetic model
    launch_vehicle_reliability: float = 0.95 # Added for synthetic model
    num_stages: int = 2 # Added for synthetic model

class SatellitePredictionRequest(BaseModel):
    satellite_id: int # Added satellite_id for database storage
    orbit_type: str
    launch_year: int = 2020 # Added for synthetic model
    age_at_prediction_months: int = 24 # Added for synthetic model
    maintenance_cost_usd_per_year: float = 20000 # Added for synthetic model
    component_health_score: float = 0.8 # Added for synthetic model

# Create a new APIRouter for AI predictions
ai_router = APIRouter()

@ai_router.post("/predict/mission_success")
async def predict_mission_success(request: MissionPredictionRequest):
    # Convert request data to DataFrame for model prediction
    input_df = pd.DataFrame([request.dict()])
    
    # Predict success probability
    success_chance = mission_success_model.predict_proba(input_df)[:, 1][0] # Probability of the 'success' class (1)
    return {"mission_success_chance": round(success_chance, 2)}

@ai_router.post("/predict/satellite_collision")
async def predict_satellite_collision(request: SatellitePredictionRequest):
    input_data = request.dict()
    satellite_id = input_data.pop("satellite_id")
    
    input_df = pd.DataFrame([input_data])
    
    collision_risk_pred = satellite_collision_risk_model.predict(input_df)[0]
    lifespan_months_pred = int(satellite_lifespan_model.predict(input_df)[0])

    # Prepare data for the predictions endpoint
    prediction_data = {
        "satellite_id": satellite_id,
        "status_prediction": str(collision_risk_pred), # Convert to string
        "lifespan_months": lifespan_months_pred,
        "collision_risk": str(collision_risk_pred) # Convert to string
    }

    # Make an internal POST request to the /predictions/predictions/ endpoint
    async with httpx.AsyncClient() as client:
        try:
            # Use the correct base URL for the internal call
            response = await client.post(
                "http://localhost:8000/predictions/predictions/",
                json=prediction_data
            )
            response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)
            saved_prediction_info = response.json()
            saved_prediction_id = saved_prediction_info.get("prediction_id")
        except httpx.HTTPStatusError as e:
            print(f"Error saving prediction via internal API call: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=500, detail=f"Failed to save prediction: {e.response.text}")
        except httpx.RequestError as e:
            print(f"Network error during internal API call: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to connect to predictions service: {e}")

    return {
        "collision_risk": collision_risk_pred,
        "lifespan_months": lifespan_months_pred,
        "saved_prediction_id": saved_prediction_id
    }

# Include routers from both modules
app.include_router(missions.router)
app.include_router(satellites.router)
app.include_router(ground_stations.router)
app.include_router(satellite_tracking.router)
app.include_router(space_debris.router)
app.include_router(predictions.router)
app.include_router(system_logs.router)
app.include_router(ai_router, prefix="/ai", tags=["AI Predictions"])

@app.get("/")
def root():
    return {"message": "Space Mission & Satellite Tracking API is running 🚀"}


