import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import SatelliteTrackingFormModal from '../components/SatelliteTrackingFormModal';
// Assuming you might have future components for analytics or other related features
// import SatelliteTrackingAnalytics from '../components/SatelliteTrackingAnalytics';

const SatelliteTrackingManage = () => {
  const [trackingRecords, setTrackingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTrackingRecord, setCurrentTrackingRecord] = useState({
    track_id: null,
    satellite_id: '', // Number, FK
    station_id: '', // Number, FK
    timestamp: '', // Assuming string input for datetime
    latitude: '', // Number
    longitude: '', // Number
    altitude_km: '', // Number
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [trackingRecordToDeleteId, setTrackingRecordToDeleteId] = useState(null);

  // State for search functionality (by ID)
  const [searchTrackId, setSearchTrackId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    const fetchTrackingRecords = async () => {
      try {
        // Fetch all tracking records from the backend
        const response = await fetch('http://localhost:8000/satellite_tracking/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTrackingRecords(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch tracking records:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchTrackingRecords();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
     // Handle numeric fields and timestamp separately if needed
     let processedValue = value;
     if (name === 'satellite_id' || name === 'station_id') {
        processedValue = parseInt(value) || ''; // Convert to integer
     } else if (name === 'latitude' || name === 'longitude' || name === 'altitude_km') {
        processedValue = parseFloat(value) || ''; // Convert to float
     }
     // timestamp can be handled as string for now, backend expects datetime object

    setCurrentTrackingRecord({ ...currentTrackingRecord, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation for required fields (satellite_id, station_id, timestamp)
    if (currentTrackingRecord.satellite_id === '' || currentTrackingRecord.station_id === '' || currentTrackingRecord.timestamp === '') return;

    setIsSubmitting(true);
    setError(null); // Clear previous errors

    const url = currentTrackingRecord.track_id === null ? 'http://localhost:8000/satellite_tracking/' : `http://localhost:8000/satellite_tracking/${currentTrackingRecord.track_id}`;
    const method = currentTrackingRecord.track_id === null ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          satellite_id: currentTrackingRecord.satellite_id,
          station_id: currentTrackingRecord.station_id,
          timestamp: currentTrackingRecord.timestamp, // Ensure format matches backend expectation (ISO 8601)
          latitude: currentTrackingRecord.latitude || null,
          longitude: currentTrackingRecord.longitude || null,
          altitude_km: currentTrackingRecord.altitude_km || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Re-fetch all tracking records to ensure the list is up-to-date
      const fetchResponse = await fetch('http://localhost:8000/satellite_tracking/');
      if (!fetchResponse.ok) {
         throw new Error(`Failed to re-fetch tracking records: HTTP error! status: ${fetchResponse.status}`);
      }
      const updatedTrackingRecords = await fetchResponse.json();
      setTrackingRecords(updatedTrackingRecords);

      setCurrentTrackingRecord({ track_id: null, satellite_id: '', station_id: '', timestamp: '', latitude: '', longitude: '', altitude_km: '' }); // Clear form
      setIsModalOpen(false); // Close modal on submit
    } catch (err) {
      console.error(`Failed to ${method === 'POST' ? 'add' : 'update'} tracking record:`, err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    setCurrentTrackingRecord({ track_id: null, satellite_id: '', station_id: '', timestamp: '', latitude: '', longitude: '', altitude_km: '' }); // Clear for new record
    setIsModalOpen(true);
  };

  const handleEditClick = (record) => {
    // Need to format timestamp correctly for the datetime-local input if using it
    // For now, assuming backend sends/expects ISO 8601 string
    setCurrentTrackingRecord({
        ...record,
        timestamp: record.timestamp ? new Date(record.timestamp).toISOString().slice(0, 16) : '' // Format for datetime-local input
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setTrackingRecordToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (trackingRecordToDeleteId === null) return;

    setError(null); // Clear previous errors

    try {
      const response = await fetch(`http://localhost:8000/satellite_tracking/${trackingRecordToDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Remove the record from the state
      setTrackingRecords(trackingRecords.filter(record => record.track_id !== trackingRecordToDeleteId));
      console.log(`Deleted tracking record with id: ${trackingRecordToDeleteId}`);
    } catch (err) {
      console.error(`Failed to delete tracking record with id ${trackingRecordToDeleteId}:`, err);
      setError(err);
    } finally {
      setShowDeleteConfirm(false);
      setTrackingRecordToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setTrackingRecordToDeleteId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTrackingRecord({ track_id: null, satellite_id: '', station_id: '', timestamp: '', latitude: '', longitude: '', altitude_km: '' }); // Clear form on close
  };

   const handleSearch = async () => {
      if (!searchTrackId) return; // Don't search if input is empty

      setSearching(true);
      setSearchResult(null); // Clear previous results
      setSearchError(null); // Clear previous errors

      try {
          const response = await fetch(`http://localhost:8000/satellite_tracking/${searchTrackId}`);
          if (response.status === 404) {
              setSearchError('Tracking record not found.');
              setSearchResult(null);
          } else if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
          } else {
              const data = await response.json();
              setSearchResult(data);
          }
      } catch (err) {
          console.error("Failed to search tracking record:", err);
          setSearchError(err.message);
          setSearchResult(null);
      } finally {
          setSearching(false);
      }
  };


  if (loading) {
    return <div className="p-6 text-white">Loading satellite tracking records...</div>;
  }

  // Display error if initial fetch failed and list is empty
  if (error && trackingRecords.length === 0 && !searching) {
    return <div className="p-6 text-red-500">Error loading satellite tracking records: {error.message}</div>;
  }

  return (
    <div className="pt-14 p-6 text-white nasa-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Satellite Tracking Management</h1>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-800/80 text-white p-4 rounded-lg mb-4">
              Error: {error.message}
            </div>
          )}

          {/* Search Tracking Record Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Search Tracking Record by ID</h2>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Enter Track ID"
                value={searchTrackId}
                onChange={(e) => setSearchTrackId(e.target.value)}
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
                    <h3 className="font-bold text-lg">Found Tracking Record: {searchResult.track_id}</h3>
                     <div className="text-sm text-gray-300">Satellite ID: {searchResult.satellite_id}</div>
                     <div className="text-sm text-gray-300">Station ID: {searchResult.station_id}</div>
                     <div className="text-sm text-gray-300">Timestamp: {searchResult.timestamp}</div>
                     <div className="text-sm text-gray-300">Latitude: {searchResult.latitude || 'N/A'}</div>
                     <div className="text-sm text-gray-300">Longitude: {searchResult.longitude || 'N/A'}</div>
                     <div className="text-sm text-gray-300">Altitude (km): {searchResult.altitude_km || 'N/A'}</div>
                </div>
            )}

          </div>

          {/* Tracked Objects Summary Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-white">Tracked Objects Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Total Tracking Records</h3>
                <p className="text-3xl font-extrabold text-blue-400">{trackingRecords.length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Unique Satellites Tracked</h3>
                <p className="text-3xl font-extrabold text-purple-400">{[...new Set(trackingRecords.map(r => r.satellite_id))].length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Unique Ground Stations Used</h3>
                <p className="text-3xl font-extrabold text-green-400">{[...new Set(trackingRecords.map(r => r.station_id))].length}</p>
              </div>
            </div>
          </div>

          {/* Satellite Tracking Table */}
          <div className="bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Existing Tracking Records</h2>
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

            {trackingRecords.length === 0 ? (
              <p>No tracking records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Track ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Satellite ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Station ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Latitude</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Longitude</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Altitude (km)</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {trackingRecords.slice(0, 5).map(record => (
                      <tr key={record.track_id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{record.track_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.satellite_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.station_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.timestamp}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.latitude || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.longitude || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.altitude_km || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-blue-400 hover:text-blue-600 mr-4 transition-colors"
                            onClick={() => handleEditClick(record)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-400 hover:text-red-600 transition-colors"
                            onClick={() => handleDeleteClick(record.track_id)}
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
           {/* <SatelliteTrackingAnalytics trackingRecords={trackingRecords} /> */}

        </div>
      </div>

      {/* Satellite Tracking Form Modal */}
      <SatelliteTrackingFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentTrackingRecord={currentTrackingRecord}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-white">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this tracking record?</p>
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

export default SatelliteTrackingManage;
