import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GroundStationFormModal from '../components/GroundStationFormModal';
// Assuming you might have future components for analytics or other related features
// import GroundStationAnalytics from '../components/GroundStationAnalytics';

const GroundStationsManage = () => {
  const [groundStations, setGroundStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentGroundStation, setCurrentGroundStation] = useState({
    station_id: null,
    station_name: '',
    location: '',
    contact_frequency: '', // Assuming number input
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groundStationToDeleteId, setGroundStationToDeleteId] = useState(null);

  // State for search functionality (by ID)
  const [searchStationId, setSearchStationId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    const fetchGroundStations = async () => {
      try {
        // Fetch all ground stations from the backend
        const response = await fetch('http://localhost:8000/ground-stations/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGroundStations(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch ground stations:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchGroundStations();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
     // Handle contact_frequency as a number
    setCurrentGroundStation({ ...currentGroundStation, [name]: name === 'contact_frequency' ? parseFloat(value) || '' : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentGroundStation.station_name || !currentGroundStation.location) return; // station_name and location are required

    setIsSubmitting(true);
    setError(null); // Clear previous errors

    const url = currentGroundStation.station_id === null ? 'http://localhost:8000/ground-stations/' : `http://localhost:8000/ground-stations/${currentGroundStation.station_id}`;
    const method = currentGroundStation.station_id === null ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          station_name: currentGroundStation.station_name,
          location: currentGroundStation.location,
          contact_frequency: currentGroundStation.contact_frequency || null, // Send null if empty
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Re-fetch all ground stations to ensure the list is up-to-date
      const fetchResponse = await fetch('http://localhost:8000/ground-stations/');
      if (!fetchResponse.ok) {
         throw new Error(`Failed to re-fetch ground stations: HTTP error! status: ${fetchResponse.status}`);
      }
      const updatedGroundStations = await fetchResponse.json();
      setGroundStations(updatedGroundStations);

      setCurrentGroundStation({ station_id: null, station_name: '', location: '', contact_frequency: '' }); // Clear form
      setIsModalOpen(false); // Close modal on submit
    } catch (err) {
      console.error(`Failed to ${method === 'POST' ? 'add' : 'update'} ground station:`, err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    setCurrentGroundStation({ station_id: null, station_name: '', location: '', contact_frequency: '' }); // Clear for new ground station
    setIsModalOpen(true);
  };

  const handleEditClick = (groundStation) => {
    setCurrentGroundStation(groundStation);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setGroundStationToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (groundStationToDeleteId === null) return;

    setError(null); // Clear previous errors

    try {
      const response = await fetch(`http://localhost:8000/ground-stations/${groundStationToDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Remove the ground station from the state
      setGroundStations(groundStations.filter(groundStation => groundStation.station_id !== groundStationToDeleteId));
      console.log(`Deleted ground station with id: ${groundStationToDeleteId}`);
    } catch (err) {
      console.error(`Failed to delete ground station with id ${groundStationToDeleteId}:`, err);
      setError(err);
    } finally {
      setShowDeleteConfirm(false);
      setGroundStationToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setGroundStationToDeleteId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentGroundStation({ station_id: null, station_name: '', location: '', contact_frequency: '' }); // Clear form on close
  };

   const handleSearch = async () => {
      if (!searchStationId) return; // Don't search if input is empty

      setSearching(true);
      setSearchResult(null); // Clear previous results
      setSearchError(null); // Clear previous errors

      try {
          const response = await fetch(`http://localhost:8000/ground-stations/${searchStationId}`);
          if (response.status === 404) {
              setSearchError('Ground station not found.');
              setSearchResult(null);
          } else if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
          } else {
              const data = await response.json();
              setSearchResult(data);
          }
      } catch (err) {
          console.error("Failed to search ground station:", err);
          setSearchError(err.message);
          setSearchResult(null);
      } finally {
          setSearching(false);
      }
  };


  if (loading) {
    return <div className="p-6 text-white">Loading ground stations...</div>;
  }

  // Display error if initial fetch failed and ground stations list is empty
  if (error && groundStations.length === 0 && !searching) {
    return <div className="p-6 text-red-500">Error loading ground stations: {error.message}</div>;
  }

  return (
    <div className="pt-14 p-6 text-white nasa-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Ground Stations Management</h1>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-800/80 text-white p-4 rounded-lg mb-4">
              Error: {error.message}
            </div>
          )}

          {/* Search Ground Station Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Search Ground Station by ID</h2>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Enter Station ID"
                value={searchStationId}
                onChange={(e) => setSearchStationId(e.target.value)}
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
                    <h3 className="font-bold text-lg">Found Ground Station: {searchResult.station_name}</h3>
                    <div className="text-sm text-gray-300">ID: {searchResult.station_id}</div>
                    <div className="text-sm text-gray-300">Location: {searchResult.location}</div>
                    <div className="text-sm text-gray-300">Contact Frequency: {searchResult.contact_frequency || 'N/A'}</div>
                </div>
            )}

          </div>

          {/* Ground Station Overview Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-white">Ground Station Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Total Ground Stations</h3>
                <p className="text-3xl font-extrabold text-blue-400">{groundStations.length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Locations Tracked</h3>
                <p className="text-3xl font-extrabold text-green-400">{[...new Set(groundStations.map(gs => gs.location))].length}</p>
              </div>
            </div>
          </div>

          {/* Ground Stations Table */}
          <div className="bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Existing Ground Stations</h2>
              <button
                className="nasa-button-sm flex items-center"
                onClick={handleAddClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3h-3a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Ground Station
              </button>
            </div>

            {groundStations.length === 0 ? (
              <p>No ground stations found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Station ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Station Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact Frequency</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {groundStations.slice(0, 5).map(groundStation => (
                      <tr key={groundStation.station_id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{groundStation.station_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{groundStation.station_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{groundStation.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{groundStation.contact_frequency || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-blue-400 hover:text-blue-600 mr-4 transition-colors"
                            onClick={() => handleEditClick(groundStation)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-400 hover:text-red-600 transition-colors"
                            onClick={() => handleDeleteClick(groundStation.station_id)}
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
           {/* <GroundStationAnalytics groundStations={groundStations} /> */}

        </div>
      </div>

      {/* Ground Station Form Modal */}
      <GroundStationFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentGroundStation={currentGroundStation}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-white">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this ground station?</p>
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

export default GroundStationsManage; 