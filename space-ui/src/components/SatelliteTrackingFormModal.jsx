import React from 'react';

const SatelliteTrackingFormModal = ({ isOpen, onClose, currentTrackingRecord, handleInputChange, handleSubmit, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full relative text-white">
        <h2 className="text-2xl font-bold mb-4">{currentTrackingRecord.track_id ? 'Edit Tracking Record' : 'Add New Tracking Record'}</h2>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
        >
          &times;
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="satellite_id" className="block text-sm font-medium text-gray-300">Satellite ID</label>
            <input
              type="number"
              id="satellite_id"
              name="satellite_id"
              value={currentTrackingRecord.satellite_id}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white p-2"
            />
          </div>
          <div>
            <label htmlFor="station_id" className="block text-sm font-medium text-gray-300">Station ID</label>
            <input
              type="number"
              id="station_id"
              name="station_id"
              value={currentTrackingRecord.station_id}
              onChange={handleInputChange}
              required
               className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white p-2"
            />
          </div>
           <div>
            <label htmlFor="timestamp" className="block text-sm font-medium text-gray-300">Timestamp</label>
            <input
              type="datetime-local"
              id="timestamp"
              name="timestamp"
              value={currentTrackingRecord.timestamp}
              onChange={handleInputChange}
              required
               className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white p-2"
            />
          </div>
           <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-300">Latitude</label>
            <input
              type="number"
              step="0.000001" // Allow decimal input
              id="latitude"
              name="latitude"
              value={currentTrackingRecord.latitude}
              onChange={handleInputChange}
               className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white p-2"
            />
          </div>
           <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-300">Longitude</label>
            <input
              type="number"
               step="0.000001" // Allow decimal input
              id="longitude"
              name="longitude"
              value={currentTrackingRecord.longitude}
              onChange={handleInputChange}
               className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white p-2"
            />
          </div>
           <div>
            <label htmlFor="altitude_km" className="block text-sm font-medium text-gray-300">Altitude (km)</label>
            <input
              type="number"
               step="0.01" // Allow decimal input
              id="altitude_km"
              name="altitude_km"
              value={currentTrackingRecord.altitude_km}
              onChange={handleInputChange}
               className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white p-2"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="nasa-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Tracking Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SatelliteTrackingFormModal; 