import React from 'react';

const MissionFormModal = ({
  isOpen,
  onClose,
  currentMission,
  handleInputChange,
  handleSubmit,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition-colors"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-white text-center">
          {currentMission.id === null ? 'Add New Mission' : 'Edit Mission'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="mission_name" className="block text-sm font-medium text-gray-300 mb-1">Mission Name</label>
            <input
              type="text"
              id="mission_name"
              name="mission_name"
              value={currentMission.mission_name}
              onChange={handleInputChange}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="launch_date" className="block text-sm font-medium text-gray-300 mb-1">Launch Date</label>
            <input
              type="date"
              id="launch_date"
              name="launch_date"
              value={currentMission.launch_date}
              onChange={handleInputChange}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="mission_type" className="block text-sm font-medium text-gray-300 mb-1">Mission Type</label>
            <input
              type="text"
              id="mission_type"
              name="mission_type"
              value={currentMission.mission_type}
              onChange={handleInputChange}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={currentMission.status}
              onChange={handleInputChange}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Planned">Planned</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              className="nasa-button"
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
              {currentMission.id === null ? (isSubmitting ? 'Adding...' : 'Add Mission') : (isSubmitting ? 'Updating...' : 'Update Mission')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MissionFormModal; 