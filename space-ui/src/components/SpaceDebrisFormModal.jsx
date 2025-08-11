import React from 'react';

const SpaceDebrisFormModal = ({ isOpen, onClose, currentDebrisRecord, handleInputChange, handleSubmit, isSubmitting }) => {
  if (!isOpen) return null;

  // Determine if we are adding or editing
  const isEditing = currentDebrisRecord && currentDebrisRecord.debris_id !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-white">{isEditing ? 'Edit Space Debris Record' : 'Add New Space Debris Record'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={currentDebrisRecord.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-300">Latitude</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={currentDebrisRecord.latitude}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              step="any"
              required
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-300">Longitude</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={currentDebrisRecord.longitude}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              step="any"
              required
            />
          </div>
          <div>
            <label htmlFor="size_meters" className="block text-sm font-medium text-gray-300">Size (meters)</label>
            <input
              type="number"
              id="size_meters"
              name="size_meters"
              value={currentDebrisRecord.size_meters}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              step="any"
              required
            />
          </div>
          <div>
            <label htmlFor="risk_level" className="block text-sm font-medium text-gray-300">Risk Level</label>
            <input
              type="text"
              id="risk_level"
              name="risk_level"
              value={currentDebrisRecord.risk_level}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="nasa-button-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="nasa-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Record' : 'Add Record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpaceDebrisFormModal; 