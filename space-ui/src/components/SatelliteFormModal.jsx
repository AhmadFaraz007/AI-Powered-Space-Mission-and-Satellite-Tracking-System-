import React from 'react';

const SatelliteFormModal = ({ isOpen, onClose, currentSatellite, handleInputChange, handleSubmit, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full relative text-white">
        <h2 className="text-2xl font-bold mb-4">{currentSatellite.satellite_id ? 'Edit Satellite' : 'Add New Satellite'}</h2>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
        >
          &times;
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="satellite_name" className="block text-sm font-medium text-gray-300">Satellite Name</label>
            <input
              type="text"
              id="satellite_name"
              name="satellite_name"
              value={currentSatellite.satellite_name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white p-2"
            />
          </div>
          <div>
            <label htmlFor="launch_date" className="block text-sm font-medium text-gray-300">Launch Date</label>
            <input
              type="date"
              id="launch_date"
              name="launch_date"
              value={currentSatellite.launch_date}
              onChange={handleInputChange}
               className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white p-2"
            />
          </div>
           <div>
            <label htmlFor="orbit_type" className="block text-sm font-medium text-gray-300">Orbit Type</label>
            <input
              type="text"
              id="orbit_type"
              name="orbit_type"
              value={currentSatellite.orbit_type}
              onChange={handleInputChange}
               className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white p-2"
            />
          </div>
          <div>
            <label htmlFor="mission_id" className="block text-sm font-medium text-gray-300">Mission ID</label>
            <input
              type="number"
              id="mission_id"
              name="mission_id"
              value={currentSatellite.mission_id}
              onChange={handleInputChange}
              required
               className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white p-2"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="nasa-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Satellite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SatelliteFormModal; 