import React, { useState, useEffect } from 'react';
import SpaceDebrisFormModal from '../components/SpaceDebrisFormModal';
// Assuming you might have future components for analytics or other related features
// import SpaceDebrisAnalytics from '../components/SpaceDebrisAnalytics';

const SpaceDebrisManage = () => {
  const [debrisRecords, setDebrisRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDebrisRecord, setCurrentDebrisRecord] = useState({
    debris_id: null,
    description: '',
    latitude: '', // Number
    longitude: '', // Number
    size_meters: '', // Number
    risk_level: '', // String
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [debrisToDeleteId, setDebrisToDeleteId] = useState(null);

  // State for search functionality (by ID)
  const [searchDebrisId, setSearchDebrisId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    const fetchDebrisRecords = async () => {
      try {
        // Fetch all space debris records from the backend
        const response = await fetch('http://localhost:8000/space-debris/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDebrisRecords(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch space debris records:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchDebrisRecords();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
     // Handle numeric fields separately
     let processedValue = value;
     if (name === 'latitude' || name === 'longitude' || name === 'size_meters') {
        processedValue = parseFloat(value) || ''; // Convert to float
     }

    setCurrentDebrisRecord({ ...currentDebrisRecord, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation for required fields (description, latitude, longitude, size_meters, risk_level)
    if (!currentDebrisRecord.description || currentDebrisRecord.latitude === '' || currentDebrisRecord.longitude === '' || currentDebrisRecord.size_meters === '' || !currentDebrisRecord.risk_level) return;

    setIsSubmitting(true);
    setError(null); // Clear previous errors

    const url = currentDebrisRecord.debris_id === null ? 'http://localhost:8000/space-debris/' : `http://localhost:8000/space-debris/${currentDebrisRecord.debris_id}`;
    const method = currentDebrisRecord.debris_id === null ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: currentDebrisRecord.description,
          latitude: currentDebrisRecord.latitude,
          longitude: currentDebrisRecord.longitude,
          size_meters: currentDebrisRecord.size_meters,
          risk_level: currentDebrisRecord.risk_level,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Re-fetch all debris records to ensure the list is up-to-date
      const fetchResponse = await fetch('http://localhost:8000/space-debris/');
      if (!fetchResponse.ok) {
         throw new Error(`Failed to re-fetch debris records: HTTP error! status: ${fetchResponse.status}`);
      }
      const updatedDebrisRecords = await fetchResponse.json();
      setDebrisRecords(updatedDebrisRecords);

      setCurrentDebrisRecord({ debris_id: null, description: '', latitude: '', longitude: '', size_meters: '', risk_level: '' }); // Clear form
      setIsModalOpen(false); // Close modal on submit
    } catch (err) {
      console.error(`Failed to ${method === 'POST' ? 'add' : 'update'} debris record:`, err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    setCurrentDebrisRecord({ debris_id: null, description: '', latitude: '', longitude: '', size_meters: '', risk_level: '' }); // Clear for new record
    setIsModalOpen(true);
  };

  const handleEditClick = (record) => {
    setCurrentDebrisRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDebrisToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (debrisToDeleteId === null) return;

    setError(null); // Clear previous errors

    try {
      const response = await fetch(`http://localhost:8000/space-debris/${debrisToDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Remove the record from the state
      setDebrisRecords(debrisRecords.filter(record => record.debris_id !== debrisToDeleteId));
      console.log(`Deleted debris record with id: ${debrisToDeleteId}`);
    } catch (err) {
      console.error(`Failed to delete debris record with id ${debrisToDeleteId}:`, err);
      setError(err);
    } finally {
      setShowDeleteConfirm(false);
      setDebrisToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDebrisToDeleteId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentDebrisRecord({ debris_id: null, description: '', latitude: '', longitude: '', size_meters: '', risk_level: '' }); // Clear form on close
  };

   const handleSearch = async () => {
      if (!searchDebrisId) return; // Don't search if input is empty

      setSearching(true);
      setSearchResult(null); // Clear previous results
      setSearchError(null); // Clear previous errors

      try {
          const response = await fetch(`http://localhost:8000/space-debris/${searchDebrisId}`);
          if (response.status === 404) {
              setSearchError('Debris record not found.');
              setSearchResult(null);
          } else if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
          } else {
              const data = await response.json();
              setSearchResult(data);
          }
      } catch (err) {
          console.error("Failed to search debris record:", err);
          setSearchError(err.message);
          setSearchResult(null);
      } finally {
          setSearching(false);
      }
  };

  // No status badge needed based on schema

  if (loading) {
    return <div className="p-6 text-white">Loading space debris records...</div>;
  }

  // Display error if initial fetch failed and list is empty
  if (error && debrisRecords.length === 0 && !searching) {
    return <div className="p-6 text-red-500">Error loading space debris records: {error.message}</div>;
  }

  return (
    <div className="pt-14 p-6 text-white nasa-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Space Debris Management</h1>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-800/80 text-white p-4 rounded-lg mb-4">
              Error: {error.message}
            </div>
          )}

          {/* Search Space Debris Record Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Search Space Debris Record by ID</h2>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Enter Debris ID"
                value={searchDebrisId}
                onChange={(e) => setSearchDebrisId(e.target.value)}
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
                    <h3 className="font-bold text-lg">Found Debris Record: {searchResult.debris_id}</h3>
                     <div className="text-sm text-gray-300">Description: {searchResult.description}</div>
                     <div className="text-sm text-gray-300">Latitude: {searchResult.latitude || 'N/A'}</div>
                     <div className="text-sm text-gray-300">Longitude: {searchResult.longitude || 'N/A'}</div>
                     <div className="text-sm text-gray-300">Size (meters): {searchResult.size_meters || 'N/A'}</div>
                     <div className="text-sm text-gray-300">Risk Level: {searchResult.risk_level || 'N/A'}</div>
                </div>
            )}

          </div>

          {/* Space Debris Risk Assessment Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-white">Space Debris Risk Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Total Debris Records</h3>
                <p className="text-3xl font-extrabold text-blue-400">{debrisRecords.length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">High Risk Debris</h3>
                <p className="text-3xl font-extrabold text-red-400">{debrisRecords.filter(d => d.risk_level === 'High').length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Medium Risk Debris</h3>
                <p className="text-3xl font-extrabold text-yellow-400">{debrisRecords.filter(d => d.risk_level === 'Medium').length}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-white">Low Risk Debris</h3>
                <p className="text-3xl font-extrabold text-green-400">{debrisRecords.filter(d => d.risk_level === 'Low').length}</p>
              </div>
            </div>
          </div>

          {/* Space Debris Table */}
          <div className="bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Existing Space Debris Records</h2>
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

            {debrisRecords.length === 0 ? (
              <p>No space debris records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Debris ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Latitude</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Longitude</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Size (meters)</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Level</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {debrisRecords.slice(0, 5).map(record => (
                      <tr key={record.debris_id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{record.debris_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.latitude || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.longitude || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.size_meters || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.risk_level || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-blue-400 hover:text-blue-600 mr-4 transition-colors"
                            onClick={() => handleEditClick(record)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-400 hover:text-red-600 transition-colors"
                            onClick={() => handleDeleteClick(record.debris_id)}
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
           {/* <SpaceDebrisAnalytics debrisRecords={debrisRecords} /> */}

        </div>
      </div>

      {/* Space Debris Form Modal */}
      <SpaceDebrisFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentDebrisRecord={currentDebrisRecord}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-white">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this debris record?</p>
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

export default SpaceDebrisManage; 