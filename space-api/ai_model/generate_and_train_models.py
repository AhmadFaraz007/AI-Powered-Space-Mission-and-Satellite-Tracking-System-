import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os

# Define the directory to save models
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

# --- Synthetic Data Generation ---

def generate_mission_data(num_samples=1000):
    np.random.seed(42)
    data = {
        'payload_mass_kg': np.random.uniform(100, 20000, num_samples),
        'mission_duration_days': np.random.randint(10, 1000, num_samples),
        'launch_vehicle_reliability': np.random.uniform(0.7, 0.99, num_samples),
        'num_stages': np.random.randint(1, 4, num_samples),
    }
    df = pd.DataFrame(data)

    # Simple rule for success: higher reliability, lower mass, shorter duration generally mean higher chance
    df['success_chance'] = (
        0.3 + 
        (df['launch_vehicle_reliability'] * 0.5) - 
        (df['payload_mass_kg'] / 40000) - 
        (df['mission_duration_days'] / 2000)
    ).clip(0.1, 0.95) # Clip between 10% and 95%
    df['success'] = (df['success_chance'] > 0.5).astype(int) # Binary outcome

    return df

def generate_satellite_data(num_samples=1000):
    np.random.seed(42)
    orbit_types = ['LEO', 'MEO', 'GEO']
    risk_levels = ['Low', 'Medium', 'High']

    data = {
        'orbit_type': np.random.choice(orbit_types, num_samples),
        'launch_year': np.random.randint(1990, 2023, num_samples),
        'age_at_prediction_months': np.random.randint(1, 300, num_samples), # Age in months
        'maintenance_cost_usd_per_year': np.random.uniform(1000, 50000, num_samples),
        'component_health_score': np.random.uniform(0.1, 1.0, num_samples), # 1.0 = perfect health
    }
    df = pd.DataFrame(data)

    # Simple rule for collision risk and lifespan
    # LEO -> Higher risk, shorter lifespan
    # GEO -> Lower risk, longer lifespan
    df['collision_risk'] = df.apply(lambda row: np.random.choice(
        risk_levels, p=[0.7, 0.2, 0.1] if row['orbit_type'] == 'GEO' else \
                       ([0.2, 0.4, 0.4] if row['orbit_type'] == 'LEO' else \
                        [0.4, 0.4, 0.2])
    ), axis=1)
    
    df['lifespan_months'] = df.apply(lambda row: int(np.random.normal(
        240 if row['orbit_type'] == 'GEO' else (
        60 if row['orbit_type'] == 'LEO' else 120), 20
    )), axis=1).clip(12, 360) # Clip between 1 year and 30 years

    # Adjust risk and lifespan based on other factors
    df['collision_risk'] = df.apply(lambda row: 'High' if row['component_health_score'] < 0.3 else row['collision_risk'], axis=1)
    df['lifespan_months'] = df.apply(lambda row: max(12, row['lifespan_months'] * row['component_health_score'] * 0.8), axis=1) # Health affects lifespan

    return df

# --- Model Training and Saving ---

def train_and_save_mission_model(df):
    X = df.drop(columns=['success_chance', 'success'])
    y = df['success']

    # Preprocessing pipeline
    numeric_features = ['payload_mass_kg', 'mission_duration_days', 'launch_vehicle_reliability', 'num_stages']
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features)
        ])

    model = Pipeline(steps=[('preprocessor', preprocessor),
                            ('classifier', RandomForestClassifier(random_state=42))])

    model.fit(X, y)
    joblib.dump(model, os.path.join(MODEL_DIR, 'mission_success_model.joblib'))
    print("Mission Success Model trained and saved.")

def train_and_save_satellite_models(df):
    # Collision Risk Model
    X_risk = df.drop(columns=['collision_risk', 'lifespan_months'])
    y_risk = df['collision_risk']

    categorical_features_risk = ['orbit_type']
    numeric_features_risk = ['launch_year', 'age_at_prediction_months', 'maintenance_cost_usd_per_year', 'component_health_score']

    preprocessor_risk = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features_risk),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features_risk)
        ])

    risk_model = Pipeline(steps=[('preprocessor', preprocessor_risk),
                                 ('classifier', RandomForestClassifier(random_state=42))])

    risk_model.fit(X_risk, y_risk)
    joblib.dump(risk_model, os.path.join(MODEL_DIR, 'satellite_collision_risk_model.joblib'))
    print("Satellite Collision Risk Model trained and saved.")

    # Lifespan Model
    X_lifespan = df.drop(columns=['collision_risk', 'lifespan_months'])
    y_lifespan = df['lifespan_months']

    categorical_features_lifespan = ['orbit_type']
    numeric_features_lifespan = ['launch_year', 'age_at_prediction_months', 'maintenance_cost_usd_per_year', 'component_health_score']

    preprocessor_lifespan = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features_lifespan),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features_lifespan)
        ])

    lifespan_model = Pipeline(steps=[('preprocessor', preprocessor_lifespan),
                                     ('regressor', RandomForestRegressor(random_state=42))])

    lifespan_model.fit(X_lifespan, y_lifespan)
    joblib.dump(lifespan_model, os.path.join(MODEL_DIR, 'satellite_lifespan_model.joblib'))
    print("Satellite Lifespan Model trained and saved.")


if __name__ == '__main__':
    print("Generating synthetic mission data...")
    mission_df = generate_mission_data()
    print(f"Generated {len(mission_df)} mission samples.")
    train_and_save_mission_model(mission_df)

    print("\nGenerating synthetic satellite data...")
    satellite_df = generate_satellite_data()
    print(f"Generated {len(satellite_df)} satellite samples.")
    train_and_save_satellite_models(satellite_df)

    print("\nSynthetic data generation and model training complete.") 