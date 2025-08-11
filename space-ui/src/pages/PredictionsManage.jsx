import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PredictionsFormModal from '../components/PredictionsFormModal';
// Assuming you might have future components for analytics or other related features
// import PredictionsAnalytics from '../components/PredictionsAnalytics';

const PredictionsManage = () => {
  const [predictionRecords, setPredictionRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPredictionRecord, setCurrentPredictionRecord] = useState({
    prediction_id: null,
    satellite_id: '', // Number, FK
    status_prediction: '',
    lifespan_months: '', // Number
    collision_risk: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [predictionToDeleteId, setPredictionToDeleteId] = useState(null);

  // State for search functionality (by ID)
  const [searchPredictionId, setSearchPredictionId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // State for AI-Powered Satellite Prediction
  const [satelliteOrbitType, setSatelliteOrbitType] = useState('');
  const [predicting, setPredicting] = useState(false);
  const [predictedCollisionRisk, setPredictedCollisionRisk] = useState('');
  const [predictedLifespan, setPredictedLifespan] = useState('');
  const [predictionError, setPredictionError] = useState('');
  const [launchYear, setLaunchYear] = useState('');
  const [ageAtPredictionMonths, setAgeAtPredictionMonths] = useState('');
  const [maintenanceCostPerYear, setMaintenanceCostPerYear] = useState('');
  const [componentHealthScore, setComponentHealthScore] = useState('');
  const [satellites, setSatellites] = useState([]); // New state for satellites
  const [selectedSatelliteId, setSelectedSatelliteId] = useState(''); // New state for selected satellite ID
  const [savingPrediction, setSavingPrediction] = useState(false); // New state for saving status

  useEffect(() => {
    const fetchPredictionRecords = async () => {
      try {
        // Fetch all prediction records from the backend
        const response = await fetch('http://localhost:8000/predictions/predictions/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPredictionRecords(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch prediction records:", err);
        setError(err);
        setLoading(false);
      }
    };

    const fetchSatellites = async () => {
        try {
            const response = await fetch('http://localhost:8000/satellites/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSatellites(data);
        } catch (err) {
            console.error("Failed to fetch satellites:", err);
        }
    };

    fetchPredictionRecords();
    fetchSatellites();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
     // Handle numeric fields separately
     let processedValue = value;
     if (name === 'satellite_id' || name === 'lifespan_months') {
        processedValue = parseInt(value) || ''; // Convert to integer
     }

    setCurrentPredictionRecord({ ...currentPredictionRecord, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation for required fields
    if (!currentPredictionRecord.satellite_id || !currentPredictionRecord.status_prediction || currentPredictionRecord.lifespan_months === '' || !currentPredictionRecord.collision_risk) return;

    setIsSubmitting(true);
    setError(null); // Clear previous errors

    const url = currentPredictionRecord.prediction_id === null ? 'http://localhost:8000/predictions/predictions/' : `http://localhost:8000/predictions/predictions/${currentPredictionRecord.prediction_id}`;
    const method = currentPredictionRecord.prediction_id === null ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          satellite_id: currentPredictionRecord.satellite_id,
          status_prediction: currentPredictionRecord.status_prediction,
          lifespan_months: currentPredictionRecord.lifespan_months,
          collision_risk: currentPredictionRecord.collision_risk,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Re-fetch all prediction records to ensure the list is up-to-date
      const fetchResponse = await fetch('http://localhost:8000/predictions/predictions/');
      if (!fetchResponse.ok) {
         throw new Error(`Failed to re-fetch prediction records: HTTP error! status: ${fetchResponse.status}`);
      }
      const updatedPredictionRecords = await fetchResponse.json();
      setPredictionRecords(updatedPredictionRecords);

      setCurrentPredictionRecord({ prediction_id: null, satellite_id: '', status_prediction: '', lifespan_months: '', collision_risk: '' }); // Clear form
      setIsModalOpen(false); // Close modal on submit
    } catch (err) {
      console.error(`Failed to ${method === 'POST' ? 'add' : 'update'} prediction record:`, err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    setCurrentPredictionRecord({ prediction_id: null, satellite_id: '', status_prediction: '', lifespan_months: '', collision_risk: '' }); // Clear for new record
    setIsModalOpen(true);
  };

  const handleEditClick = (record) => {
    setCurrentPredictionRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setPredictionToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (predictionToDeleteId === null) return;

    setError(null); // Clear previous errors

    try {
      const response = await fetch(`http://localhost:8000/predictions/predictions/${predictionToDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Remove the record from the state
      setPredictionRecords(predictionRecords.filter(record => record.prediction_id !== predictionToDeleteId));
      console.log(`Deleted prediction record with id: ${predictionToDeleteId}`);
    } catch (err) {
      console.error(`Failed to delete prediction record with id ${predictionToDeleteId}:`, err);
      setError(err);
    } finally {
      setShowDeleteConfirm(false);
      setPredictionToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setPredictionToDeleteId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPredictionRecord({ prediction_id: null, satellite_id: '', status_prediction: '', lifespan_months: '', collision_risk: '' }); // Clear form on close
  };

   const handleSearch = async () => {
      if (!searchPredictionId) return; // Don't search if input is empty

      setSearching(true);
      setSearchResult(null); // Clear previous results
      setSearchError(null); // Clear previous errors

      try {
          const response = await fetch(`http://localhost:8000/predictions/predictions/${searchPredictionId}`);
          if (response.status === 404) {
              setSearchError('Prediction record not found.');
              setSearchResult(null);
          } else if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
          } else {
              const data = await response.json();
              setSearchResult(data);
          }
      } catch (err) {
          console.error("Failed to search prediction record:", err);
          setSearchError(err.message);
          setSearchResult(null);
      } finally {
          setSearching(false);
      }
  };

  const handlePredictCollisionRisk = async () => {
    if (!satelliteOrbitType || !selectedSatelliteId) {
      setPredictionError('Please select an orbit type and a satellite.');
      return;
    }

    setPredicting(true);
    setPredictionError(null);

    try {
      const response = await fetch('http://localhost:8000/ai/predict/satellite_collision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          satellite_id: parseInt(selectedSatelliteId), // Include selected satellite ID
          orbit_type: satelliteOrbitType,
          launch_year: parseInt(launchYear),
          age_at_prediction_months: parseInt(ageAtPredictionMonths),
          maintenance_cost_usd_per_year: parseFloat(maintenanceCostPerYear),
          component_health_score: parseFloat(componentHealthScore),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPredictedCollisionRisk(data.collision_risk);
      setPredictedLifespan(data.lifespan_months);
    } catch (err) {
      console.error('Failed to predict collision risk:', err);
      setPredictionError(err.message);
    } finally {
      setPredicting(false);
    }
  };

  const handleSavePrediction = async () => {
    if (!predictedCollisionRisk || !predictedLifespan || !selectedSatelliteId) {
      setPredictionError('No prediction to save or satellite not selected.');
      return;
    }

    setSavingPrediction(true);
    setPredictionError(null);

    try {
      const response = await fetch('http://localhost:8000/predictions/predictions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          satellite_id: parseInt(selectedSatelliteId),
          status_prediction: predictedCollisionRisk, // Using collision risk as status_prediction
          lifespan_months: predictedLifespan,
          collision_risk: predictedCollisionRisk,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Prediction saved successfully, re-fetch all records to update the table
      const fetchResponse = await fetch('http://localhost:8000/predictions/predictions/');
      if (!fetchResponse.ok) {
        throw new Error(`Failed to re-fetch prediction records: HTTP error! status: ${fetchResponse.status}`);
      }
      const updatedPredictionRecords = await fetchResponse.json();
      setPredictionRecords(updatedPredictionRecords);

      // Clear prediction results after saving
      setPredictedCollisionRisk('');
      setPredictedLifespan('');
      setSelectedSatelliteId(''); // Clear selected satellite

      alert('Prediction saved successfully!');
    } catch (err) {
      console.error('Failed to save prediction:', err);
      setPredictionError(err.message);
    } finally {
      setSavingPrediction(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Loading prediction records...</div>;
  }

  // Display error if initial fetch failed and list is empty
  if (error && predictionRecords.length === 0 && !searching) {
    return <div className="p-6 text-red-500">Error loading prediction records: {error.message}</div>;
  }

  return (
    <div className="pt-14 p-6 text-white nasa-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Predictions Management</h1>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-800/80 text-white p-4 rounded-lg mb-4">
              Error: {error.message}
            </div>
          )}

          {/* Search Prediction Record Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Search Prediction Record by ID</h2>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Enter Prediction ID"
                value={searchPredictionId}
                onChange={(e) => setSearchPredictionId(e.target.value)}
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
                    <h3 className="font-bold text-lg">Found Prediction Record: {searchResult.prediction_id}</h3>
                     <div className="text-sm text-gray-300">Satellite ID: {searchResult.satellite_id}</div>
                     <div className="text-sm text-gray-300">Prediction Date: {searchResult.prediction_date}</div>
                     <div className="text-sm text-gray-300">Status: {searchResult.status_prediction}</div>
                     <div className="text-sm text-gray-300">Lifespan (months): {searchResult.lifespan_months}</div>
                     <div className="text-sm text-gray-300">Collision Risk: {searchResult.collision_risk}</div>
                </div>
            )}

          </div>

          {/* AI-Powered Satellite Prediction Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-white">AI-Powered Satellite Prediction</h2>
            <div className="flex flex-col space-y-4">
              <label htmlFor="satellite_id" className="text-gray-300">Select Satellite:</label>
              <select
                id="satellite_id"
                value={selectedSatelliteId}
                onChange={(e) => setSelectedSatelliteId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="">Select a satellite</option>
                {satellites.map(sat => (
                  <option key={sat.satellite_id} value={sat.satellite_id}>
                    {sat.satellite_name} (ID: {sat.satellite_id})
                  </option>
                ))}
              </select>

              <label htmlFor="orbit_type" className="text-gray-300">Select Orbit Type:</label>
              <select
                id="orbit_type"
                value={satelliteOrbitType}
                onChange={(e) => setSatelliteOrbitType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="">Select an orbit type</option>
                <option value="LEO">Low Earth Orbit (LEO)</option>
                <option value="MEO">Medium Earth Orbit (MEO)</option>
                <option value="GEO">Geostationary Orbit (GEO)</option>
                <option value="OTHER">Other</option>
              </select>

              <label htmlFor="launch_year" className="text-gray-300">Launch Year:</label>
              <input
                type="number"
                id="launch_year"
                value={launchYear}
                onChange={(e) => setLaunchYear(e.target.value)}
                placeholder="e.g., 2020"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />

              <label htmlFor="age_at_prediction_months" className="text-gray-300">Age at Prediction (Months):</label>
              <input
                type="number"
                id="age_at_prediction_months"
                value={ageAtPredictionMonths}
                onChange={(e) => setAgeAtPredictionMonths(e.target.value)}
                placeholder="e.g., 24"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />

              <label htmlFor="maintenance_cost_usd_per_year" className="text-gray-300">Maintenance Cost (USD/Year):</label>
              <input
                type="number"
                id="maintenance_cost_usd_per_year"
                value={maintenanceCostPerYear}
                onChange={(e) => setMaintenanceCostPerYear(e.target.value)}
                placeholder="e.g., 20000"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />

              <label htmlFor="component_health_score" className="text-gray-300">Component Health Score (0.0-1.0):</label>
              <input
                type="number"
                id="component_health_score"
                step="0.01"
                value={componentHealthScore}
                onChange={(e) => setComponentHealthScore(e.target.value)}
                placeholder="e.g., 0.8"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />

              <button
                onClick={handlePredictCollisionRisk}
                className="nasa-button mt-4"
                disabled={predicting}
              >
                {predicting ? 'Predicting...' : 'Predict Collision Risk & Lifespan'}
              </button>
            </div>

            {predictedCollisionRisk && ( /* Display prediction results */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 p-4 bg-gray-700/50 rounded-md text-white border border-gray-600"
              >
                <h3 className="font-bold text-lg mb-2">Prediction Results:</h3>
                <p className="text-sm mb-1">Collision Risk: <span className="font-semibold">{predictedCollisionRisk}</span></p>
                <p className="text-sm">Predicted Lifespan: <span className="font-semibold">{predictedLifespan} months</span></p>
                <button
                  onClick={handleSavePrediction}
                  className="nasa-button mt-4"
                  disabled={savingPrediction}
                >
                  {savingPrediction ? 'Saving...' : 'Save Prediction'}
                </button>
              </motion.div>
            )}
            {predictionError && (
                <div className="text-red-500 mt-4">{predictionError}</div>
            )}
          </div>

          {/* Prediction Summary Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-white">Prediction Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Total Predictions</h3>
                <p className="text-3xl font-extrabold text-blue-400">{predictionRecords.length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">High Collision Risk</h3>
                <p className="text-3xl font-extrabold text-red-400">{predictionRecords.filter(p => p.collision_risk === 'High').length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Low Collision Risk</h3>
                <p className="text-3xl font-extrabold text-green-400">{predictionRecords.filter(p => p.collision_risk === 'Low').length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Medium Collision Risk</h3>
                <p className="text-3xl font-extrabold text-yellow-400">{predictionRecords.filter(p => p.collision_risk === 'Medium').length}</p>
              </div>
            </div>
          </div>

          {/* Predictions Table */}
          <div className="bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Existing Prediction Records</h2>
              <button
                className="nasa-button-sm flex items-center"
                onClick={handleAddClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3h-3a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Record
              </button>
            </div>

            {predictionRecords.length === 0 ? (
              <p>No prediction records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prediction ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Satellite ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prediction Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Lifespan (months)</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Collision Risk</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {predictionRecords.slice(0, 5).map(record => (
                      <tr key={record.prediction_id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{record.prediction_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.satellite_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.prediction_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.status_prediction}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.lifespan_months}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.collision_risk}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-blue-400 hover:text-blue-600 mr-4 transition-colors"
                            onClick={() => handleEditClick(record)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-400 hover:text-red-600 transition-colors"
                            onClick={() => handleDeleteClick(record.prediction_id)}
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

          {/* Future components for analytics or other related features could go here */}
           {/* <PredictionsAnalytics predictionRecords={predictionRecords} /> */}

        </div>
      </div>

      {/* Predictions Form Modal */}
      <PredictionsFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentPredictionRecord={currentPredictionRecord}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-white">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this prediction record?</p>
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

export default PredictionsManage; 