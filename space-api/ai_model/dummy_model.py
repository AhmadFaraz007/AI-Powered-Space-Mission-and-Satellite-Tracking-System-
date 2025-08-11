# ai_model/dummy_model.py

class DummyMissionPredictor:
    def predict_success_chance(self, mission_data: dict) -> float:
        """
        Predicts a dummy mission success chance (0.0 to 1.0).
        In a real scenario, this would involve a trained ML model.
        """
        # Example dummy logic: higher payload mass, lower chance (just for illustration)
        # In a real model, this would be based on complex feature interactions
        payload_mass = mission_data.get("payload_mass_kg", 0)
        base_chance = 0.9  # Start with a high chance
        if payload_mass > 5000:
            return max(0.1, base_chance - (payload_mass / 20000))
        return base_chance

class DummyCollisionPredictor:
    def predict_collision_risk(self, satellite_data: dict) -> str:
        """
        Predicts a dummy satellite collision risk ('High', 'Medium', 'Low').
        In a real scenario, this would involve a trained ML model.
        """
        orbit_type = satellite_data.get("orbit_type", "LEO").lower()
        if orbit_type == "leo":
            return "High"
        elif orbit_type == "meo":
            return "Medium"
        else:
            return "Low"

    def predict_lifespan_months(self, satellite_data: dict) -> int:
        """
        Predicts a dummy satellite lifespan in months.
        In a real scenario, this would involve a trained ML model.
        """
        orbit_type = satellite_data.get("orbit_type", "LEO").lower()
        if orbit_type == "leo":
            return 60  # 5 years
        elif orbit_type == "meo":
            return 120  # 10 years
        else:
            return 180  # 15 years 