import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SatelliteFormModal from '../components/SatelliteFormModal';
// Assuming you might have future components for analytics or other satellite related features
// import SatelliteAnalytics from '../components/SatelliteAnalytics';

const SatellitesManage = () => {
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSatellite, setCurrentSatellite] = useState({
    satellite_id: null,
    satellite_name: '',
    launch_date: '', // Assuming date input will handle YYYY-MM-DD
    orbit_type: '',
    mission_id: '', // This will need to be handled carefully for the FK relationship
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [satelliteToDeleteId, setSatelliteToDeleteId] = useState(null);

  // State for search functionality (by ID)
  const [searchSatelliteId, setSearchSatelliteId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    const fetchSatellites = async () => {
      try {
        // Fetch satellites joined with mission data from the backend
        const response = await fetch('http://localhost:8000/satellites/with-mission');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSatellites(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch satellites:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchSatellites();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
     // Handle mission_id as a number
    setCurrentSatellite({ ...currentSatellite, [name]: name === 'mission_id' ? parseInt(value) || '' : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentSatellite.satellite_name || currentSatellite.mission_id === '') return; // satellite_name is NOT NULL, mission_id is NOT NULL

    setIsSubmitting(true);
    setError(null); // Clear previous errors

    const url = currentSatellite.satellite_id === null ? 'http://localhost:8000/satellites/' : `http://localhost:8000/satellites/${currentSatellite.satellite_id}`;
    const method = currentSatellite.satellite_id === null ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          satellite_name: currentSatellite.satellite_name,
          launch_date: currentSatellite.launch_date || null, // Send null if empty
          orbit_type: currentSatellite.orbit_type || null, // Send null if empty
          mission_id: currentSatellite.mission_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Re-fetch all satellites to ensure the list is up-to-date
      const fetchResponse = await fetch('http://localhost:8000/satellites/');
      if (!fetchResponse.ok) {
         throw new Error(`Failed to re-fetch satellites: HTTP error! status: ${fetchResponse.status}`);
      }
      const updatedSatellites = await fetchResponse.json();
      setSatellites(updatedSatellites);

      setCurrentSatellite({ satellite_id: null, satellite_name: '', launch_date: '', orbit_type: '', mission_id: '' }); // Clear form
      setIsModalOpen(false); // Close modal on submit
    } catch (err) {
      console.error(`Failed to ${method === 'POST' ? 'add' : 'update'} satellite:`, err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    setCurrentSatellite({ satellite_id: null, satellite_name: '', launch_date: '', orbit_type: '', mission_id: '' }); // Clear for new satellite
    setIsModalOpen(true);
  };

  const handleEditClick = (satellite) => {
    // We need to pass the satellite object including mission details for display
    // but the form expects the structure returned by /satellites/, which has mission_id
    // Let's create a simplified object for the form based on the joined data
    setCurrentSatellite({
      satellite_id: satellite.satellite_id,
      satellite_name: satellite.satellite_name,
      launch_date: satellite.launch_date || '', // Use empty string for date input if null
      orbit_type: satellite.orbit_type || '', // Use empty string if null
      mission_id: satellite.mission_id, // The form expects mission_id
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setSatelliteToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (satelliteToDeleteId === null) return;

    setError(null); // Clear previous errors

    try {
      const response = await fetch(`http://localhost:8000/satellites/${satelliteToDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Remove the satellite from the state
      setSatellites(satellites.filter(satellite => satellite.satellite_id !== satelliteToDeleteId));
      console.log(`Deleted satellite with id: ${satelliteToDeleteId}`);
    } catch (err) {
      console.error(`Failed to delete satellite with id ${satelliteToDeleteId}:`, err);
      setError(err);
    } finally {
      setShowDeleteConfirm(false);
      setSatelliteToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setSatelliteToDeleteId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSatellite({ satellite_id: null, satellite_name: '', launch_date: '', orbit_type: '', mission_id: '' }); // Clear form on close
  };

  const handleSearch = async () => {
      if (!searchSatelliteId) return; // Don't search if input is empty

      setSearching(true);
      setSearchResult(null); // Clear previous results
      setSearchError(null); // Clear previous errors

      try {
          const response = await fetch(`http://localhost:8000/satellites/${searchSatelliteId}`);
          if (response.status === 404) {
              setSearchError('Satellite not found.');
              setSearchResult(null);
          } else if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
          } else {
              const data = await response.json();
              setSearchResult(data);
          }
      } catch (err) {
          console.error("Failed to search satellite:", err);
          setSearchError(err.message);
          setSearchResult(null);
      } finally {
          setSearching(false);
      }
  };

  // No status badge needed based on schema

  if (loading) {
    return <div className="p-6 text-white">Loading satellites...</div>;
  }

  // Display error if initial fetch failed and satellites list is empty
  if (error && satellites.length === 0 && !searching) {
    return <div className="p-6 text-red-500">Error loading satellites: {error.message}</div>;
  }

  return (
    <div className="pt-14 p-6 text-white nasa-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Satellites Management</h1>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-800/80 text-white p-4 rounded-lg mb-4">
              Error: {error.message}
            </div>
          )}

           {/* Search Satellite Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Search Satellite by ID</h2>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Enter Satellite ID"
                value={searchSatelliteId}
                onChange={(e) => setSearchSatelliteId(e.target.value)}
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
                    <h3 className="font-bold text-lg">Found Satellite: {searchResult.satellite_name}</h3>
                    <div className="text-sm text-gray-300">ID: {searchResult.satellite_id}</div>
                    <div className="text-sm text-gray-300">Launch Date: {searchResult.launch_date || 'N/A'}</div>
                    <div className="text-sm text-gray-300">Orbit Type: {searchResult.orbit_type || 'N/A'}</div>
                    <div className="text-sm text-gray-300">Mission ID: {searchResult.mission_id}</div>
                </div>
            )}

          </div>

          {/* Satellite Statistics Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-white">Satellite Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Total Satellites</h3>
                <p className="text-3xl font-extrabold text-blue-400">{satellites.length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Low Earth Orbit (LEO)</h3>
                <p className="text-3xl font-extrabold text-purple-400">{satellites.filter(s => s.orbit_type === 'LEO').length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Geostationary Orbit (GEO)</h3>
                <p className="text-3xl font-extrabold text-green-400">{satellites.filter(s => s.orbit_type === 'GEO').length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Medium Earth Orbit (MEO)</h3>
                <p className="text-3xl font-extrabold text-red-400">{satellites.filter(s => s.orbit_type === 'MEO').length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Other Orbit Types</h3>
                <p className="text-3xl font-extrabold text-yellow-400">{satellites.filter(s => s.orbit_type !== 'LEO' && s.orbit_type !== 'GEO' && s.orbit_type !== 'MEO' && s.orbit_type !== null).length}</p>
              </div>
            </div>
          </div>

          {/* Satellites Table */}
          <div className="bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Existing Satellites</h2>
              <button
                className="nasa-button-sm flex items-center"
                onClick={handleAddClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3h-3a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Satellite
              </button>
            </div>

            {satellites.length === 0 ? (
              <p>No satellites found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Satellite ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Satellite Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Launch Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Orbit Type</th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mission</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {satellites.slice(0, 5).map(satellite => (
                      <tr key={satellite.satellite_id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{satellite.satellite_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{satellite.satellite_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{satellite.launch_date || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{satellite.orbit_type || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{satellite.mission_name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-blue-400 hover:text-blue-600 mr-4 transition-colors"
                            onClick={() => handleEditClick(satellite)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-400 hover:text-red-600 transition-colors"
                            onClick={() => handleDeleteClick(satellite.satellite_id)}
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

          {/* Interesting Satellite Facts Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Beyond Our Database: Famous Satellites</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                The history of space exploration is marked by incredible satellite achievements. The first artificial satellite,
                 **Sputnik 1**, launched by the Soviet Union in 1957, marked the beginning of the Space Age. Its simple radio signals captivated the world and spurred advancements in science and technology.
              </p>
              <p>
                NASA has also launched numerous groundbreaking satellites. The **Hubble Space Telescope** has revolutionized our understanding of the universe with its stunning images. The **International Space Station (ISS)**, while a habitat, is also a massive satellite and a hub for scientific research in microgravity.
              </p>
              <p>
                 These are just a few examples of how satellites have expanded our knowledge and capabilities in space.
              </p>
            </div>
          </div>

          {/* Future components for analytics or joined data could go here */}
           {/* <SatelliteAnalytics satellites={satellites} /> */}

        </div>
      </div>

      {/* Satellite Form Modal */}
      <SatelliteFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentSatellite={currentSatellite}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-white">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this satellite?</p>
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

export default SatellitesManage; 