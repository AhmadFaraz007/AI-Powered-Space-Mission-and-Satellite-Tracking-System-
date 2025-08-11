import React from 'react';

const PredictionsFormModal = ({ isOpen, onClose, currentPredictionRecord, handleInputChange, handleSubmit, isSubmitting }) => {
  if (!isOpen) return null;

  // Determine if we are adding or editing
  const isEditing = currentPredictionRecord && currentPredictionRecord.prediction_id !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-white">{isEditing ? 'Edit Prediction Record' : 'Add New Prediction Record'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="satellite_id" className="block text-sm font-medium text-gray-300">Satellite ID</label>
            <input
              type="number"
              id="satellite_id"
              name="satellite_id"
              value={currentPredictionRecord.satellite_id}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="status_prediction" className="block text-sm font-medium text-gray-300">Status Prediction</label>
            <input
              type="text"
              id="status_prediction"
              name="status_prediction"
              value={currentPredictionRecord.status_prediction}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="lifespan_months" className="block text-sm font-medium text-gray-300">Lifespan (months)</label>
            <input
              type="number"
              id="lifespan_months"
              name="lifespan_months"
              value={currentPredictionRecord.lifespan_months}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="collision_risk" className="block text-sm font-medium text-gray-300">Collision Risk</label>
            <input
              type="text"
              id="collision_risk"
              name="collision_risk"
              value={currentPredictionRecord.collision_risk}
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

export default PredictionsFormModal; 