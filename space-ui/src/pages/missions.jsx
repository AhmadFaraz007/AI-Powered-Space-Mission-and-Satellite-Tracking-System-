// src/pages/Missions.jsx
import React, { useEffect, useState } from 'react';
import axiosClient from "../api/axiosclient";
import MissionCard from '../components/MissionCard';


const Missions = () => {
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    axiosClient.get('/missions/')
      .then((response) => {
        setMissions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching missions:", error);
      });
  }, []);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 text-transparent bg-clip-text">🚀 Space Missions Dashboard</h1>
      {missions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 glass-section">
          <img src="/images/empty-missions.svg" alt="No missions" className="w-40 mb-6 opacity-80" />
          <p className="text-lg text-gray-400 mb-2">No missions found.</p>
          <p className="text-base text-gray-500">Launch a new mission to get started!</p>
        </div>
      ) : (
        <div className="glass-section p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission) => (
              <MissionCard
                key={mission.mission_id}
                mission={{
                  name: mission.mission_name,
                  status: mission.status || 'Unknown',
                  date: mission.launch_date || '',
                  description: mission.mission_type || '',
                  launchSite: mission.launch_site || 'N/A',
                  vehicle: mission.vehicle || 'N/A',
                  tags: mission.tags || [],
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)',
    minHeight: '100vh',
    color: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: '2.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
};

export default Missions;
