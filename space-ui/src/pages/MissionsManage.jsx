import React, { useState, useEffect } from 'react';
import MissionFormModal from '../components/MissionFormModal';
import MissionAnalytics from '../components/MissionAnalytics';
import UpcomingMissions from '../components/UpcomingMissions';
import { motion } from 'framer-motion';

const MissionsManage = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMission, setCurrentMission] = useState({
    id: null,
    mission_name: '',
    launch_date: '',
    mission_type: '',
    status: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [missionToDeleteId, setMissionToDeleteId] = useState(null);

  // State for search functionality
  const [searchMissionId, setSearchMissionId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // State for AI-Powered Mission Success Prediction
  const [payloadMass, setPayloadMass] = useState('');
  const [predictedMissionSuccessChance, setPredictedMissionSuccessChance] = useState(null);
  const [predictingMissionSuccess, setPredictingMissionSuccess] = useState(false);
  const [missionPredictionError, setMissionPredictionError] = useState(null);

  // New state variables for AI-Powered Mission Success Prediction
  const [missionDurationDays, setMissionDurationDays] = useState('');
  const [launchVehicleReliability, setLaunchVehicleReliability] = useState('');
  const [numStages, setNumStages] = useState('');

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetch('http://localhost:8000/missions/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Map backend mission_id to frontend id
        const missionsWithFrontendId = data.map(mission => ({
          ...mission,
          id: mission.mission_id // Map backend mission_id to frontend id
        }));
        setMissions(missionsWithFrontendId);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch missions:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchMissions();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentMission({ ...currentMission, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMission.mission_name || !currentMission.status || !currentMission.launch_date) return;

    setIsSubmitting(true);
    setError(null); // Clear previous errors

    const url = currentMission.id === null ? 'http://localhost:8000/missions/' : `http://localhost:8000/missions/${currentMission.id}`;
    const method = currentMission.id === null ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mission_name: currentMission.mission_name,
          launch_date: currentMission.launch_date,
          mission_type: currentMission.mission_type,
          status: currentMission.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Re-fetch all missions to ensure the list is up-to-date
      const fetchResponse = await fetch('http://localhost:8000/missions/');
      if (!fetchResponse.ok) {
         throw new Error(`Failed to re-fetch missions: HTTP error! status: ${fetchResponse.status}`);
      }
      const updatedMissions = await fetchResponse.json();
       const missionsWithFrontendId = updatedMissions.map(mission => ({
          ...mission,
          id: mission.mission_id // Map backend mission_id to frontend id
        }));
      setMissions(missionsWithFrontendId);

      setCurrentMission({ id: null, mission_name: '', launch_date: '', mission_type: '', status: '' }); // Clear form
      setIsModalOpen(false); // Close modal on submit
    } catch (err) {
      console.error(`Failed to ${method === 'POST' ? 'add' : 'update'} mission:`, err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    setCurrentMission({ id: null, mission_name: '', launch_date: '', mission_type: '', status: '' }); // Clear for new mission
    setIsModalOpen(true);
  };

  const handleEditClick = (mission) => {
    setCurrentMission(mission);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setMissionToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (missionToDeleteId === null) return;

    setError(null); // Clear previous errors

    try {
      const response = await fetch(`http://localhost:8000/missions/${missionToDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Remove the mission from the state
      setMissions(missions.filter(mission => mission.id !== missionToDeleteId));
      console.log(`Deleted mission with id: ${missionToDeleteId}`);
    } catch (err) {
      console.error(`Failed to delete mission with id ${missionToDeleteId}:`, err);
      setError(err);
    } finally {
      setShowDeleteConfirm(false);
      setMissionToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setMissionToDeleteId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMission({ id: null, mission_name: '', launch_date: '', mission_type: '', status: '' }); // Clear form on close
  };

  const handleSearch = async () => {
      if (!searchMissionId) return; // Don't search if input is empty

      setSearching(true);
      setSearchResult(null); // Clear previous results
      setSearchError(null); // Clear previous errors

      try {
          const response = await fetch(`http://localhost:8000/missions/${searchMissionId}`);
          if (response.status === 404) {
              setSearchError('Mission not found.');
              setSearchResult(null);
          } else if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
          } else {
              const data = await response.json();
              setSearchResult(data);
          }
      } catch (err) {
          console.error("Failed to search mission:", err);
          setSearchError(err.message);
          setSearchResult(null);
      } finally {
          setSearching(false);
      }
  };

  const handlePredictMissionSuccess = async () => {
    if (!payloadMass) {
      setMissionPredictionError('Please enter a payload mass.');
      return;
    }

    setPredictingMissionSuccess(true);
    setMissionPredictionError(null);

    try {
      const response = await fetch('http://localhost:8000/ai/predict/mission_success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload_mass_kg: parseFloat(payloadMass),
          mission_duration_days: parseFloat(missionDurationDays),
          launch_vehicle_reliability: parseFloat(launchVehicleReliability),
          num_stages: parseFloat(numStages),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPredictedMissionSuccessChance(data.mission_success_chance);
    } catch (err) {
      console.error('Failed to predict mission success:', err);
      setMissionPredictionError(err.message);
    } finally {
      setPredictingMissionSuccess(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'nasa-badge-active';
      case 'completed':
        return 'nasa-badge-completed';
      case 'planned':
        return 'nasa-badge-planned';
      case 'failed':
        return 'nasa-badge-failed';
      default:
        return 'nasa-badge';
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Loading missions...</div>;
  }

  // Display error if initial fetch failed and missions list is empty
  if (error && missions.length === 0 && !searching) {
    return <div className="p-6 text-red-500">Error loading missions: {error.message}</div>;
  }

  return (
    <div className="pt-14 p-6 text-white nasa-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Missions Management</h1>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-800/80 text-white p-4 rounded-lg mb-4">
              Error: {error.message}
            </div>
          )}

           {/* Search Mission Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Search Mission by ID</h2>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Enter Mission ID"
                value={searchMissionId}
                onChange={(e) => setSearchMissionId(e.target.value)}
                className="flex-grow rounded-md bg-gray-700 text-white border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              />
              <button
                className="nasa-button"
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchError && (
                <div className="text-red-500 mt-4">{searchError}</div>
            )}

            {searchResult && (
                <div className="mt-4 bg-gray-700/50 rounded-md p-4">
                    <h3 className="font-bold text-lg">Found Mission: {searchResult.mission_name}</h3>
                    <div className="text-sm text-gray-300">ID: {searchResult.mission_id}</div>
                    <div className="text-sm text-gray-300">Status: {searchResult.status}</div>
                    <div className="text-sm text-gray-300">Launch Date: {searchResult.launch_date}</div>
                    {searchResult.mission_type && <div className="text-sm text-gray-300">Type: {searchResult.mission_type}</div>}
                </div>
            )}

          </div>

          {/* AI-Powered Mission Success Prediction Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-white">AI-Powered Mission Success Prediction</h2>
            <div className="flex flex-col space-y-4">
              <label htmlFor="payload_mass" className="text-gray-300">Payload Mass (kg):</label>
              <input
                type="number"
                id="payload_mass"
                value={payloadMass}
                onChange={(e) => setPayloadMass(e.target.value)}
                placeholder="Enter payload mass in kg"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />

              <label htmlFor="mission_duration_days" className="text-gray-300">Mission Duration (Days):</label>
              <input
                type="number"
                id="mission_duration_days"
                value={missionDurationDays}
                onChange={(e) => setMissionDurationDays(e.target.value)}
                placeholder="Enter mission duration in days"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />

              <label htmlFor="launch_vehicle_reliability" className="text-gray-300">Launch Vehicle Reliability (0.0-1.0):</label>
              <input
                type="number"
                id="launch_vehicle_reliability"
                step="0.01"
                value={launchVehicleReliability}
                onChange={(e) => setLaunchVehicleReliability(e.target.value)}
                placeholder="e.g., 0.95"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />

              <label htmlFor="num_stages" className="text-gray-300">Number of Stages:</label>
              <input
                type="number"
                id="num_stages"
                value={numStages}
                onChange={(e) => setNumStages(e.target.value)}
                placeholder="e.g., 2"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />

              <button
                onClick={handlePredictMissionSuccess}
                className="nasa-button mt-4"
                disabled={predictingMissionSuccess}
              >
                {predictingMissionSuccess ? 'Predicting...' : 'Predict Mission Success Chance'}
              </button>
            </div>

            {predictedMissionSuccessChance !== null && ( /* Display prediction results */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 p-4 bg-gray-700/50 rounded-md text-white border border-gray-600"
              >
                <h3 className="font-bold text-lg mb-2">Prediction Results:</h3>
                <p className="text-sm mb-1">Mission Success Chance: <span className="font-semibold">{(predictedMissionSuccessChance * 100).toFixed(2)}%</span></p>
              </motion.div>
            )}
            {missionPredictionError && (
                <div className="text-red-500 mt-4">{missionPredictionError}</div>
            )}
          </div>

          {/* Add New Mission Button - Moved Here */}

          {/* Missions Table */}
          <div className="bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Existing Missions</h2>
              <button
                className="nasa-button-sm flex items-center"
                onClick={handleAddClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3h-3a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Mission
              </button>
            </div>

            {missions.length === 0 ? (
              <p>No missions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mission ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mission Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Launch Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mission Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {missions.slice(0, 5).map(mission => (
                      <tr key={mission.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{mission.mission_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{mission.mission_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{mission.launch_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{mission.mission_type || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={getStatusBadgeClass(mission.status)}>
                            {mission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-blue-400 hover:text-blue-600 mr-4 transition-colors"
                            onClick={() => handleEditClick(mission)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-400 hover:text-red-600 transition-colors"
                            onClick={() => handleDeleteClick(mission.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Analytics Section */}
          {/* Only show analytics if missions are loaded and there's no error preventing display */}
          {!loading && !error && missions.length > 0 && <MissionAnalytics missions={missions} />}

          {/* Upcoming Missions Section */}
          <UpcomingMissions />
        </div>
      </div>

      {/* Mission Form Modal */}
      <MissionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentMission={currentMission}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-white">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this mission?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="nasa-button"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                className="nasa-button-danger"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionsManage; 