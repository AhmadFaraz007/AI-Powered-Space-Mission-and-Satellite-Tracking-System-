import React from 'react';

const GroundStationFormModal = ({ isOpen, onClose, currentGroundStation, handleInputChange, handleSubmit, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full relative text-white">
        <h2 className="text-2xl font-bold mb-4">{currentGroundStation.station_id ? 'Edit Ground Station' : 'Add New Ground Station'}</h2>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
        >
          &times;
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="station_name" className="block text-sm font-medium text-gray-300">Station Name</label>
            <input
              type="text"
              id="station_name"
              name="station_name"
              value={currentGroundStation.station_name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white p-2"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={currentGroundStation.location}
              onChange={handleInputChange}
              required
               className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white p-2"
            />
          </div>
           <div>
            <label htmlFor="contact_frequency" className="block text-sm font-medium text-gray-300">Contact Frequency</label>
            <input
              type="number"
              id="contact_frequency"
              name="contact_frequency"
              value={currentGroundStation.contact_frequency}
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
              {isSubmitting ? 'Saving...' : 'Save Ground Station'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroundStationFormModal; 