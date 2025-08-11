import React from 'react';

const SystemLogsFormModal = ({ isOpen, onClose, currentLogRecord, handleInputChange, handleSubmit, isSubmitting }) => {
  if (!isOpen) return null;

  // Determine if we are adding or editing
  const isEditing = currentLogRecord && currentLogRecord.log_id !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Log Record' : 'Add New Log Record'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="log_message" className="block text-sm font-medium text-gray-300 mb-2">
              Log Message
            </label>
            <textarea
              id="log_message"
              name="log_message"
              value={currentLogRecord.log_message}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 transition-colors duration-200"
              rows="3"
              placeholder="Enter log message..."
              required
            />
          </div>
          
          <div>
            <label htmlFor="log_level" className="block text-sm font-medium text-gray-300 mb-2">
              Log Level
            </label>
            <select
              id="log_level"
              name="log_level"
              value={currentLogRecord.log_level}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 transition-colors duration-200"
              required
            >
              <option value="">Select a level</option>
              <option value="INFO" className="bg-gray-700">INFO</option>
              <option value="WARNING" className="bg-gray-700">WARNING</option>
              <option value="ERROR" className="bg-gray-700">ERROR</option>
              <option value="DEBUG" className="bg-gray-700">DEBUG</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isEditing ? 'Updating...' : 'Adding...'}
                </span>
              ) : (
                isEditing ? 'Update Record' : 'Add Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemLogsFormModal; 